const pool = require('../config/db');

// Obtener todas las plantas
const getPlantas = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, pr.nombre as proveedor_nombre 
             FROM plantas p
             LEFT JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
             ORDER BY p.id_planta DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener plantas' });
    }
};

// Obtener una planta por ID
const getPlantaById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM plantas WHERE id_planta = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Planta no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener planta' });
    }
};

// Crear nueva planta (con imagen y precios por ciento/docena)
const createPlanta = async (req, res) => {
    const { 
        nombre, descripcion, categoria, precio_base, 
        precio_ciento, precio_docena, stock, unidad_medida, 
        costo_compra, id_proveedor 
    } = req.body;
    
    let imagen_url = null;

    if (req.file) {
        imagen_url = req.file.path;
    }

    if (!nombre || !precio_base) {
        return res.status(400).json({ error: 'Nombre y precio son requeridos' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO plantas 
             (nombre, descripcion, categoria, precio_base, precio_ciento, precio_docena, 
              stock, unidad_medida, costo_compra, id_proveedor, imagen_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [nombre, descripcion || null, categoria || null, precio_base, 
             precio_ciento || 0, precio_docena || 0, stock || 0, 
             unidad_medida || 'Pieza', costo_compra || 0, id_proveedor || null, imagen_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear planta:', error);
        res.status(500).json({ error: 'Error al crear planta' });
    }
};

// Actualizar planta (con imagen y precios por ciento/docena)
const updatePlanta = async (req, res) => {
    const { id } = req.params;
    const { 
        nombre, descripcion, categoria, precio_base, 
        precio_ciento, precio_docena, stock, unidad_medida, 
        costo_compra, id_proveedor 
    } = req.body;
    
    let imagen_url = null;

    if (req.file) {
        imagen_url = req.file.path;
    }

    try {
        let query;
        let params;

        if (imagen_url) {
            query = `UPDATE plantas 
                     SET nombre = $1, descripcion = $2, categoria = $3, 
                         precio_base = $4, precio_ciento = $5, precio_docena = $6,
                         stock = $7, unidad_medida = $8, costo_compra = $9, 
                         id_proveedor = $10, imagen_url = $11
                     WHERE id_planta = $12
                     RETURNING *`;
            params = [nombre, descripcion || null, categoria || null, precio_base, 
                      precio_ciento || 0, precio_docena || 0, stock || 0, 
                      unidad_medida || 'Pieza', costo_compra || 0, id_proveedor || null, 
                      imagen_url, id];
        } else {
            query = `UPDATE plantas 
                     SET nombre = $1, descripcion = $2, categoria = $3, 
                         precio_base = $4, precio_ciento = $5, precio_docena = $6,
                         stock = $7, unidad_medida = $8, costo_compra = $9, 
                         id_proveedor = $10
                     WHERE id_planta = $11
                     RETURNING *`;
            params = [nombre, descripcion || null, categoria || null, precio_base, 
                      precio_ciento || 0, precio_docena || 0, stock || 0, 
                      unidad_medida || 'Pieza', costo_compra || 0, id_proveedor || null, id];
        }

        const result = await pool.query(query, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Planta no encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar planta:', error);
        res.status(500).json({ error: 'Error al actualizar planta' });
    }
};

// Eliminar planta
const deletePlanta = async (req, res) => {
    const { id } = req.params;
    try {
        // Primero eliminar registros relacionados en detalle_venta
        await pool.query('DELETE FROM detalle_venta WHERE id_planta = $1', [id]);
        
        // Luego eliminar registros en mermas
        await pool.query('DELETE FROM mermas WHERE id_planta = $1', [id]);
        
        // Finalmente eliminar la planta
        const result = await pool.query(
            'DELETE FROM plantas WHERE id_planta = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Planta no encontrada' });
        }
        
        res.json({ mensaje: 'Planta eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar planta' });
    }
};

// Verificar stock bajo (menos de 20)
const getStockBajo = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM plantas WHERE stock < 20 ORDER BY stock ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener stock bajo' });
    }
};

module.exports = {
    getPlantas,
    getPlantaById,
    createPlanta,
    updatePlanta,
    deletePlanta,
    getStockBajo
};