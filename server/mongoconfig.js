const { MongoClient } = require('mongodb');

// Configuración de MongoDB
const mongoUri = 'mongodb://localhost:27017';
const client = new MongoClient(mongoUri);

let cartsCollection;
let productsCollection;

const connectMongoDB = async () => {
    try {
        await client.connect();
        const db = client.db('user_prueba');
        cartsCollection = db.collection('carts');
        productsCollection = db.collection('products');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        process.exit(1);
    }
};

module.exports = {
    connectMongoDB,
    getCartsCollection: () => cartsCollection,
    getProductsCollection: () => productsCollection
};