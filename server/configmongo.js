const mongoose = require('mongoose'); 

const dbconnect = async () => {
    try {
        mongoose.set('strictQuery', true); // Configuración explícita para evitar advertencias futuras
        await mongoose.connect("mongodb://127.0.0.1:27017/user_prueba");
        console.log("Conexión exitosa");
    } catch (error) {
        console.error("Error en la conexión a la base de datos:", error);
    }
};

module.exports = dbconnect;