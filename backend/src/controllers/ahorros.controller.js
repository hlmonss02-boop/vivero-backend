const pool = require('../config/db');

// Obtener porcentaje actual de ahorro
const getPorcentajeActual = async () => {
    const result = await pool.query('SELECT porcentaje FROM config_ahorros LIMIT 1');
    return result.rows[0]?.porcentaje || 20;
};

// Obtener configuración completa
const getConfig = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM config_ahorros LIMIT 1');
        const totalResult = await pool.query('SELECT COALESCE(SUM(monto_ahorrado), 0) as total FROM ahorros');
        
        res.json({
            porcentaje: parseFloat(result.rows[0]?.porcentaje || 20),
            total_ahorrado: parseFloat(totalResult.rows[0]?.total || 0)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar porcentaje
const updatePorcentaje = async (req, res) => {
    const { porcentaje } = req.body;
    const usuario = req.usuario;

    if (usuario.rol !== 'Dueño') {
        return res.status(403).json({ error: 'Solo el dueño puede cambiar el porcentaje' });
    }

    if (!porcentaje || porcentaje < 0 || porcentaje > 100) {
        return res.status(400).json({ error: 'El porcentaje debe estar entre 0 y 100' });
    }

    try {
        await pool.query(
            'UPDATE config_ahorros SET porcentaje = $1, updated_at = NOW() WHERE id = 1',
            [porcentaje]
        );
        res.json({ mensaje: 'Porcentaje actualizado', porcentaje });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener total ahorrado
const getTotalAhorrado = async (req, res) => {
    try {
        const result = await pool.query('SELECT COALESCE(SUM(monto_ahorrado), 0) as total FROM ahorros');
        res.json({ total_ahorrado: parseFloat(result.rows[0].total) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener historial
const getHistorial = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, v.folio_ticket 
             FROM ahorros a
             LEFT JOIN ventas v ON a.id_venta = v.id_venta
             ORDER BY a.fecha DESC
             LIMIT 50`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getPorcentajeActual,
    getConfig,
    updatePorcentaje,
    getTotalAhorrado,
    getHistorial
};