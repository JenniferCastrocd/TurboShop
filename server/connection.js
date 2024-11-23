const pool = require('./configpostgres');

(async () => {
    try {
        const result = await pool.query('SELECT NOW();');
        console.log('Conexión a PostgreSQL exitosa:', result.rows[0]);
    } catch (error) {
        console.error('Error al conectar a PostgreSQL:', error);
    }
})();