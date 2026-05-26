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

// ✅ CONFIGURACIÓN CORS CORRECTA
app.use(cors({
    origin: '*',  // Permite todas las conexiones (temporal para pruebas)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para JSON
app.use(express.json());

// Rutas
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