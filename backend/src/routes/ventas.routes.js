const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
    registrarVenta,
    getVentasHoy,
    getGananciasPorPlanta,
    getGananciasRealesPorPlanta,
    getMisVentas,
    getDetalleVenta,
    getVentasPorDia,
    getProductosMasVendidos,
    eliminarVenta
} = require('../controllers/ventas.controller');

router.post('/', authMiddleware, registrarVenta);
router.get('/resumen-hoy', authMiddleware, getVentasHoy);
router.get('/ganancias-por-planta', authMiddleware, getGananciasPorPlanta);
router.get('/ganancias-reales-por-planta', authMiddleware, getGananciasRealesPorPlanta);
router.get('/mis-ventas', authMiddleware, getMisVentas);
router.get('/detalle/:id', authMiddleware, getDetalleVenta);
router.get('/ventas-por-dia', authMiddleware, getVentasPorDia);
router.get('/productos-mas-vendidos', authMiddleware, getProductosMasVendidos);
router.delete('/:id', authMiddleware, eliminarVenta);

module.exports = router;