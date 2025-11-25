import express from 'express';
import {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie
} from '../controllers/moviesController.js';

import { protect } from '../middleware/auth.js';
import { body } from 'express-validator';

// Creamos el router
const router = express.Router();

// TODAS las rutas de este archivo requieren autenticación
// Por eso aplicamos el middleware protect a todas

// RUTA: GET /api/movies
// Descripción: Obtiene todas las películas del usuario autenticado
router.get('/', protect, getMovies);

// RUTA: GET /api/movies/:id
// Descripción: Obtiene una película específica por ID
router.get('/:id', protect, getMovie);

// RUTA: POST /api/movies
// Descripción: Crea una nueva película
router.post(
  '/',
  protect,  // Primero verifica autenticación
  [
    // Luego valida los datos
    body('title')
      .trim()
      .notEmpty().withMessage('El título es obligatorio')
      .isLength({ max: 200 }).withMessage('El título no puede exceder 200 caracteres'),
    
    body('year')
      .notEmpty().withMessage('El año es obligatorio')
      .isInt({ min: 1888, max: new Date().getFullYear() + 5 })
      .withMessage('El año debe estar entre 1888 y 5 años en el futuro'),
    
    body('director')
      .trim()
      .notEmpty().withMessage('El director es obligatorio')
      .isLength({ max: 100 }).withMessage('El director no puede exceder 100 caracteres'),
    
    body('genre')
      .trim()
      .notEmpty().withMessage('El género es obligatorio'),
    
    body('imdbID')
      .notEmpty().withMessage('El IMDb ID es obligatorio')
      .trim(),
    
    body('plot')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('La sinopsis no puede exceder 1000 caracteres')
  ],
  createMovie  // Finalmente ejecuta el controlador
);

// RUTA: PUT /api/movies/:id
// Descripción: Actualiza una película existente
router.put(
  '/:id',
  protect,
  [
    // Validaciones que permiten actualizar solo los campos que el usuario quiera
    body('title')
      .optional()
      .trim()
      .notEmpty().withMessage('El título no puede estar vacío')
      .isLength({ max: 200 }).withMessage('El título no puede exceder 200 caracteres'),
    
    body('year')
      .optional()
      .isInt({ min: 1888, max: new Date().getFullYear() + 5 })
      .withMessage('El año debe estar entre 1888 y 5 años en el futuro'),
    
    body('director')
      .optional()
      .trim()
      .notEmpty().withMessage('El director no puede estar vacío')
      .isLength({ max: 100 }).withMessage('El director no puede exceder 100 caracteres'),
    
    body('genre')
      .optional()
      .trim()
      .notEmpty().withMessage('El género no puede estar vacío'),
    
    body('imdbID')
      .optional()
      .trim(),
    
    body('plot')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('La sinopsis no puede exceder 1000 caracteres')
  ],
  updateMovie
);

// RUTA: DELETE /api/movies/:id
// Descripción: Elimina una película
router.delete('/:id', protect, deleteMovie);

export default router;