const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
    getPedidos,
    getPedidoById,
    createPedido,
    updateEstadoPedido,
    deletePedido,
    getResumenPedidos
} = require('../controllers/pedidosClientes.controller');

router.get('/', authMiddleware, getPedidos);
router.get('/resumen', authMiddleware, getResumenPedidos);
router.get('/:id', authMiddleware, getPedidoById);
router.post('/', authMiddleware, createPedido);
router.put('/:id/estado', authMiddleware, updateEstadoPedido);
router.delete('/:id', authMiddleware, deletePedido);

module.exports = router;