
const pool = require('../config/database');

const obtenerDetalles = async (req, res) => {
    const resultado = await pool.query(
        'SELECT * FROM detalles_pedidos ORDER BY id'
    );

    res.json(resultado.rows);
};

const obtenerDetalle = async (req, res) => {
    const { id } = req.params;

    const resultado = await pool.query(
        'SELECT * FROM detalles_pedidos WHERE id = $1',
        [id]
    );

    if (resultado.rows.length === 0) {
        return res.status(404).json({ mensaje: 'Detalle no encontrado' });
    }

    res.json(resultado.rows[0]);
};

const obtenerDetallesPedido = async (req, res) => {
    const { pedidoId } = req.params;

    const resultado = await pool.query(
        'SELECT * FROM detalles_pedidos WHERE pedido_id = $1 ORDER BY id',
        [pedidoId]
    );

    res.json(resultado.rows);
};

const obtenerDetallesProducto = async (req, res) => {
    const { productoId } = req.params;

    const resultado = await pool.query(
        'SELECT * FROM detalles_pedidos WHERE producto_id = $1 ORDER BY id',
        [productoId]
    );

    res.json(resultado.rows);
};

const crearDetalle = async (req, res) => {
    const { pedido_id, producto_id, cantidad, precio_unitario } = req.body;

    if (!Number.isInteger(pedido_id) || pedido_id <= 0 ||
        !Number.isInteger(producto_id) || producto_id <= 0 ||
        !Number.isInteger(cantidad) || cantidad <= 0) {
        return res.status(400).json({
            mensaje: 'Pedido, producto y cantidad deben ser válidos'
        });
    }

    if (precio_unitario !== undefined &&
        (typeof precio_unitario !== 'number' ||
         !Number.isFinite(precio_unitario) || precio_unitario < 0)) {
        return res.status(400).json({
            mensaje: 'El precio unitario debe ser un número válido'
        });
    }

    const producto = await pool.query(
        'SELECT precio FROM productos WHERE id = $1',
        [producto_id]
    );

    if (producto.rows.length === 0) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    const precio = precio_unitario !== undefined
        ? precio_unitario
        : producto.rows[0].precio;

    const resultado = await pool.query(
        `INSERT INTO detalles_pedidos
         (pedido_id, producto_id, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [pedido_id, producto_id, cantidad, precio]
    );

    res.status(201).json({
        mensaje: 'Detalle creado correctamente',
        detalle: resultado.rows[0]
    });
};

const actualizarDetalle = async (req, res) => {
    const { id } = req.params;
    const { pedido_id, producto_id, cantidad, precio_unitario } = req.body;

    if (!Number.isInteger(pedido_id) || pedido_id <= 0 ||
        !Number.isInteger(producto_id) || producto_id <= 0 ||
        !Number.isInteger(cantidad) || cantidad <= 0) {
        return res.status(400).json({
            mensaje: 'Pedido, producto y cantidad deben ser válidos'
        });
    }

    if (precio_unitario !== undefined &&
        (typeof precio_unitario !== 'number' ||
         !Number.isFinite(precio_unitario) || precio_unitario < 0)) {
        return res.status(400).json({
            mensaje: 'El precio unitario debe ser un número válido'
        });
    }

    const producto = await pool.query(
        'SELECT precio FROM productos WHERE id = $1',
        [producto_id]
    );

    if (producto.rows.length === 0) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    const precio = precio_unitario !== undefined
        ? precio_unitario
        : producto.rows[0].precio;

    const resultado = await pool.query(
        `UPDATE detalles_pedidos
         SET pedido_id = $1, producto_id = $2,
             cantidad = $3, precio_unitario = $4
         WHERE id = $5 RETURNING *`,
        [pedido_id, producto_id, cantidad, precio, id]
    );

    if (resultado.rows.length === 0) {
        return res.status(404).json({ mensaje: 'Detalle no encontrado' });
    }

    res.json({
        mensaje: 'Detalle actualizado correctamente',
        detalle: resultado.rows[0]
    });
};

const eliminarDetalle = async (req, res) => {
    const { id } = req.params;

    const resultado = await pool.query(
        'DELETE FROM detalles_pedidos WHERE id = $1 RETURNING *',
        [id]
    );

    if (resultado.rows.length === 0) {
        return res.status(404).json({ mensaje: 'Detalle no encontrado' });
    }

    res.json({ mensaje: 'Detalle eliminado correctamente' });
};

module.exports = {
    obtenerDetalles,
    obtenerDetalle,
    obtenerDetallesPedido,
    obtenerDetallesProducto,
    crearDetalle,
    actualizarDetalle,
    eliminarDetalle
};
