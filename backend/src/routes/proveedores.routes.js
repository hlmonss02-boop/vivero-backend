const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
    getProveedores,
    getProveedorById,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    getPlantasByProveedor
} = require('../controllers/proveedores.controller');

// Rutas protegidas (solo autenticados)
router.get('/', authMiddleware, getProveedores);
router.get('/:id', authMiddleware, getProveedorById);
router.get('/:id/plantas', authMiddleware, getPlantasByProveedor);
router.post('/', authMiddleware, createProveedor);
router.put('/:id', authMiddleware, updateProveedor);
router.delete('/:id', authMiddleware, deleteProveedor);

module.exports = router;