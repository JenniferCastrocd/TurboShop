const pool = require('../configpostgres'); // Conexión a la base de datos

// Obtener órdenes por usuario
exports.getOrdersByUser = async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'El nombre de usuario es obligatorio.' });
    }

    try {
        const ordersQuery = `
            SELECT o.id AS order_id, o.order_date, i.product_name, i.quantity, i.unit_price
            FROM orders o
            JOIN order_items i ON o.id = i.order_id
            WHERE o.username = $1
            ORDER BY o.order_date DESC
        `;
        const result = await pool.query(ordersQuery, [username]);

        if (result.rows.length === 0) {
            return res.status(200).json([]); // No se encontraron órdenes
        }

        // Agrupar productos por orden
        const orders = {};
        result.rows.forEach(row => {
            if (!orders[row.order_id]) {
                orders[row.order_id] = {
                    id: row.order_id,
                    date: row.order_date,
                    products: []
                };
            }
            orders[row.order_id].products.push({
                productName: row.product_name,
                quantity: row.quantity,
                unitPrice: row.unit_price
            });
        });

        res.status(200).json(Object.values(orders)); // Devuelve las órdenes agrupadas
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Crear una nueva orden
exports.createOrder = async (req, res) => {
    const { username, products } = req.body;

    if (!username || !products || products.length === 0) {
        return res.status(400).json({ error: 'Datos incompletos. Se requiere un usuario y productos.' });
    }

    try {
        // Crear una nueva orden
        const orderQuery = `
            INSERT INTO orders (username, order_date)
            VALUES ($1, NOW())
            RETURNING id;
        `;
        const orderResult = await pool.query(orderQuery, [username]);
        const orderId = orderResult.rows[0].id;

        // Insertar los productos comprados en la tabla `order_items`
        const itemQueries = products.map(product => {
            return pool.query(
                `
                INSERT INTO order_items (order_id, product_name, quantity, unit_price)
                VALUES ($1, $2, $3, $4);
                `,
                [orderId, product.productName, product.productQuantity, product.unitPrice]
            );
        });

        await Promise.all(itemQueries);

        res.status(201).json({ success: true, message: 'Orden registrada con éxito.' });
    } catch (error) {
        console.error('Error al registrar la orden:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};