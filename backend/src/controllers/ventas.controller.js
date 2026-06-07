const pool = require('../config/db');

// Generar folio más fácil de entender
const generarFolio = () => {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `VIV-${año}${mes}${dia}-${random}`;
};

// Registrar una nueva venta
const registrarVenta = async (req, res) => {
    const {
        carrito,
        total_pagado,
        metodo_pago,
        id_usuario,
        cliente_nombre,
        cliente_telefono
    } = req.body;

    // Validaciones
    if (!carrito || carrito.length === 0) {
        return res.status(400).json({ error: 'El carrito está vacío' });
    }

    if (!metodo_pago || !id_usuario) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    try {
        // Verificar stock antes de vender
        for (const item of carrito) {
            const stockResult = await pool.query(
                'SELECT stock, nombre FROM plantas WHERE id_planta = $1',
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
        }

        // 🔥 Obtener porcentaje de ahorro actual desde la BD
        const porcentajeAhorro = await getPorcentajeActual();
        const monto_ahorrado = total_pagado * (porcentajeAhorro / 100);

        const folio_ticket = generarFolio();

        const ventaResult = await pool.query(
            `INSERT INTO ventas (folio_ticket, fecha_servidor, total_pagado, metodo_pago, id_usuario, cliente_nombre, cliente_telefono)
             VALUES ($1, NOW(), $2, $3, $4, $5, $6)
             RETURNING *`,
            [folio_ticket, total_pagado, metodo_pago, id_usuario, cliente_nombre || null, cliente_telefono || null]
        );

        const venta = ventaResult.rows[0];

        // Insertar detalles y actualizar stock
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

        //Guardar el ahorro con el porcentaje actual
        await pool.query(
            `INSERT INTO ahorros (fecha, porcentaje, monto_ahorrado, destino, id_venta)
             VALUES (CURRENT_DATE, $1, $2, 'Renta', $3)`,
            [porcentajeAhorro, monto_ahorrado, venta.id_venta]
        );

        // Actualizar total ahorrado en la tabla de resumen (opcional)
        // Esta tabla la puedes crear si quieres tener un acumulado rápido
        await pool.query(
            `INSERT INTO resumen_ahorros (fecha, total_ahorrado)
             VALUES (CURRENT_DATE, (
                SELECT COALESCE(SUM(monto_ahorrado), 0) FROM ahorros WHERE fecha <= CURRENT_DATE
             ))
             ON CONFLICT (fecha) DO UPDATE SET total_ahorrado = EXCLUDED.total_ahorrado`
        );

        res.status(201).json({
            success: true,
            mensaje: 'Venta registrada exitosamente',
            venta: venta,
            folio: folio_ticket,
            ahorro: {
                porcentaje: porcentajeAhorro,
                monto: monto_ahorrado
            }
        });

    } catch (error) {
        console.error('Error al registrar venta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const getGananciasRealesPorPlanta = async (req, res) => {
    try {
        // Obtener porcentaje de ahorro actual (solo para referencia)
        const configResult = await pool.query('SELECT porcentaje FROM config_ahorros LIMIT 1');
        const porcentajeAhorroActual = parseFloat(configResult.rows[0]?.porcentaje || 20);
        const porcentajeComision = 30;

        // Calcular ganancias basadas en VENTAS REALES (cada venta tiene su propio porcentaje)
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
                COALESCE((
                    SELECT SUM(a.monto_ahorrado) 
                    FROM ahorros a 
                    WHERE a.id_venta IN (
                        SELECT v.id_venta FROM ventas v
                        JOIN detalle_venta dv2 ON v.id_venta = dv2.id_venta
                        WHERE dv2.id_planta = p.id_planta
                    )
                ), 0) as ahorro_total,
                COALESCE(SUM(dv.subtotal), 0) - 
                COALESCE(SUM(dv.cantidad * p.costo_compra), 0) - 
                COALESCE(SUM(dv.subtotal) * 0.30, 0) - 
                COALESCE((
                    SELECT SUM(a.monto_ahorrado) 
                    FROM ahorros a 
                    WHERE a.id_venta IN (
                        SELECT v.id_venta FROM ventas v
                        JOIN detalle_venta dv2 ON v.id_venta = dv2.id_venta
                        WHERE dv2.id_planta = p.id_planta
                    )
                ), 0) as ganancia_real
             FROM plantas p
             LEFT JOIN detalle_venta dv ON p.id_planta = dv.id_planta
             GROUP BY p.id_planta, p.nombre, p.categoria, p.stock
             ORDER BY ganancia_real DESC
        `;

        const result = await pool.query(query);
        res.json({
            plantas: result.rows,
            porcentaje_ahorro_actual: porcentajeAhorroActual,
            porcentaje_comision: porcentajeComision,
            nota: "Los ahorros mostrados son los que se registraron en cada venta con su porcentaje correspondiente"
        });
    } catch (error) {
        console.error('Error al obtener ganancias reales:', error);
        res.status(500).json({ error: 'Error al obtener ganancias reales' });
    }
};

// Obtener ventas del día
const getVentasHoy = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT COUNT(*) as total_ventas, COALESCE(SUM(total_pagado), 0) as total_ingresos
             FROM ventas 
             WHERE DATE(fecha_servidor) = CURRENT_DATE`
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ventas del día' });
    }
};

// Obtener ventas del vendedor actual
const getMisVentas = async (req, res) => {
    const id_usuario = req.usuario.id_usuario;
    const rol = req.usuario.rol;

    try {
        let query;
        let params;

        if (rol === 'Dueño') {
            query = `
                SELECT v.*, u.nombre as vendedor_nombre, u.password,
                       COUNT(dv.id_detalle) as total_productos
                FROM ventas v
                JOIN usuarios u ON v.id_usuario = u.id_usuario
                LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
                GROUP BY v.id_venta, u.nombre, u.password
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

// Obtener detalle de una venta específica
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
            `SELECT dv.*, p.nombre as planta_nombre, p.unidad_medida
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

// Reporte de ganancias por planta (con costo_compra)
const getGananciasPorPlanta = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                p.id_planta,
                p.nombre,
                p.precio_base,
                p.costo_compra,
                p.stock as stock_actual,
                COALESCE(SUM(dv.cantidad), 0) as cantidad_vendida,
                COALESCE(SUM(dv.subtotal), 0) as total_vendido,
                COALESCE(SUM(dv.cantidad * p.costo_compra), 0) as costo_total,
                COALESCE(SUM(dv.subtotal) - SUM(dv.cantidad * p.costo_compra), 0) as ganancia
             FROM plantas p
             LEFT JOIN detalle_venta dv ON p.id_planta = dv.id_planta
             GROUP BY p.id_planta, p.nombre, p.precio_base, p.costo_compra, p.stock
             ORDER BY total_vendido DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener ganancias por planta:', error);
        res.status(500).json({ error: 'Error al obtener ganancias por planta' });
    }
};

// Obtener ventas de los últimos 7 días para gráfica
const getVentasPorDia = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                DATE(fecha_servidor) as fecha,
                COUNT(*) as total_ventas,
                COALESCE(SUM(total_pagado), 0) as total_ingresos
             FROM ventas
             WHERE fecha_servidor >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY DATE(fecha_servidor)
             ORDER BY fecha ASC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ventas por día' });
    }
};

// Obtener productos más vendidos
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

// Eliminar venta (solo dueño)
const eliminarVenta = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    if (usuario.rol !== 'Dueño') {
        return res.status(403).json({ error: 'No autorizado. Solo el dueño puede eliminar ventas.' });
    }

    try {
        // 1. Eliminar ahorros asociados a la venta
        await pool.query('DELETE FROM ahorros WHERE id_venta = $1', [id]);

        // 2. Eliminar detalles de la venta
        await pool.query('DELETE FROM detalle_venta WHERE id_venta = $1', [id]);

        // 3. Eliminar la venta
        const result = await pool.query(
            'DELETE FROM ventas WHERE id_venta = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        res.json({ mensaje: 'Venta eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar venta:', error);
        res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
    }
};

module.exports = {
    registrarVenta,
    getVentasHoy,
    getGananciasPorPlanta,
    getMisVentas,
    getDetalleVenta,
    getVentasPorDia,
    getProductosMasVendidos,
    eliminarVenta
};