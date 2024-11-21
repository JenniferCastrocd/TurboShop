const pool = require('../configpostgres');

class User {
    constructor(username, password, role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    // Agregar un usuario a la base de datos
    static async addUser(user) {
        try {
            const query = `
                INSERT INTO users (username, user_password, user_role)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const values = [user.username, user.password, user.role];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error al agregar usuario:', error);
            throw error;
        }
    }

    // Buscar un usuario por nombre de usuario
    static async findUser(username) {
        try {
            const query = `SELECT * FROM users WHERE username = $1;`;
            const result = await pool.query(query, [username]);
            console.log('Usuario encontrado:', result.rows[0]); // Agrega este log
            return result.rows[0]; // Retorna el usuario si se encuentra
        } catch (error) {
            console.error('Error al buscar usuario:', error);
            throw error;
        }
    }

    // Autenticar un usuario
    static async authenticate(username, password) {
        const user = await this.findUser(username);
        console.log('Usuario encontrado para autenticación:', user);
    
        if (!user) return null;
    
        // Comparación de contraseña (sin encriptación)
        if (user.user_password === password) {
            return user; // Retorna el usuario si coincide
        }
    
        return null; // Credenciales inválidas
    }
    
    
    
}

module.exports = User;

