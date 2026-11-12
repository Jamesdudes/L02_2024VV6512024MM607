
const pool = require('../config/database');
const obtenerPedidos = async (req, res) => {
    const resultado = await pool.query(
        'SELECT * FROM pedidos ORDER BY id'
    );

    res.json(resultado.rows);
};
const obtenerPedido = async (req, res) => {
    const { id } = req.params;
    const resultado = await pool.query(
        'SELECT * FROM pedidos WHERE id = $1',
        [id]
    );
    if (resultado.rows.length === 0) {
        return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    res.json(resultado.rows[0]);
};

const obtenerPedidosCliente = async (req, res) => {
    const { usuarioId } = req.params;

    const resultado = await pool.query(
        'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY id',
        [usuarioId]
    );
    res.json(resultado.rows);
};
const crearPedido = async (req, res) => {
    const { usuario_id, fecha_pedido } = req.body;
    if (!Number.isInteger(usuario_id) || usuario_id <= 0) {
        return res.status(400).json({
            mensaje: 'Debe proporcionar un usuario_id válido'
        });
    }
    const resultado = await pool.query(
        `INSERT INTO pedidos (usuario_id, fecha_pedido)
         VALUES ($1, COALESCE($2::timestamp, CURRENT_TIMESTAMP))
         RETURNING *`,
        [usuario_id, fecha_pedido || null]
    );
    res.status(201).json({
        mensaje: 'Pedido creado correctamente',
        pedido: resultado.rows[0]
    });
};
const actualizarPedido = async (req, res) => {
    const { id } = req.params;
    const { usuario_id, fecha_pedido } = req.body;
    if (!Number.isInteger(usuario_id) || usuario_id <= 0) {
        return res.status(400).json({
            mensaje: 'Debe proporcionar un usuario_id válido'
        });
    }
    const resultado = await pool.query(
        `UPDATE pedidos
         SET usuario_id = $1, fecha_pedido = $2
         WHERE id = $3 RETURNING *`,
        [usuario_id, fecha_pedido || null, id]
    );

    if (resultado.rows.length === 0) {
        return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    res.json({
        mensaje: 'Pedido actualizado correctamente',
        pedido: resultado.rows[0]
    });
};
const eliminarPedido = async (req, res) => {
    const { id } = req.params;

    const resultado = await pool.query(
        'DELETE FROM pedidos WHERE id = $1 RETURNING *',
        [id]
    );

    if (resultado.rows.length === 0) {
        return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    res.json({ mensaje: 'Pedido eliminado correctamente' });
};
module.exports = {
    obtenerPedidos,
    obtenerPedido,
    obtenerPedidosCliente,
    crearPedido,
    actualizarPedido,
    eliminarPedido
};
