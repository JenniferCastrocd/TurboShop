const pool = require('../configpostgres');

class OrderItem {
    constructor(orderId, productId, quantity, unitPrice) {
        this.orderId = orderId;
        this.productId = productId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    // Crear un nuevo artículo de orden
    static async createOrderItem(orderItem) {
        try {
            const query = `
                INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                VALUES ($1, $2, $3, $4)
                RETURNING *;
            `;
            const values = [orderItem.orderId, orderItem.productId, orderItem.quantity, orderItem.unitPrice];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error al crear artículo de orden:', error);
            throw error;
        }
    }

    // Obtener artículos de orden por ID de orden
    static async getOrderItemsByOrderId(orderId) {
        try {
            const query = `SELECT * FROM order_items WHERE order_id = $1;`;
            const result = await pool.query(query, [orderId]);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener artículos de la orden:', error);
            throw error;
        }
    }

    // Obtener todos los artículos de orden de un producto
    static async getOrderItemsByProductId(productId) {
        try {
            const query = `SELECT * FROM order_items WHERE product_id = $1;`;
            const result = await pool.query(query, [productId]);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener artículos de producto:', error);
            throw error;
        }
    }
}

module.exports = OrderItem;
