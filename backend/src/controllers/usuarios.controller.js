const pool = require('../config/db');

const bcrypt = require('bcrypt');

const obtenerUsuarios = async (req, res) => {

    try {

        const result = await pool.query(
            'SELECT id_usuario, nombre, correo, telefono, rol, password FROM usuarios'
        );

        res.json(result.rows);

    } catch(error){

        console.log(error);

        res.status(500).json({
            message: 'Error servidor'
        });
    }
};

const crearUsuario = async (req, res) => {

    try {

        const {
            nombre,
            correo,
            telefono,
            password,
            rol
        } = req.body;

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        await pool.query(
            `
            INSERT INTO usuarios
            (
                nombre,
                correo,
                telefono,
                password,
                rol
            )
            VALUES
            ($1, $2, $3, $4, $5)
            `,
            [
                nombre,
                correo,
                telefono,
                hashedPassword,
                rol
            ]
        );

        res.json({
            message: 'Usuario creado'
        });

    } catch(error){

        console.log(error);

        res.status(500).json({
            message: 'Error servidor'
        });
    }
};

module.exports = {
    obtenerUsuarios,
    crearUsuario
};