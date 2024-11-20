const express = require('express');
const bodyParser = require('body-parser');
const dbconnect = require('./config');
const purchaseRoutes = require('./routes/purchaseRoutes');
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');
const authRoutes = require('./routes/auth');

const app = express();

// Conectar a la base de datos
dbconnect();

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Rutas
app.use('/purchase', purchaseRoutes);  // Rutas para el carrito de compras
app.use('/admin', adminRoutes);        // Rutas para administración
app.use('/client', clientRoutes);      // Rutas para clientes
app.use('/auth', authRoutes);          // Rutas para autenticación

// Archivos estáticos
app.use(express.static('public'));

// Puerto y servidor
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
