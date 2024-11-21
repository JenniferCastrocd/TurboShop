const pool = require('../configpostgres');

class Invoice {
    constructor(orderId, totalAmount, invoiceDate) {
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.invoiceDate = invoiceDate || new Date();
    }

    // Crear una nueva factura
    static async createInvoice(invoice) {
        try {
            const query = `
                INSERT INTO invoices (order_id, invoice_date, total_amount)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const values = [invoice.orderId, invoice.invoiceDate, invoice.totalAmount];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error al crear factura:', error);
            throw error;
        }
    }

    // Obtener una factura por ID
    static async getInvoiceById(invoiceId) {
        try {
            const query = `SELECT * FROM invoices WHERE invoice_id = $1;`;
            const result = await pool.query(query, [invoiceId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error al obtener factura:', error);
            throw error;
        }
    }

    // Obtener las facturas de una orden
    static async getInvoicesByOrder(orderId) {
        try {
            const query = `SELECT * FROM invoices WHERE order_id = $1;`;
            const result = await pool.query(query, [orderId]);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener facturas de la orden:', error);
            throw error;
        }
    }
}

module.exports = Invoice;
