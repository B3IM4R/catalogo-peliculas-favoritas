import Movie from '../models/Movie.js';
import { validationResult } from 'express-validator';
import axios from 'axios';

// CONTROLADOR: Obtener todas las películas del usuario autenticado
// Ruta: GET /api/movies
export const getMovies = async (req, res) => {
  try {
    // Buscamos todas las películas donde el campo 'user' coincida con el ID del usuario logueado
    const movies = await Movie.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });

  } catch (error) {
    console.error('Error en getMovies:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener películas',
      error: error.message
    });
  }
};

// CONTROLADOR: Obtener una película específica por ID
// Ruta: GET /api/movies/:id
export const getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    // Si no existe la película
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada'
      });
    }

    // Verificamos que la película pertenezca al usuario logueado
    if (movie.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta película'
      });
    }

    res.status(200).json({
      success: true,
      data: movie
    });

  } catch (error) {
    console.error('Error en getMovie:', error);
    
    // Si el ID tiene formato inválido
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al obtener película',
      error: error.message
    });
  }
};

// CONTROLADOR: Crear una nueva película
// Ruta: POST /api/movies
export const createMovie = async (req, res) => {
  try {
    // Validaciones
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // Extraemos los datos del body
    const { title, year, director, genre, imdbID, plot } = req.body;

    // Obtenemos el póster desde OMDb usando el imdbID
    let poster = 'https://via.placeholder.com/300x450?text=Sin+Poster';

    try {
      const omdbResponse = await axios.get('http://www.omdbapi.com/', {
        params: {
          apikey: process.env.OMDB_API_KEY,
          i: imdbID
        }
      });
      
      if (omdbResponse.data.Response === 'True' && omdbResponse.data.Poster !== 'N/A') {
        poster = omdbResponse.data.Poster;
      }
    } catch (omdbError) {
      console.error('Error al obtener póster de OMDb:', omdbError.message);
      // Continuamos con el póster por defecto
    }

    // Creamos la película con el póster de OMDb
    const movie = await Movie.create({
      user: req.user._id,
      title,
      year,
      director,
      genre,
      poster,
      imdbID,
      plot
    });

    res.status(201).json({
      success: true,
      message: 'Película creada exitosamente',
      data: movie
    });

  } catch (error) {
    console.error('Error en createMovie:', error);

    // Error de duplicado (índice único: user + title + year)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes esta película en tu catálogo'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear película',
      error: error.message
    });
  }
};

// CONTROLADOR: Actualizar una película
// Ruta: PUT /api/movies/:id
export const updateMovie = async (req, res) => {
  try {
    // Validaciones
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // Buscamos la película
    let movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada'
      });
    }

    // Verificamos que pertenezca al usuario logueado
    if (movie.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar esta película'
      });
    }

    // Si se actualiza el imdbID, obtenemos el nuevo póster de OMDb
    if (req.body.imdbID && req.body.imdbID !== movie.imdbID) {
      try {
        const omdbResponse = await axios.get('http://www.omdbapi.com/', {
          params: {
            apikey: process.env.OMDB_API_KEY,
            i: req.body.imdbID
          }
        });
        
        if (omdbResponse.data.Response === 'True' && omdbResponse.data.Poster !== 'N/A') {
          req.body.poster = omdbResponse.data.Poster;
        }
      } catch (omdbError) {
        console.error('Error al obtener póster de OMDb:', omdbError.message);
      }
    }

    // Actualizamos
    movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Película actualizada exitosamente',
      data: movie
    });

  } catch (error) {
    console.error('Error en updateMovie:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes una película con ese título y año'
      });
    }

    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar película',
      error: error.message
    });
  }
};

// CONTROLADOR: Eliminar una película
// Ruta: DELETE /api/movies/:id
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada'
      });
    }

    // Verificamos que pertenezca al usuario logueado
    if (movie.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta película'
      });
    }

    // Eliminamos la película
    await movie.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Película eliminada exitosamente',
      data: {}
    });

  } catch (error) {
    console.error('Error en deleteMovie:', error);

    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar película',
      error: error.message
    });
  }
};