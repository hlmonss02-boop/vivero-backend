const pool = require('../config/db');

// Generar folio único
const generarFolio = () => {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000);
    return `ENC${año.toString().slice(-2)}${mes}${dia}-${random}`;
};

// Obtener todos los pedidos
const getPedidos = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM pedidos_clientes 
             ORDER BY 
                CASE estado 
                    WHEN 'Pendiente' THEN 1
                    WHEN 'Completado' THEN 2
                    ELSE 3
                END,
                fecha_pedido DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
};

// Obtener pedido por ID
const getPedidoById = async (req, res) => {
    const { id } = req.params;
    try {
        const pedidoResult = await pool.query(
            `SELECT * FROM pedidos_clientes WHERE id_pedido = $1`,
            [id]
        );

        if (pedidoResult.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const detallesResult = await pool.query(
            `SELECT dp.*, p.nombre as planta_nombre, p.unidad_medida
             FROM detalle_pedido_cliente dp
             JOIN plantas p ON dp.id_planta = p.id_planta
             WHERE dp.id_pedido = $1`,
            [id]
        );

        res.json({
            pedido: pedidoResult.rows[0],
            detalles: detallesResult.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener pedido' });
    }
};

// Crear nuevo pedido de cliente
const createPedido = async (req, res) => {
    const { cliente_nombre, cliente_telefono, fecha_entrega, notas, productos } = req.body;

    // Validaciones
    if (!cliente_nombre) {
        return res.status(400).json({ error: 'El nombre del cliente es requerido' });
    }
    
    if (!productos || productos.length === 0) {
        return res.status(400).json({ error: 'Debe agregar al menos un producto' });
    }

    try {
        const folio = generarFolio();
        let total = 0;

        // Calcular total y validar precios
        for (const item of productos) {
            const precio = parseFloat(item.precio_pactado);
            if (isNaN(precio) || precio <= 0) {
                return res.status(400).json({ error: 'Precio pactado inválido para uno de los productos' });
            }
            total += item.cantidad * precio;
        }

        // Insertar pedido (estado por defecto: 'Pendiente')
        const pedidoResult = await pool.query(
            `INSERT INTO pedidos_clientes (folio, cliente_nombre, cliente_telefono, fecha_entrega, total, notas, estado)
             VALUES ($1, $2, $3, $4, $5, $6, 'Pendiente')
             RETURNING *`,
            [folio, cliente_nombre, cliente_telefono || null, fecha_entrega || null, total, notas || null]
        );

        const pedido = pedidoResult.rows[0];

        // Insertar detalles
        for (const item of productos) {
            const precio = parseFloat(item.precio_pactado);
            await pool.query(
                `INSERT INTO detalle_pedido_cliente (id_pedido, id_planta, cantidad, precio_pactado, subtotal, unidad_medida)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [pedido.id_pedido, item.id_planta, item.cantidad, precio, item.cantidad * precio, item.unidad_medida || 'Pieza']
            );
        }

        res.status(201).json({
            mensaje: 'Pedido registrado exitosamente',
            pedido: pedido
        });
    } catch (error) {
        console.error('Error en createPedido:', error);
        res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
    }
};

// Actualizar estado del pedido (solo Pendiente <-> Completado)
const updateEstadoPedido = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que el estado sea válido
    if (estado !== 'Pendiente' && estado !== 'Completado') {
        return res.status(400).json({ error: 'Estado no válido. Solo Pendiente o Completado' });
    }

    try {
        const result = await pool.query(
            `UPDATE pedidos_clientes SET estado = $1 WHERE id_pedido = $2 RETURNING *`,
            [estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // Si se marca como Completado, actualizar la fecha de entrega
        if (estado === 'Completado') {
            await pool.query(
                `UPDATE pedidos_clientes SET fecha_entrega = CURRENT_DATE WHERE id_pedido = $1`,
                [id]
            );
        }

        res.json({
            mensaje: `Pedido marcado como ${estado}`,
            pedido: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};

// Eliminar pedido
const deletePedido = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM pedidos_clientes WHERE id_pedido = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json({ mensaje: 'Pedido eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar pedido' });
    }
};

// Obtener resumen de pedidos pendientes
const getResumenPedidos = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                COUNT(*) as pendientes,
                COALESCE(SUM(total), 0) as total_pendiente
             FROM pedidos_clientes 
             WHERE estado = 'Pendiente'`
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener resumen' });
    }
};

module.exports = {
    getPedidos,
    getPedidoById,
    createPedido,
    updateEstadoPedido,
    deletePedido,
    getResumenPedidos
};