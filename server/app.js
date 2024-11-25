const pool = require('./postgresconfig');
const { connectMongoDB, getCartsCollection, getProductsCollection } = require('./mongoconfig'); 
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 3000;

require('dotenv').config();
const jwtSecret = process.env.SECRET_KEY;

app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(cors());

(async () => {
    await connectMongoDB();
    console.log('MongoDB inicializado');
})();

/**
 * Configuración de almacenamiento para archivos subidos.
 * Define destino y nombre único basado en la fecha.
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

/** Instancia de Multer con configuración de almacenamiento */
const upload = multer({ storage: storage });

/**
 * Middleware para autenticar JWT.
 * Verifica token en el encabezado `Authorization` y permite acceso si es válido.
 */
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acceso no autorizado' });
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido o expirado' });
        }

        req.user = user;
        next();
    });
};

// ------------------ Rutas para Items ------------------

/**
 * Devuelve la lista de productos.
 */
app.get('/api/items', async (req, res) => {
    try {

        const productsCollection = getProductsCollection();
        const products = await productsCollection.find().toArray();

        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        const productsWithStock = [];

        for (let product of products) {
    
            const stockResult = await pool.query('SELECT quantity FROM stock WHERE product_id = $1', [product.product_id]);

            if (stockResult.rows.length > 0) {
                const stockQuantity = stockResult.rows[0].quantity;
                product = { ...product, quantity: stockQuantity };
            } else {
                product = { ...product, quantity: 0 };
            }

            productsWithStock.push(product);
        }

        // Devolver los productos con stock
        res.json(productsWithStock);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener los productos' });
    }
});

/**
 * Agrega un nuevo producto a la lista.
 * Requiere autenticación JWT y solo permite el acceso a administradores.
 */
app.post('/api/items', authenticateJWT, upload.single('image'), async (req, res) => {
    const { name, description, price, stock, ...additionalAttributes } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    if (req.user.email !== 'admin@myapp.com') {
        return res.status(403).json({ message: 'Acceso restringido. Solo los administradores pueden agregar productos.' });
    }

    try {
        // Iniciar una transacción en PostgreSQL
        await pool.query('BEGIN');

        // Insertar el stock en PostgreSQL
        const stockResult = await pool.query(
            'INSERT INTO stock (quantity) VALUES ($1) RETURNING *',
            [parseInt(stock, 10)]
        );

        if (stockResult.rowCount > 0) {
            const productId = stockResult.rows[0].product_id;
            const quantity = stockResult.rows[0].quantity;

            const productsCollection = await getProductsCollection();

            // Insertar los detalles del producto en MongoDB
            const newProduct = {
                product_id: productId,
                name,
                description,
                price: parseFloat(price),
                image_url: imageUrl,
                attributes: additionalAttributes
            };

            await productsCollection.insertOne(newProduct);

            // Confirmar transacción en PostgreSQL
            await pool.query('COMMIT');

            res.status(201).json({
                message: 'Producto agregado exitosamente',
                item: {
                    ...newProduct, 
                    quantity: quantity
                }
            });

        } else {
            await pool.query('ROLLBACK');
            return res.status(500).json({ message: 'Error al agregar stock en PostgreSQL' });
        }

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al agregar el producto:', error);
        res.status(500).json({ message: 'Error al agregar el producto' });
    }
});

/**
 * Elimina un producto de la lista por su ID. 
 * Requiere autenticación de administrador. 
 * Retorna un mensaje de éxito o error si no se encuentra el producto o si no es un administrador.
 */
app.delete('/api/items/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;

    if (req.user.email !== 'admin@myapp.com') {
        return res.status(403).json({ message: 'Acceso restringido. Solo los administradores pueden eliminar productos.' });
    }

    try {

        await pool.query('BEGIN'); 

        const pgResult = await pool.query('DELETE FROM stock WHERE product_id = $1 RETURNING *', [parseInt(id, 10)]);

        if (pgResult.rowCount > 0) {

            const productsCollection = getProductsCollection();
            
            const product = await productsCollection.findOne({ product_id: parseInt(id, 10) });

            if (product) {

                const deleteResult = await productsCollection.deleteOne({ product_id: parseInt(id, 10) });

                if (deleteResult.deletedCount > 0) {
                    await pool.query('COMMIT');
                    return res.json({ message: 'Producto eliminado exitosamente' });
                } else {
                    await pool.query('ROLLBACK');
                    return res.status(500).json({ message: 'Error al eliminar el producto en MongoDB, se revirtió la eliminación en PostgreSQL' });
                }
            } else {
                await pool.query('ROLLBACK');
                return res.status(500).json({ message: 'Error al eliminar el producto en MongoDB, se revirtió la eliminación en PostgreSQL' });
            }
        } else {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Producto no encontrado en PostgreSQL' });
        }
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        await pool.query('ROLLBACK');
        return res.status(500).json({ message: 'Error al eliminar el producto' });
    }
});

