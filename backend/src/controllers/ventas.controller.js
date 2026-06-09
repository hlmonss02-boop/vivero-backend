const pool = require('../config/db');
const { getPorcentajeActual } = require('./ahorros.controller');

// Generar folio
const generarFolio = () => {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `VIV-${año}${mes}${dia}-${random}`;
};

// ==================== REGISTRAR VENTA ====================
// ==================== REGISTRAR VENTA (NUEVA LÓGICA) ====================
const registrarVenta = async (req, res) => {
    const {
        carrito,
        total_pagado,
        metodo_pago,
        id_usuario,
        cliente_nombre,
        cliente_telefono
    } = req.body;

    if (!carrito || carrito.length === 0) {
        return res.status(400).json({ error: 'El carrito está vacío' });
    }

    if (!metodo_pago || !id_usuario) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    try {
        // Verificar stock y calcular costos totales
        let costoTotal = 0;
        
        for (const item of carrito) {
            const stockResult = await pool.query(
                'SELECT stock, nombre, costo_compra FROM plantas WHERE id_planta = $1',
                [item.id_planta]
            );

            if (stockResult.rows.length === 0) {
                return res.status(404).json({ error: `Planta no encontrada` });
            }

            if (stockResult.rows[0].stock < item.cantidad_real) {
                return res.status(400).json({
                    error: `Stock insuficiente para ${stockResult.rows[0].nombre}. Disponible: ${stockResult.rows[0].stock}, Solicitado: ${item.cantidad_real}`
                });
            }
            
            const costoPlanta = (stockResult.rows[0].costo_compra || 0) * item.cantidad_real;
            costoTotal += costoPlanta;
        }

        // Obtener porcentaje de ahorro actual
        const porcentajeAhorro = await getPorcentajeActual();
        
        // 🔥 NUEVA LÓGICA
        const comision = total_pagado * 0.30;
        const gananciaBruta = total_pagado - costoTotal - comision;
        const ahorro = gananciaBruta * (porcentajeAhorro / 100);
        const gananciaReal = gananciaBruta - ahorro;

        const folio_ticket = generarFolio();

        const ventaResult = await pool.query(
            `INSERT INTO ventas (folio_ticket, fecha_servidor, total_pagado, metodo_pago, id_usuario, cliente_nombre, cliente_telefono)
             VALUES ($1, NOW() AT TIME ZONE 'America/Mexico_City', $2, $3, $4, $5, $6)
             RETURNING *`,
            [folio_ticket, total_pagado, metodo_pago, id_usuario, cliente_nombre || null, cliente_telefono || null]
        );

        const venta = ventaResult.rows[0];
        const fechaVenta = venta.fecha_servidor; // ✅ Fecha correcta de México

        for (const item of carrito) {
            await pool.query(
                `INSERT INTO detalle_venta (id_venta, id_planta, cantidad, precio_pactado, subtotal, unidad_medida)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [venta.id_venta, item.id_planta, item.cantidad_real, item.precio_pactado, item.subtotal, item.unidad_medida]
            );

            await pool.query(
                `UPDATE plantas SET stock = stock - $1 WHERE id_planta = $2`,
                [item.cantidad_real, item.id_planta]
            );
        }

        await pool.query(
            `INSERT INTO ahorros (fecha, porcentaje, monto_ahorrado, destino, id_venta)
             VALUES (CURRENT_DATE AT TIME ZONE 'America/Mexico_City', $1, $2, 'Renta', $3)`,
            [porcentajeAhorro, ahorro, venta.id_venta]
        );

        res.status(201).json({
            success: true,
            mensaje: 'Venta registrada exitosamente',
            venta: venta,
            folio: folio_ticket,
            calculos: {
                total_venta: total_pagado,
                costo_total: costoTotal,
                comision: comision,
                ganancia_bruta: gananciaBruta,
                ahorro_porcentaje: porcentajeAhorro,
                ahorro_monto: ahorro,
                ganancia_real: gananciaReal
            }
        });

    } catch (error) {
        console.error('Error al registrar venta:', error);
        res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
    }
};

// ==================== OBTENER VENTAS DEL DÍA ====================
const getVentasHoy = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT COUNT(*) as total_ventas, COALESCE(SUM(total_pagado), 0) as total_ingresos
             FROM ventas 
             WHERE DATE(fecha_servidor) = CURRENT_DATE AT TIME ZONE 'America/Mexico_City'`
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ventas del día' });
    }
};

// ==================== OBTENER VENTAS DEL VENDEDOR ====================
const getMisVentas = async (req, res) => {
    const id_usuario = req.usuario.id_usuario;
    const rol = req.usuario.rol;

    try {
        let query;
        let params;

        if (rol === 'Dueño') {
            query = `
                SELECT v.*, u.nombre as vendedor_nombre,
                       COUNT(dv.id_detalle) as total_productos
                FROM ventas v
                JOIN usuarios u ON v.id_usuario = u.id_usuario
                LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
                GROUP BY v.id_venta, u.nombre
                ORDER BY v.fecha_servidor DESC
            `;
            params = [];
        } else {
            query = `
                SELECT v.*, u.nombre as vendedor_nombre,
                       COUNT(dv.id_detalle) as total_productos
                FROM ventas v
                JOIN usuarios u ON v.id_usuario = u.id_usuario
                LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
                WHERE v.id_usuario = $1
                GROUP BY v.id_venta, u.nombre
                ORDER BY v.fecha_servidor DESC
            `;
            params = [id_usuario];
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
};

// ==================== OBTENER DETALLE DE VENTA ====================
const getDetalleVenta = async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;
    const rol = req.usuario.rol;

    try {
        let ventaQuery;
        let ventaParams;

        if (rol === 'Dueño') {
            ventaQuery = 'SELECT * FROM ventas WHERE id_venta = $1';
            ventaParams = [id];
        } else {
            ventaQuery = 'SELECT * FROM ventas WHERE id_venta = $1 AND id_usuario = $2';
            ventaParams = [id, id_usuario];
        }

        const ventaResult = await pool.query(ventaQuery, ventaParams);

        if (ventaResult.rows.length === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        const detallesResult = await pool.query(
            `SELECT dv.*, p.nombre as planta_nombre, p.unidad_medida, p.costo_compra
             FROM detalle_venta dv
             JOIN plantas p ON dv.id_planta = p.id_planta
             WHERE dv.id_venta = $1`,
            [id]
        );

        res.json({
            venta: ventaResult.rows[0],
            detalles: detallesResult.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener detalle de venta' });
    }
};

// ==================== GANANCIAS POR PLANTA ====================
const getGananciasPorPlanta = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                p.id_planta,
                p.nombre,
                p.categoria,
                p.precio_base,
                p.costo_compra,
                p.stock as stock_actual,
                COALESCE(SUM(dv.cantidad), 0) as cantidad_vendida,
                COALESCE(SUM(dv.subtotal), 0) as total_vendido,
                COALESCE(SUM(dv.cantidad * p.costo_compra), 0) as costo_total,
                COALESCE(SUM(dv.subtotal) - SUM(dv.cantidad * p.costo_compra), 0) as ganancia
             FROM plantas p
             LEFT JOIN detalle_venta dv ON p.id_planta = dv.id_planta
             GROUP BY p.id_planta, p.nombre, p.categoria, p.precio_base, p.costo_compra, p.stock
             ORDER BY total_vendido DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener ganancias por planta:', error);
        res.status(500).json({ error: 'Error al obtener ganancias por planta' });
    }
};

// ==================== CALCULAR GANANCIA ANTES DE VENDER ====================
const calcularGananciaPreview = async (req, res) => {
    const { carrito, total_pagado } = req.body;

    try {
        let costoTotal = 0;
        
        for (const item of carrito) {
            const plantaResult = await pool.query(
                'SELECT costo_compra FROM plantas WHERE id_planta = $1',
                [item.id_planta]
            );
            if (plantaResult.rows.length > 0) {
                costoTotal += (plantaResult.rows[0].costo_compra || 0) * item.cantidad_real;
            }
        }

        const porcentajeAhorro = await getPorcentajeActual();
        const comision = total_pagado * 0.30;
        const gananciaBruta = total_pagado - costoTotal - comision;
        const ahorro = gananciaBruta * (porcentajeAhorro / 100);
        const gananciaReal = gananciaBruta - ahorro;

        res.json({
            ganancia_real: gananciaReal,
            ganancia_bruta: gananciaBruta,
            ahorro: ahorro,
            comision: comision,
            porcentaje_ahorro: porcentajeAhorro,
            es_perdida: gananciaReal < 0
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al calcular ganancia' });
    }
};
// ==================== GANANCIAS REALES POR PLANTA (NUEVA LÓGICA) ====================
const getGananciasRealesPorPlanta = async (req, res) => {
    try {
        const configResult = await pool.query('SELECT porcentaje FROM config_ahorros LIMIT 1');
        const porcentajeAhorroActual = parseFloat(configResult.rows[0]?.porcentaje || 20);
        const porcentajeComision = 30;

        const query = `
            SELECT 
                p.id_planta,
                p.nombre,
                p.categoria,
                p.stock as stock_actual,
                COALESCE(SUM(dv.cantidad), 0) as cantidad_vendida,
                COALESCE(SUM(dv.subtotal), 0) as total_vendido,
                COALESCE(SUM(dv.cantidad * p.costo_compra), 0) as costo_total,
                COALESCE(SUM(dv.subtotal) * 0.30, 0) as comision_total,
                -- 🔥 NUEVO CÁLCULO: Ahorro sobre la ganancia bruta
                COALESCE(
                    (COALESCE(SUM(dv.subtotal), 0) - 
                     COALESCE(SUM(dv.cantidad * p.costo_compra), 0) - 
                     COALESCE(SUM(dv.subtotal) * 0.30, 0)
                    ) * ($1 / 100), 0
                ) as ahorro_total,
                -- 🔥 NUEVO CÁLCULO: Ganancia Real = Ganancia Bruta - Ahorro
                COALESCE(
                    (COALESCE(SUM(dv.subtotal), 0) - 
                     COALESCE(SUM(dv.cantidad * p.costo_compra), 0) - 
                     COALESCE(SUM(dv.subtotal) * 0.30, 0)
                    ) * (1 - $1 / 100), 0
                ) as ganancia_real
             FROM plantas p
             LEFT JOIN detalle_venta dv ON p.id_planta = dv.id_planta
             GROUP BY p.id_planta, p.nombre, p.categoria, p.stock
             ORDER BY ganancia_real DESC
        `;

        const result = await pool.query(query, [porcentajeAhorroActual]);
        
        res.json({
            plantas: result.rows,
            porcentaje_ahorro_actual: porcentajeAhorroActual,
            porcentaje_comision: porcentajeComision,
            nota: "Ahorro calculado sobre la ganancia bruta (venta - costo - comision)"
        });
    } catch (error) {
        console.error('Error al obtener ganancias reales:', error);
        res.status(500).json({ error: 'Error al obtener ganancias reales' });
    }
};

// ==================== VENTAS POR DÍA (GRÁFICA) ====================
const getVentasPorDia = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                DATE(fecha_servidor) as fecha,
                COUNT(*) as total_ventas,
                COALESCE(SUM(total_pagado), 0) as total_ingresos
             FROM ventas
             WHERE fecha_servidor >= (CURRENT_DATE AT TIME ZONE 'America/Mexico_City' - INTERVAL '7 days')
             GROUP BY DATE(fecha_servidor)
             ORDER BY fecha ASC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ventas por día' });
    }
};

// ==================== PRODUCTOS MÁS VENDIDOS ====================
const getProductosMasVendidos = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                p.nombre,
                COALESCE(SUM(dv.cantidad), 0) as total_vendido,
                COALESCE(SUM(dv.subtotal), 0) as total_ingresos
             FROM plantas p
             LEFT JOIN detalle_venta dv ON p.id_planta = dv.id_planta
             GROUP BY p.id_planta, p.nombre
             ORDER BY total_vendido DESC
             LIMIT 5`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos más vendidos' });
    }
};

// ==================== ELIMINAR VENTA ====================
const eliminarVenta = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    if (usuario.rol !== 'Dueño') {
        return res.status(403).json({ error: 'No autorizado. Solo el dueño puede eliminar ventas.' });
    }

    try {
        await pool.query('DELETE FROM ahorros WHERE id_venta = $1', [id]);
        await pool.query('DELETE FROM detalle_venta WHERE id_venta = $1', [id]);
        const result = await pool.query('DELETE FROM ventas WHERE id_venta = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        res.json({ mensaje: 'Venta eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar venta:', error);
        res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
    }
};

// ==================== EXPORTAR ====================
module.exports = {
    registrarVenta,
    getVentasHoy,
    getGananciasPorPlanta,
    getGananciasRealesPorPlanta,
    getMisVentas,
    getDetalleVenta,
    getVentasPorDia,
    getProductosMasVendidos,
    eliminarVenta
};