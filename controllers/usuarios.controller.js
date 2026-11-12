
const pool = require('../config/database');

const obtenerUsuarios = async (req, res) => {
    const { nombre, apellido, correo } = req.query;

    const condiciones = [];
    const valores = [];

    if (nombre) {
        valores.push(`%${nombre}%`);
        condiciones.push(`nombre ILIKE $${valores.length}`);
    }

    if (apellido) {
        valores.push(`%${apellido}%`);
        condiciones.push(`apellido ILIKE $${valores.length}`);
    }

    if (correo) {
        valores.push(`%${correo}%`);
        condiciones.push(`correo ILIKE $${valores.length}`);
    }

    let consulta = 'SELECT * FROM usuarios';

    if (condiciones.length > 0) {
        consulta += ' WHERE ' + condiciones.join(' AND ');
    }

    consulta += ' ORDER BY id';

    const resultado = await pool.query(consulta, valores);
    res.json(resultado.rows);
};

const obtenerUsuario = async (req, res) => {
    const { id } = req.params;

    const resultado = await pool.query(
        'SELECT * FROM usuarios WHERE id = $1',
        [id]
    );

    if (resultado.rows.length === 0) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(resultado.rows[0]);
};

const crearUsuario = async (req, res) => {
    const { nombre, apellido, correo } = req.body;

    if (!nombre || !apellido || !correo) {
        return res.status(400).json({
            mensaje: 'Todos los campos son obligatorios'
        });
    }

    if (typeof nombre !== 'string' || typeof apellido !== 'string' ||
        typeof correo !== 'string') {
        return res.status(400).json({
            mensaje: 'Los campos deben ser texto'
        });
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(correo)) {
        return res.status(400).json({
            mensaje: 'El correo no tiene un formato válido'
        });
    }

    const resultado = await pool.query(
        `INSERT INTO usuarios (nombre, apellido, correo)
         VALUES ($1, $2, $3) RETURNING *`,
        [nombre.trim(), apellido.trim(), correo.trim()]
    );

    res.status(201).json({
        mensaje: 'Usuario creado correctamente',
        usuario: resultado.rows[0]
    });
};

const actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, correo } = req.body;

    if (!nombre || !apellido || !correo) {
        return res.status(400).json({
            mensaje: 'Todos los campos son obligatorios'
        });
    }

    if (typeof nombre !== 'string' || typeof apellido !== 'string' ||
        typeof correo !== 'string') {
        return res.status(400).json({
            mensaje: 'Los campos deben ser texto'
        });
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(correo)) {
        return res.status(400).json({
            mensaje: 'El correo no tiene un formato válido'
        });
    }

    const resultado = await pool.query(
        `UPDATE usuarios
         SET nombre = $1, apellido = $2, correo = $3
         WHERE id = $4 RETURNING *`,
        [nombre.trim(), apellido.trim(), correo.trim(), id]
    );

    if (resultado.rows.length === 0) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({
        mensaje: 'Usuario actualizado correctamente',
        usuario: resultado.rows[0]
    });
};

const eliminarUsuario = async (req, res) => {
    const { id } = req.params;

    const resultado = await pool.query(
        'DELETE FROM usuarios WHERE id = $1 RETURNING *',
        [id]
    );

    if (resultado.rows.length === 0) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario eliminado correctamente' });
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};
