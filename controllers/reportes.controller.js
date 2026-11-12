
const pool = require('../config/database');

const obtenerTopProductos = async (req, res) => {
    const n = Number(req.params.n);

    if (!Number.isInteger(n) || n <= 0 || n > 100) {
        return res.status(400).json({
            mensaje: 'El parámetro N debe ser un número entero entre 1 y 100'
        });
    }

    const resultado = await pool.query(
        `SELECT
            p.nombre AS nombre_producto,
            SUM(d.cantidad)::INTEGER AS unidades_vendidas
         FROM detalles_pedidos d
         INNER JOIN productos p ON d.producto_id = p.id
         GROUP BY p.id, p.nombre
         ORDER BY unidades_vendidas DESC, p.nombre ASC
         LIMIT $1`,
        [n]
    );

    res.json(resultado.rows);
};

module.exports = { obtenerTopProductos };
