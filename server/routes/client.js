const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Order = require('../models/order');
const Order = require('../models/order'); //modelo de la orden 

// Ruta para registrar una orden
router.post('/orders', async (req, res) => {
  try {
    const { username, products } = req.body;

    if (!username || !products || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Datos incompletos.' });
    }

    const result = await Order.createOrder(username, products);
    res.status(201).json({ success: true, orderId: result.orderId });
  } catch (error) {
    console.error('Error al registrar la orden:', error);
    res.status(500).json({ success: false, message: 'Error al registrar la orden.', error: error.message });
  }
});

// Ruta para obtener todos los productos
router.get('/client', async (req, res) => {
    try {
        const products = await Product.getAllProducts();
        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener productos.' });
    }
});

// Función para procesar la compra
async function handlePurchase(shoppingCart) {
  try {
    const purchaseData = {
      username: localStorage.getItem("myUsername"),
      products: shoppingCart,
    };

    // Realizar la compra (actualizar inventario)
    const response = await fetch('/client/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchaseData),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      // Guardar la orden en la base de datos
      const orderResponse = await fetch('/client/orders', { // Confirma que esta URL es válida en el servidor
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData),
      });

      if (!orderResponse.ok) {
        throw new Error(`Error HTTP al guardar la orden: ${orderResponse.status}`);
      }

      const orderData = await orderResponse.json();
      if (orderData.success) {
        alert('Compra realizada y orden registrada con éxito.');
        localStorage.removeItem('shoppingCart'); // Limpiar el carrito después de la compra
        window.location.href = '/client.html';
      } else {
        alert('Error al registrar la orden.');
      }
    } else {
      alert('Error al realizar la compra.');
    }
  } catch (error) {
    console.error('Error durante la compra:', error);
  }
}

module.exports = router;


