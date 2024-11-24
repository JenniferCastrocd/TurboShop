const pool = require('../configpostgres'); // Configuración de PostgreSQL

class Product {
    constructor(name, description, price, quantity) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.quantity = quantity;
    }

    // Agregar un producto
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
            throw new Error('Error al agregar el producto.');
        }
    }

    // Obtener todos los productos
    static async getAllProducts() {
        try {
            const query = 'SELECT * FROM products;';
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw new Error('Error al obtener productos.');
        }
    }

    // Actualizar cantidad de productos
    static async updateProductQuantity(name, quantitySold) {
        try {
            const query = `
                UPDATE products
                SET quantity = quantity - $1
                WHERE name = $2 AND quantity >= $1
                RETURNING *;
            `;
            const values = [quantitySold, name];
            const result = await pool.query(query, values);
            if (result.rowCount === 0) {
                throw new Error('Stock insuficiente o producto no encontrado.');
            }
            return result.rows[0];
        } catch (error) {
            console.error('Error al actualizar la cantidad del producto:', error);
            throw new Error('Error al actualizar la cantidad del producto.');
        }
    }
}

module.exports = Product;