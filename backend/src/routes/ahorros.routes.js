const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const ahorrosController = require('../controllers/ahorros.controller');

// Obtener configuración y total ahorrado
router.get('/config', authMiddleware, ahorrosController.getConfig);

// Actualizar porcentaje (solo dueño)
router.put('/porcentaje', authMiddleware, ahorrosController.updatePorcentaje);

// Obtener total ahorrado
router.get('/total', authMiddleware, ahorrosController.getTotalAhorrado);

// Obtener historial
router.get('/historial', authMiddleware, ahorrosController.getHistorial);

// Obtener porcentaje actual (para otros módulos)
router.get('/porcentaje', authMiddleware, ahorrosController.getPorcentaje);

module.exports = router;