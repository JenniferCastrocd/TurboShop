const express = require('express');
const router = express.Router();
const Product = require('../models/product'); // Modelo de producto

// Ruta para agregar un nuevo producto
router.post('/products', async (req, res) => {
    try {
        const { name, description, price, quantity } = req.body;
        const newProduct = await Product.addProduct({ name, description, price, quantity });
        res.status(201).json({ success: true, message: 'Producto agregado con éxito', product: newProduct });
    } catch (error) {
        console.error('Error al agregar producto:', error);
        res.status(500).json({ success: false, message: 'Error al agregar producto' });
    }
});

// Ruta para obtener todos los productos
router.get('/products', async (req, res) => {
    try {
        const products = await Product.getAllProducts();
        res.json({ success: true, products });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

module.exports = router;
