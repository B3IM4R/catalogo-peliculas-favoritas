import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// MIDDLEWARE: Protege rutas que requieren autenticación
// Verifica que el token JWT sea válido
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Verificamos si viene el token en el header Authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extraemos el token (quitamos la palabra "Bearer ")
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Si no hay token, rechazamos la petición
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado, token no proporcionado'
      });
    }

    // 3. Verificamos que el token sea válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Buscamos el usuario en la base de datos
    req.user = await User.findById(decoded.id).select('-password');

    // 5. Si el usuario no existe, rechazamos
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // 6. Si todo está bien, continuamos a la siguiente función (controlador)
    next();

  } catch (error) {
    console.error('Error en middleware protect:', error);
    
    // Si el token expiró o es inválido
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    // Otros errores
    res.status(500).json({
      success: false,
      message: 'Error al verificar autenticación',
      error: error.message
    });
  }
};