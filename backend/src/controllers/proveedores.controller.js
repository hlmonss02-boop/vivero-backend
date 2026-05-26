const pool = require('../config/db');

// Obtener todos los proveedores
const getProveedores = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM proveedores ORDER BY nombre ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
};

// Obtener un proveedor por ID
const getProveedorById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM proveedores WHERE id_proveedor = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener proveedor' });
    }
};

// Crear nuevo proveedor
const createProveedor = async (req, res) => {
    const { nombre, telefono, direccion, contacto } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO proveedores (nombre, telefono, direccion, contacto)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [nombre, telefono || null, direccion || null, contacto || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear proveedor' });
    }
};

// Actualizar proveedor
const updateProveedor = async (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, direccion, contacto } = req.body;

    try {
        const result = await pool.query(
            `UPDATE proveedores 
             SET nombre = $1, telefono = $2, direccion = $3, contacto = $4
             WHERE id_proveedor = $5
             RETURNING *`,
            [nombre, telefono, direccion, contacto, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
};

// Eliminar proveedor
const deleteProveedor = async (req, res) => {
    const { id } = req.params;
    try {
        // Verificar si tiene plantas asociadas
        const plantasRelacionadas = await pool.query(
            'SELECT COUNT(*) FROM plantas WHERE id_proveedor = $1',
            [id]
        );
        
        if (parseInt(plantasRelacionadas.rows[0].count) > 0) {
            return res.status(400).json({ 
                error: 'No se puede eliminar: este proveedor tiene plantas asociadas' 
            });
        }

        const result = await pool.query(
            'DELETE FROM proveedores WHERE id_proveedor = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json({ mensaje: 'Proveedor eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar proveedor' });
    }
};

// Obtener plantas por proveedor
const getPlantasByProveedor = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM plantas WHERE id_proveedor = $1',
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener plantas del proveedor' });
    }
};

module.exports = {
    getProveedores,
    getProveedorById,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    getPlantasByProveedor
};