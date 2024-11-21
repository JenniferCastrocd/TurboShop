const pool = require('../configpostgres'); // Asegúrate de que configpostgres está bien configurado

class Product {
    constructor(name, description, price, quantity) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.quantity = quantity;
    }

    // Agregar un producto a la base de datos
    static async addProduct(product) {
        try {
            const query = `
                INSERT INTO products (name, description, price, quantity)
                VALUES ($1, $2, $3, $4)
                RETURNING *;
            `;
            const values = [product.name, product.description, product.price, product.quantity];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error al agregar el producto:', error);
            throw error;
        }
    }

    // Obtener todos los productos
    static async getAllProducts() {
        try {
            const query = 'SELECT * FROM products;';
            const result = await pool.query(query);
            return result.rows; // Retorna todos los productos
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw error;
        }
    }
}

module.exports = Product;
