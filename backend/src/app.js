import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';

// Creamos la aplicación de Express
const app = express();

// Obtenemos el puerto desde las variables de entorno, o usamos 3000 por defecto
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.json({
    message: '🎬 API de Catálogo de Películas',
    version: '1.0.0',
    status: 'running'
  });
});

const startServer = async () => {
  try {
    // Primero conectamos a la base de datos
    await connectDB();
    
    // Si la conexión es exitosa, iniciamos el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    // Si algo falla, mostramos el error
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

// Iniciamos el servidor
startServer();