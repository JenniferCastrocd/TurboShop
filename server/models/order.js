const pool = require('../configpostgres');

class Order {
  static async createOrder(username, products) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insertar en la tabla orders
      const orderQuery = `
        INSERT INTO orders (username) 
        VALUES ($1) 
        RETURNING id;
      `;
      const orderResult = await client.query(orderQuery, [username]);
      const orderId = orderResult.rows[0].id;

      // Insertar en la tabla order_items
      const orderItemsQuery = `
        INSERT INTO order_items (order_id, product_name, quantity, unit_price) 
        VALUES ($1, $2, $3, $4);
      `;

      for (const product of products) {
        await client.query(orderItemsQuery, [
          orderId,
          product.productName,
          product.productQuantity,
          product.unitPrice || 0, // Añadir un precio unitario por defecto si no está en los datos
        ]);
      }

      await client.query('COMMIT');
      return { orderId };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear la orden:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Order;


