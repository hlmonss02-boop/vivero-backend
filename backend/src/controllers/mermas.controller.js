const pool = require('../config/db');

// Registrar una merma (pérdida de planta)
const registrarMerma = async (req, res) => {
    const { id_planta, cantidad, motivo } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!id_planta || !cantidad || !motivo) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (cantidad <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    try {
        // Verificar que la planta existe y tiene suficiente stock
        const plantaResult = await pool.query(
            'SELECT nombre, stock FROM plantas WHERE id_planta = $1',
            [id_planta]
        );

        if (plantaResult.rows.length === 0) {
            return res.status(404).json({ error: 'Planta no encontrada' });
        }

        const planta = plantaResult.rows[0];

        if (planta.stock < cantidad) {
            return res.status(400).json({
                error: `Stock insuficiente. Solo hay ${planta.stock} unidades de ${planta.nombre}`
            });
        }

        // Insertar la merma
        const result = await pool.query(
            `INSERT INTO mermas (id_planta, cantidad, motivo, registrado_por)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [id_planta, cantidad, motivo, id_usuario]
        );

        // Actualizar el stock de la planta
        await pool.query(
            'UPDATE plantas SET stock = stock - $1 WHERE id_planta = $2',
            [cantidad, id_planta]
        );

        res.status(201).json({
            mensaje: 'Merma registrada correctamente',
            merma: result.rows[0],
            planta: planta.nombre,
            stock_restante: planta.stock - cantidad
        });

    } catch (error) {
        console.error('Error al registrar merma:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener todas las mermas
const getMermas = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT m.*, p.nombre as planta_nombre, u.nombre as registrado_por_nombre
             FROM mermas m
             JOIN plantas p ON m.id_planta = p.id_planta
             JOIN usuarios u ON m.registrado_por = u.id_usuario
             ORDER BY m.fecha_registro DESC
             LIMIT 100`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener mermas' });
    }
};

// Obtener resumen de mermas (totales)
const getResumenMermas = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_mermas,
                SUM(cantidad) as total_unidades_perdidas,
                COALESCE(SUM(p.precio_base * m.cantidad), 0) as valor_perdido
             FROM mermas m
             JOIN plantas p ON m.id_planta = p.id_planta`
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener resumen' });
    }
};

// Actualizar una merma
const updateMerma = async (req, res) => {
    const { id } = req.params;
    const { id_planta, cantidad, motivo } = req.body;

    if (!id_planta || !cantidad || !motivo) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (cantidad <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    try {
        // Verificar que la merma existe
        const mermaExistente = await pool.query(
            'SELECT * FROM mermas WHERE id_merma = $1',
            [id]
        );

        if (mermaExistente.rows.length === 0) {
            return res.status(404).json({ error: 'Merma no encontrada' });
        }

        const cantidadAnterior = mermaExistente.rows[0].cantidad;
        const id_plantaAnterior = mermaExistente.rows[0].id_planta;

        // Si cambió la planta, ajustar stocks
        if (id_plantaAnterior !== parseInt(id_planta)) {
            // Devolver stock a la planta anterior
            await pool.query(
                'UPDATE plantas SET stock = stock + $1 WHERE id_planta = $2',
                [cantidadAnterior, id_plantaAnterior]
            );
            // Restar stock de la nueva planta
            await pool.query(
                'UPDATE plantas SET stock = stock - $1 WHERE id_planta = $2',
                [cantidad, id_planta]
            );
        } else {
            // Misma planta, ajustar la diferencia
            const diferencia = cantidad - cantidadAnterior;
            await pool.query(
                'UPDATE plantas SET stock = stock - $1 WHERE id_planta = $2',
                [diferencia, id_planta]
            );
        }

        // Actualizar la merma
        const result = await pool.query(
            `UPDATE mermas 
             SET id_planta = $1, cantidad = $2, motivo = $3
             WHERE id_merma = $4
             RETURNING *`,
            [id_planta, cantidad, motivo, id]
        );

        res.json({
            mensaje: 'Merma actualizada correctamente',
            merma: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar merma:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Eliminar una merma
const deleteMerma = async (req, res) => {
    const { id } = req.params;

    try {
        // Obtener la merma para devolver el stock
        const mermaResult = await pool.query(
            'SELECT * FROM mermas WHERE id_merma = $1',
            [id]
        );

        if (mermaResult.rows.length === 0) {
            return res.status(404).json({ error: 'Merma no encontrada' });
        }

        const merma = mermaResult.rows[0];

        // Devolver el stock a la planta
        await pool.query(
            'UPDATE plantas SET stock = stock + $1 WHERE id_planta = $2',
            [merma.cantidad, merma.id_planta]
        );

        // Eliminar la merma
        await pool.query(
            'DELETE FROM mermas WHERE id_merma = $1',
            [id]
        );

        res.json({ mensaje: 'Merma eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar merma:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    registrarMerma,
    getMermas,
    getResumenMermas,
    updateMerma,
    deleteMerma
};