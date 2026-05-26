const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    console.log("si login")

    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE correo = $1',
            [correo]
        );

        const usuario = result.rows[0];
console.log(usuario)
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        if (password !== usuario.password) {
            return res.status(401).json({ error: 'Contraseña incorrectas' });
        }

        const token = jwt.sign(
            { 
                id_usuario: usuario.id_usuario, 
                correo: usuario.correo, 
                rol: usuario.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token: token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                correo: usuario.correo,
                telefono: usuario.telefono,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const register = async (req, res) => {
    const { nombre, correo, telefono, password, rol } = req.body;

    if (!nombre || !correo || !password || !rol) {
        return res.status(400).json({ error: 'Nombre, correo, contraseña y rol son requeridos' });
    }

    try {
        const existeResult = await pool.query(
            'SELECT * FROM usuarios WHERE correo = $1',
            [correo]
        );

        if (existeResult.rows.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // ✅ AGREGAR "password" EN RETURNING
        const result = await pool.query(
            `INSERT INTO usuarios (nombre, correo, telefono, password, rol) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id_usuario, nombre, correo, telefono, rol, password`,
            [nombre, correo, telefono || null, password, rol]
        );

        const nuevoUsuario = result.rows[0];

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: nuevoUsuario
        });

    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { login, register };