const express = require('express');
const bodyParser = require('body-parser');
const dbconnect = require('./config');
const purchaseRoutes = require('./routes/purchaseRoutes');
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');
const authRoutes = require('./routes/auth');
const path = require('path');

app.use(express.static(path.join(__dirname, '../public')));
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use('/client/orders', require('./routes/orderRoutes'));


// Conectar a la base de datos
dbconnect();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rutas
app.use('/purchase', purchaseRoutes);  // Rutas para el carrito de compras
app.use('/admin', adminRoutes);        // Rutas para administración
app.use('/client', clientRoutes);      // Rutas para clientes
app.use('/auth', authRoutes);          // Rutas para autenticación
app.use('/client/orders', orderRoutes);

app.use(clientRoutes);

// Archivos estáticos
app.use(express.static('public'));

// Puerto y servidor
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

const User = require('./models/user');

async function createDefaultAdmin() {
    try {
        const adminExists = await User.findUser('admin');
        if (!adminExists) {
            await User.addUser({
                username: 'admin',
                password: 'adminpassword',
                role: 'admin',
            });
            console.log('Administrador predeterminado creado');
        }
    } catch (error) {
        console.error('Error al crear administrador predeterminado:', error);
    }
}

createDefaultAdmin();

