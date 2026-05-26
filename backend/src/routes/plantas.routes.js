const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
    getPlantas,
    getPlantaById,
    createPlanta,
    updatePlanta,
    deletePlanta,
    getStockBajo
} = require('../controllers/plantas.controller');

// Rutas públicas
router.get('/', getPlantas);
router.get('/stock-bajo', getStockBajo);
router.get('/:id', getPlantaById);

// Rutas protegidas (con soporte para subir imágenes)
router.post('/', authMiddleware, upload.single('imagen'), createPlanta);
router.put('/:id', authMiddleware, upload.single('imagen'), updatePlanta);
router.delete('/:id', authMiddleware, deletePlanta);

module.exports = router;