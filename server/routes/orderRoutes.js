const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController'); // Controlador que maneja la lógica

// Ruta para obtener órdenes por usuario
router.get('/', orderController.getOrdersByUser);

// Ruta para crear una nueva orden
router.post('/', orderController.createOrder);

module.exports = router;


