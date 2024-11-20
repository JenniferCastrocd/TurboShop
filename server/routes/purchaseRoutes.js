const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

// Rutas CRUD para el carrito de compras
router.post('/', purchaseController.createPurchase);
router.get('/', purchaseController.getPurchases);
router.get('/:id', purchaseController.getPurchaseById);
router.put('/:id', purchaseController.updatePurchase);
router.delete('/:id', purchaseController.deletePurchase);

module.exports = router;
