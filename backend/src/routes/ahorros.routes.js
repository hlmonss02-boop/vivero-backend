const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const ahorrosController = require('../controllers/ahorros.controller');

// Todas requieren autenticación
router.get('/porcentaje', authMiddleware, ahorrosController.getPorcentaje);
router.put('/porcentaje', authMiddleware, ahorrosController.updatePorcentaje);
router.get('/total', authMiddleware, ahorrosController.getTotalAhorrado);
router.get('/historial', authMiddleware, ahorrosController.getHistorial);

module.exports = router;