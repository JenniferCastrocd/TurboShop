const pool = require('../configpostgres');

class PurchaseHistory {
    static async getPurchasesByUsername(username) {
        const query = `
            SELECT ph.purchase_date, ph.total, ph.products
            FROM purchase_history ph
            INNER JOIN users u ON ph.user_id = u.user_id
            WHERE u.username = $1
            ORDER BY ph.purchase_date DESC;
        `;

        try {
            const result = await pool.query(query, [username]);
            return result.rows;
        } catch (error) {
            console.error('Error en getPurchasesByUsername:', error.message);
            throw error;
        }
    }
}

module.exports = PurchaseHistory;


