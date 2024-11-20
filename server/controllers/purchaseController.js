const Purchase = require('../models/purchase');

// Crear una nueva compra
exports.createPurchase = async (req, res) => {
    try {
        const body = req.body;
        const newPurchase = await Purchase.create(body);
        res.status(201).send(newPurchase);
    } catch (error) {
        res.status(500).send({ error: 'Error al crear la compra', details: error.message });
    }
};

// Obtener todas las compras
exports.getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find({});
        res.send(purchases);
    } catch (error) {
        res.status(500).send({ error: 'Error al obtener las compras', details: error.message });
    }
};

// Obtener una compra por ID
exports.getPurchaseById = async (req, res) => {
    try {
        const id = req.params.id;
        const purchase = await Purchase.findById(id);
        if (!purchase) {
            return res.status(404).send({ error: 'Compra no encontrada' });
        }
        res.send(purchase);
    } catch (error) {
        res.status(500).send({ error: 'Error al obtener la compra', details: error.message });
    }
};

// Actualizar una compra por ID
exports.updatePurchase = async (req, res) => {
    try {
        const id = req.params.id;
        const body = req.body;
        const updatedPurchase = await Purchase.findOneAndReplace({ _id: id }, body);
        if (!updatedPurchase) {
            return res.status(404).send({ error: 'Compra no encontrada' });
        }
        res.send(updatedPurchase);
    } catch (error) {
        res.status(500).send({ error: 'Error al actualizar la compra', details: error.message });
    }
};

// Eliminar una compra por ID
exports.deletePurchase = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Purchase.deleteOne({ _id: id });
        if (!result.deletedCount) {
            return res.status(404).send({ error: 'Compra no encontrada' });
        }
        res.send({ message: 'Compra eliminada con éxito' });
    } catch (error) {
        res.status(500).send({ error: 'Error al eliminar la compra', details: error.message });
    }
};
