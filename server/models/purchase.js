const mongoose = require('mongoose');

// Definición del esquema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true, // Obligatorio
      trim: true, // Elimina espacios en blanco al principio y al final
    },
    products: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0, // El precio no puede ser negativo
        },
        unitPrice: {
          type: Number,
          required: true, // Asegúrate de que el precio unitario sea obligatorio
        },
        units: {
          type: Number,
          required: true, // Asegúrate de que el número de unidades sea obligatorio
        },
      },
    ],
    date: {
      type: Date,
      default: Date.now, // Fecha por defecto: fecha de creación
    },
  },
  {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
    versionKey: false,
  }
);

// Crear el modelo
const ModelUser = mongoose.model("purchase", userSchema);

module.exports = ModelUser;