// ------------------ Rutas la gestion de usuarios ------------------

/**
 * Registra un nuevo usuario.
 * Permite que un usuario se registre proporcionando su nombre, correo y contraseña.
 */
app.post('/api/users', async (req, res) => {
    try {
        
        const cartsCollection = getCartsCollection();

        const { name, email, password } = req.body;

        // Validar si el usuario existe
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario en PostgreSQL
        const newUserResult = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
            [name, email, hashedPassword]
        );

        const newUserId = newUserResult.rows[0].id;

        // Insertar carrito en MongoDB
        const newCart = { userId: newUserId, items: [] };
        await cartsCollection.insertOne(newCart);

        res.status(201).json({ message: 'Usuario registrado exitosamente', userId: newUserId });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error al registrar usuario', error });
    }
});

/**
 * Inicia sesión de un usuario.
 * Verifica las credenciales del usuario y, si son correctas, genera un token JWT para acceso posterior.
 */
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });

        res.json({ message: 'Login exitoso', token });

    } catch (error) {
        console.error('Error al realizar login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

/**
 * Acceso al dashboard de administrador.
 * Verifica que el usuario esté autenticado y sea el administrador antes de permitir el acceso.
 */
app.get('/api/admin/dashboard', authenticateJWT, (req, res) => {
    if (req.user.email !== 'admin@myapp.com') {
        return res.status(403).json({ message: 'Acceso solo para el administrador' });
    }
    res.json({ message: 'Bienvenido al dashboard de administrador' });
});

// ------------------ Rutas para el carrito ------------------

/**
 * Agrega un item al carrito de compras de un usuario.
 * Verifica que el carrito exista y actualiza la cantidad del item si ya está presente.
 */
app.post('/api/carts/:userId', authenticateJWT, async (req, res) => {
    const { userId } = req.params;
    let { itemId, name, price, quantity } = req.body;
    
    price = parseFloat(price);
    itemId = parseInt(itemId, 10);
    quantity = parseInt(quantity, 10);

    try {
        const cartsCollection = getCartsCollection();
        const cart = await cartsCollection.findOne({ userId: parseInt(userId, 10) });

        if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

        const existingItem = cart.items.find(item => item.itemId === itemId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ itemId, name, price, quantity });
        }

        await cartsCollection.updateOne(
            { userId: parseInt(userId, 10) },
            { $set: { items: cart.items } }
        );

        return res.json({ message: existingItem ? 'Cantidad actualizada en el carrito' : 'Item agregado al carrito', cart });

    } catch (error) {
        console.error('Error al agregar item al carrito:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

/**
 * Elimina un item del carrito de compras de un usuario.
 * Busca el carrito del usuario, y si el item está presente, lo elimina.
 * Si el item no está en el carrito o el carrito no existe, responde con un error.
 */
app.delete('/api/carts/:userId/items/:itemId', authenticateJWT, async (req, res) => {
    const { userId, itemId } = req.params;

    try {

        const cartsCollection = getCartsCollection();
        // Buscar el carrito del usuario en MongoDB
        const cart = await cartsCollection.findOne({ userId: parseInt(userId, 10) });

        if (cart) {
            // Eliminar el item del carrito
            const updatedCart = await cartsCollection.updateOne(
                { userId: parseInt(userId, 10) },
                { $pull: { items: { itemId: parseInt(itemId, 10) } } }
            );

            if (updatedCart.modifiedCount > 0) {
                res.json({ message: 'Item eliminado del carrito', cart: updatedCart });
            } else {
                res.status(404).json({ message: 'Item no encontrado en el carrito' });
            }
        } else {
            res.status(404).json({ message: 'Carrito no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

/**
 * Obtiene el carrito de un usuario específico.
 */
app.get('/api/carts/:userId', authenticateJWT, async (req, res) => {
    const { userId } = req.params;

    try {

        const cartsCollection = getCartsCollection();
        // Buscar el carrito del usuario en MongoDB
        const cart = await cartsCollection.findOne({ userId: parseInt(userId, 10) });

        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ message: 'Carrito no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// ------------------ Rutas para las compras ------------------

/**
 * Realiza una compra de los productos en el carrito de un usuario.
 * Verifica que el carrito no esté vacío, que los productos existan y haya suficiente stock.
 * Si todo es válido, reduce el stock de los productos y crea una nueva compra.
 * Si hay algún error (carrito vacío, producto no encontrado o stock insuficiente), se responde con un error.
 */
app.post('/api/orders', authenticateJWT, async (req, res) => {
    const userId = req.user.id; 

    try {

        const cartsCollection = getCartsCollection();
        // Buscar el carrito del usuario en MongoDB
        const cart = await cartsCollection.findOne({ userId: parseInt(userId, 10) });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío o no existe.' });
        }

        let totalAmount = 0;
        const invoiceDetails = [];

        // Verificar productos y calcular el total
        for (const item of cart.items) {

            const productsCollection = getProductsCollection();
          
            const product = await productsCollection.findOne({ product_id: item.itemId });

            if (!product) {
                return res.status(404).json({ message: `Producto con ID ${item.itemId} no encontrado.` });
            }

            // Obtener el stock del producto
            const stock = await getStockByProductId(item.itemId);

            if (!stock || stock.cantidad < item.quantity) {
                return res.status(400).json({ message: `No hay suficiente stock para el producto ${product.name}.` });
            }

            const subtotal = product.price * item.quantity;
            totalAmount += subtotal;

            // Agregar el producto al detalle de la factura
            invoiceDetails.push({
                product_id: item.itemId,
                quantity: item.quantity,
                unit_price: product.price,
                product_name: product.name
            });

            // Reducir el stock del producto en la tabla 'stock'
            await updateProductStock(item.itemId, stock.quantity - item.quantity);
        }

        // Crear la factura en la tabla 'facturas'
        const invoice = {
            customer_id: userId,
            total_amount: totalAmount,
        };

        try {
            
            await pool.query('BEGIN');
    
            // Insertar la factura
            const result = await pool.query(
                'INSERT INTO invoices (customer_id, total_amount) VALUES ($1, $2) RETURNING invoice_id',
                [invoice.customer_id, invoice.total_amount]
            );

            const invoice_id = result.rows[0].invoice_id;
    
            // Insertar los detalles de la factura
            for (const detail of invoiceDetails) {
                await pool.query(
                    'INSERT INTO invoice_details (invoice_id, product_id, quantity, unit_price, product_name) VALUES ($1, $2, $3, $4, $5)',
                    [invoice_id, detail.product_id, detail.quantity, detail.unit_price, detail.product_name]
                );
            }

            // Vaciar el carrito
            await cartsCollection.updateOne(
                { userId: parseInt(userId, 10) },
                { $set: { items: [] } }
            );
    
            // Confirmar la transaccion
            await pool.query('COMMIT');
           
            res.status(201).json({ message: 'Compra realizada con éxito!', invoice_id: invoice_id });

        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error al realizar la compra:', error);
            res.status(500).json({ message: 'Hubo un error al procesar la compra.' });
        }

    } catch (error) {
        console.error('Error al realizar la compra:', error);
        res.status(500).json({ message: 'Hubo un error al procesar la compra.' });
    }
    
});

async function getStockByProductId(productId) {
    const result = await pool.query('SELECT * FROM stock WHERE product_id = $1', [productId]);
    return result.rows[0];
}

async function updateProductStock(productId, newStock) {
    await pool.query('UPDATE stock SET quantity = $1 WHERE product_id = $2', [newStock, productId]);
}

/**
 * Obtiene todas las compras de un usuario específico.
 */
app.get('/api/orders/:userId', authenticateJWT, async (req, res) => {
    const { userId } = req.params;

    try {
        
        const ordersResult = await pool.query('SELECT * FROM invoices WHERE customer_id = $1', [userId]);

        if (ordersResult.rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron compras registradas.' });
        }

        const orders = await Promise.all(
            ordersResult.rows.map(async (order) => {
                
                const invoiceDetailsResult = await pool.query(
                    'SELECT * FROM invoice_details WHERE invoice_id = $1', 
                    [order.invoice_id]
                );

                const items = invoiceDetailsResult.rows.map(item => ({
                    itemId: item.product_id,
                    name: item.product_name,
                    price: item.unit_price,
                    quantity: item.quantity
                }));

                return {
                    id: order.invoice_id,
                    userId: order.customer_id,
                    total: order.total_amount,
                    date: order.date,
                    items: items
                };
            })
        );

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las compras.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});