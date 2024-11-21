const pool = require('./configpostgres');

(async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Conexión exitosa:', res.rows[0]);
    } catch (err) {
        console.error('Error al conectar a PostgreSQL:', err);
    } finally {
        pool.end();
    }
})();
