const pool = require('../config/db');

// ==================== FUNCIONES INTERNAS ====================
const getPorcentajeActual = async () => {
    const result = await pool.query('SELECT porcentaje FROM config_ahorros LIMIT 1');
    return result.rows[0]?.porcentaje || 20;
};

// ==================== CONTROLADORES ====================

// Obtener configuración completa
const getConfig = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM config_ahorros LIMIT 1');
        const totalResult = await pool.query('SELECT COALESCE(SUM(monto_ahorrado), 0) as total FROM ahorros');
        
        res.json({
            porcentaje: parseFloat(result.rows[0]?.porcentaje || 20),
            total_ahorrado: parseFloat(totalResult.rows[0]?.total || 0),
            modo: result.rows[0]?.modo || 'automatico'
        });
    } catch (error) {
        console.error('Error en getConfig:', error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener solo el porcentaje actual
const getPorcentaje = async (req, res) => {
    try {
        const porcentaje = await getPorcentajeActual();
        res.json({ porcentaje });
    } catch (error) {
        console.error('Error en getPorcentaje:', error);
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
        // Verificar si existe la tabla config_ahorros
        const existe = await pool.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'config_ahorros')");
        
        if (existe.rows[0].exists) {
            const tieneDatos = await pool.query('SELECT COUNT(*) FROM config_ahorros');
            if (tieneDatos.rows[0].count === 0) {
                await pool.query('INSERT INTO config_ahorros (porcentaje) VALUES ($1)', [porcentaje]);
            } else {
                await pool.query('UPDATE config_ahorros SET porcentaje = $1, updated_at = NOW()', [porcentaje]);
            }
        } else {
            // Si la tabla no existe, la creamos
            await pool.query(`
                CREATE TABLE IF NOT EXISTS config_ahorros (
                    id SERIAL PRIMARY KEY,
                    porcentaje DECIMAL(5,2) DEFAULT 20.00,
                    modo VARCHAR(20) DEFAULT 'automatico',
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            await pool.query('INSERT INTO config_ahorros (porcentaje) VALUES ($1)', [porcentaje]);
        }
        
        res.json({ mensaje: 'Porcentaje actualizado', porcentaje });
    } catch (error) {
        console.error('Error en updatePorcentaje:', error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener total ahorrado
const getTotalAhorrado = async (req, res) => {
    try {
        const result = await pool.query('SELECT COALESCE(SUM(monto_ahorrado), 0) as total FROM ahorros');
        res.json({ total_ahorrado: parseFloat(result.rows[0].total) });
    } catch (error) {
        console.error('Error en getTotalAhorrado:', error);
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
        console.error('Error en getHistorial:', error);
        res.status(500).json({ error: error.message });
    }
};

// Exportar funciones
module.exports = {
    getPorcentajeActual,  // para usar en otros controladores
    getConfig,
    getPorcentaje,
    updatePorcentaje,
    getTotalAhorrado,
    getHistorial
};