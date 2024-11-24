const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Purchase = require('../models/purchase');
const Invoice = require('../models/invoice')
const Order = require('../models/order')
const OrderItem = require('../models/order_item')


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


// Ruta para recibir productos (finished)
router.get('/products', (req, res) => {
  res.json(Product.getAllProducts());
});

// Ruta para obtener un producto específico por nombre (finished)
router.get('/product', (req, res) => {
  const productName = req.query.productName;
  res.json(Product.getAllProducts().find((product) => product.name === productName));
});

// Ruta para obtener las compras de un usuario (finished)
router.get('/purchases', async (req, res) => {
  const username = req.query.username;

  if (!username) {
      return res.status(400).json({ error: "El parámetro 'username' es requerido." });
  }

  try {
      // Consulta las órdenes del usuario
      const orders = await Order.getOrdersByUser(username);
      if (orders.length === 0) {
          return res.status(404).json({ message: "No se encontraron órdenes para el usuario proporcionado." });
      }
      res.json(orders);
  } catch (error) {
      console.error('Error al obtener las compras del usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

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
      let totalPrice = 0;

      for (const productRequest of productRequests) {
          const productData = await Product.findProduct(productRequest.productName);

          if (!productData) {
              console.error(`Producto ${productRequest.productName} no encontrado.`);
              return res.status(404).json({ error: `Producto "${productRequest.productName}" no encontrado.` });
          }

          if (productData.quantity < productRequest.productQuantity) {
              return res.status(400).json({
                  error: `No hay suficiente stock para el producto "${productRequest.productName}".`
              });
          }

          // Agregar producto al carrito y calcular el total
          const productTotalPrice = productData.price * productRequest.productQuantity;
          products.push({
              productId: productData.id, // Asegúrate de tener el ID del producto en tu modelo
              name: productRequest.productName,
              price: productTotalPrice,
              unitPrice: productData.price,
              units: productRequest.productQuantity
          });
          totalPrice += productTotalPrice;

          // Actualizar la cantidad en stock
          await Product.updateProductQuantity(
              productRequest.productName,
              productRequest.productQuantity
          );
      }

      // Crear una orden
      const order = await Order.createOrder({
          userId: username, // Supongamos que username está relacionado con user_id
          totalPrice: totalPrice
      });

      // Crear los artículos de la orden
      for (const product of products) {
          await OrderItem.createOrderItem({
              orderId: order.order_id,
              productId: product.productId,
              quantity: product.units,
              unitPrice: product.unitPrice
          });
      }

      // Crear la factura
      const invoice = await Invoice.createInvoice({
          orderId: order.order_id,
          totalAmount: totalPrice
      });

      // Responder con éxito
      res.status(201).json({
          success: true,
          message: 'Compra registrada con éxito.',
          order,
          invoice,
          products
      });
  } catch (error) {
      console.error('Error al registrar la compra:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;