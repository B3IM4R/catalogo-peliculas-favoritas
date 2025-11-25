import express from 'express';
import { register, login } from '../controllers/authController.js';
import { body } from 'express-validator';

// Creamos un router
const router = express.Router();

// RUTA: POST /api/auth/register
// Descripción: Registra un nuevo usuario
router.post(
  '/register',
  [
    // Validaciones
    body('name')
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('El email es obligatorio')
      .isEmail().withMessage('Debe ser un email válido')
      .normalizeEmail(),
    
    body('password')
      .notEmpty().withMessage('La contraseña es obligatoria')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
  ],
  register  // Si pasa las validaciones, ejecuta el controlador register
);

// RUTA: POST /api/auth/login
// Descripción: Inicia sesión un usuario existente
router.post(
  '/login',
  [
    // Validaciones para login
    body('email')
      .trim()
      .notEmpty().withMessage('El email es obligatorio')
      .isEmail().withMessage('Debe ser un email válido'),
    
    body('password')
      .notEmpty().withMessage('La contraseña es obligatoria')
  ],
  login  // Ejecuta el controlador login
);


export default router;