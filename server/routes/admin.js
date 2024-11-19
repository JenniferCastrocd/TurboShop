const express = require('express');
const router = express.Router();
const Product = require('../models/product');

router.post('/products', (req, res) => {
    console.log('Request body:', req.body);  // Añadir log para ver los datos recibidos
    const newProduct = new Product(req.body.name, req.body.description, req.body.price, req.body.quantity);
    Product.addProduct(newProduct);
    console.log('Product added:', newProduct);  // Añadir log para confirmar la adición del producto
    res.status(201).json({ success: true });
});


module.exports = router;
