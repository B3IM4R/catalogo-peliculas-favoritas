import { getAuthHeaders } from '../utils/auth.js';

import API_URL from '../config.js';

// Busca películas por título en OMDb
export const searchMovies = async (title) => {
  try {
    const response = await fetch(`${API_URL}/omdb/search?title=${encodeURIComponent(title)}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al buscar películas');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Obtiene detalles completos de una película por IMDb ID
export const getMovieDetails = async (imdbID) => {
  try {
    const response = await fetch(`${API_URL}/omdb/movie/${imdbID}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener detalles de la película');
    }

    return data;
  } catch (error) {
    throw error;
  }
};