const pool = require('../configpostgres');

class Order {
    constructor(userId, totalPrice, orderDate) {
        this.userId = userId;
        this.totalPrice = totalPrice;
        this.orderDate = orderDate || new Date();
    }

    // Crear una nueva orden
    static async createOrder(order) {
        try {
            const query = `
                INSERT INTO orders (user_id, total_price, order_date)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const values = [order.userId, order.totalPrice, order.orderDate];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error al crear orden:', error);
            throw error;
        }
    }

    // Obtener una orden por ID
    static async getOrderById(orderId) {
        try {
            const query = `SELECT * FROM orders WHERE order_id = $1;`;
            const result = await pool.query(query, [orderId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error al obtener orden:', error);
            throw error;
        }
    }

    // Obtener todas las órdenes de un usuario
    static async getOrdersByUser(userId) {
        try {
            const query = `SELECT * FROM orders WHERE user_id = $1;`;
            const result = await pool.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener órdenes del usuario:', error);
            throw error;
        }
    }
}

module.exports = Order;