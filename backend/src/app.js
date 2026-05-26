require('dotenv').config();
require('./config/db');

const express = require('express');
const cors = require('cors');

const usuariosRoutes = require('./routes/usuarios.routes');
const authRoutes = require('./routes/auth.routes');
const plantasRoutes = require('./routes/plantas.routes');
const ventasRoutes = require('./routes/ventas.routes');
const mermasRoutes = require('./routes/mermas.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const pedidosClientesRoutes = require('./routes/pedidosClientes.routes');

const app = express();

// ✅ CORS para producción (cuando sepas la URL de la escuela, la agregas)
// Por ahora, permitimos todo para que funcione mientras pruebas
app.use(cors({
    origin: '*',  // Temporal - después cambias por la URL de la escuela
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/plantas', plantasRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/mermas', mermasRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/pedidos-clientes', pedidosClientesRoutes);

app.get('/', (req, res) => {
    res.send('API Vivero Juanito 🌱');
});

module.exports = app;