const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
    registrarMerma,
    getMermas,
    getResumenMermas,
    updateMerma,
    deleteMerma
} = require('../controllers/mermas.controller');

// Rutas protegidas (solo autenticados)
router.post('/', authMiddleware, registrarMerma);
router.get('/', authMiddleware, getMermas);
router.get('/resumen', authMiddleware, getResumenMermas);
router.put('/:id', authMiddleware, updateMerma);      
router.delete('/:id', authMiddleware, deleteMerma); 

module.exports = router;