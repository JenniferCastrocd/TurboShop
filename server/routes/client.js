const express = require('express');
const router = express.Router();
const Product = require('../models/product'); // Modelo del producto, que ya usa la base de datos correctamente

// Ruta para obtener todos los productos
router.get('/client', async (req, res) => {
  try {
    console.log('Solicitud recibida para obtener productos');
    const products = await Product.getAllProducts();
    console.log('Productos obtenidos:', products);
    res.status(200).json({ success: true, products });
} catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos.' });
}
});

// Ruta para registrar una compra
router.post('/purchase', async (req, res) => {
    try {
        console.log('Request body:', req.body);

        const username = req.body.username;
        const productRequests = req.body.products;

        // Validar los datos entrantes
        if (!username || !productRequests || productRequests.length === 0) {
            return res.status(400).json({ error: 'Datos incompletos. Se requiere un usuario y productos.' });
        }

        const products = [];
        for (const productRequest of productRequests) {
            const productData = await Product.findProduct(productRequest.productName); // Buscar producto en la BD

            if (productData) {
                if (productData.quantity < productRequest.productQuantity) {
                    return res.status(400).json({
                        error: `No hay suficiente stock para el producto "${productRequest.productName}".`
                    });
                }

                products.push({
                    name: productRequest.productName,
                    price: productData.price * productRequest.productQuantity, // Precio total
                    unitPrice: productData.price, // Precio unitario
                    units: productRequest.productQuantity // Cantidad comprada
                });

                // Actualizar la cantidad en stock
                await Product.updateProductQuantity(
                    productRequest.productName,
                    productRequest.productQuantity
                );
            } else {
                console.error(`Producto ${productRequest.productName} no encontrado.`);
                return res.status(404).json({ error: `Producto "${productRequest.productName}" no encontrado.` });
            }
        }

        // Guardar la compra en la base de datos (puedes usar un modelo `Purchase`)
        // Simulando un ejemplo aquí:
        console.log('Compra registrada:', { username, products });

        res.status(201).json({ success: true, message: 'Compra registrada con éxito.' });
    } catch (error) {
        console.error('Error al registrar la compra:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;
