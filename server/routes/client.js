const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Purchase = require('../models/purchase');

// Ruta para recibir productos
router.get('/products', (req, res) => {
  res.json(Product.getAllProducts());
});

// Ruta para obtener un producto específico por nombre
router.get('/product', (req, res) => {
  const productName = req.query.productName;
  res.json(Product.getAllProducts().find((product) => product.name === productName));
});

// Ruta para obtener las compras de un usuario
router.get('/purchases', (req, res) => {
  res.json(Purchase.getUserPurchases(req.query.username));
});

// Ruta para registrar una compra
router.post('/purchase', (req, res) => {
  console.log('Request body:', req.body);  // Añadir log para ver los datos recibidos
  
  const username = req.body.username;
  const products = req.body.products.map(product => {
    // Consultamos el producto en la lista para obtener el precio
    const productData = Product.getAllProducts().find(p => p.name === product.productName);

    // Si el producto existe, calculamos el precio total (precio * cantidad)
    if (productData) {
      return {
        name: product.productName,
        price: productData.price * product.productQuantity // Multiplicamos el precio por la cantidad
      };
    } else {
      console.log(`Producto ${product.productName} no encontrado`);
      return {
        name: product.productName,
        price: 0 // Precio por defecto si no se encuentra el producto
      };
    }
  });

  // Crear la nueva instancia de Purchase
  const newPurchase = new Purchase({
    username: username,
    products: products
  });

  // Guardar la compra en la base de datos
  newPurchase.save()
    .then(() => {
      console.log('Compra guardada en la base de datos');
      
      // Actualizar la cantidad de productos después de la compra
      const products = req.body.products;
      products.forEach(p => {
        console.log(p);
        Product.updateProductQuantity(p.productName, p.productQuantity); // Actualizamos la cantidad
        console.log(`Updated quantity for product ${p.productName}`);
      });

      res.status(201).json({ success: true });
    })
    .catch(error => {
      console.error('Error al guardar la compra:', error);
      res.status(500).json({ error: 'Error al guardar la compra' });
    });
});

module.exports = router;
