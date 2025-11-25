import mongoose from 'mongoose';

/**
 * Función para conectar a MongoDB Atlas
 * Es asíncrona porque la conexión toma tiempo
 */
const connectDB = async () => {
  try {
    // Intentamos conectar usando la URL que está en las variables de entorno
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // Si la conexión es exitosa, mostramos un mensaje en consola
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    // Si hay un error, lo mostramos en consola
    console.error(`❌ Error al conectar MongoDB: ${error.message}`);
    
    // process.exit(1) detiene la aplicación con código de error
    process.exit(1);
  }
};

export default connectDB;