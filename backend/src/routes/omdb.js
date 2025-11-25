import express from 'express';
import { searchMovies, getMovieDetails } from '../controllers/omdbController.js';
import { protect } from '../middleware/auth.js';

// Creamos el router
const router = express.Router();

// RUTA: GET /api/omdb/search?title=inception
// Descripción: Busca películas por título en OMDb
router.get('/search', protect, searchMovies);

// RUTA: GET /api/omdb/movie/:imdbID
// Descripción: Obtiene detalles completos de una película por IMDb ID
router.get('/movie/:imdbID', protect, getMovieDetails);

export default router;