import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

/**
 * FUNCIÓN AUXILIAR: Genera un token JWT
 * @param {string} id - ID del usuario
 * @returns {string} Token JWT firmado
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Registrar nuevo usuario
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Si hay errores, devolvemos un 400 (Bad Request) con los errores
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // 2. Extraemos los datos del body de la petición
    const { name, email, password } = req.body;

    // 3. Verificamos si el email ya existe en la base de datos
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // 4. Creamos el nuevo usuario
    const user = await User.create({
      name,
      email,
      password
    });

    // 5. Generamos el token JWT
    const token = generateToken(user._id);

    // 6. Respondemos con éxito (201 = Created)
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token
      }
    });

  } catch (error) {
    // Si hay un error inesperado, respondemos con 500 (Internal Server Error)
    console.error('Error en register:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// CONTROLADOR: Iniciar sesión
export const login = async (req, res) => {
  try {
    // 1. Validamos los errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // 2. Extraemos email y password del body
    const { email, password } = req.body;

    // 3. Buscamos el usuario por email
    const user = await User.findOne({ email }).select('+password');

    // 4. Verificamos si el usuario existe
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // 5. Verificamos si la contraseña es correcta
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // 6. Generamos el token JWT
    const token = generateToken(user._id);

    // 7. Respondemos con éxito
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};