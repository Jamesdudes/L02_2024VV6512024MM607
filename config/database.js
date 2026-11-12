
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

pool.on('connect', () => {
    console.log('Conectado a PostgreSQL');
});

pool.on('error', (error) => {
    console.error('Error en PostgreSQL:', error.message);
});

module.exports = pool;
