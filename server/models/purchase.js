const mongoose = require('mongoose');

// Definición del esquema
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true, // Obligatorio
            trim: true // Elimina espacios en blanco al principio y al final
        },
        products: [
            {
                name: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0 // El precio no puede ser negativo
                }
            }
        ],
        date: {
            type: Date,
            default: Date.now // Fecha por defecto: fecha de creación
        }
    },
    {
        timestamps: true, // Agrega automáticamente createdAt y updatedAt
        versionKey: false,
    }
);

// Crear el modelo
const ModelUser = mongoose.model("purchase", userSchema);

module.exports = ModelUser;
