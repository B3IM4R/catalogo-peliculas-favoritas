import { getAuthHeaders } from '../utils/auth.js';

import API_URL from '../config.js';

// Obtiene todas las películas del usuario
export const getMovies = async () => {
  try {
    const response = await fetch(`${API_URL}/movies`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener películas');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Obtiene una película específica
export const getMovie = async (id) => {
  try {
    const response = await fetch(`${API_URL}/movies/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener película');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Crea una nueva película
export const createMovie = async (movieData) => {
  try {
    const response = await fetch(`${API_URL}/movies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(movieData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al crear película');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Actualiza una película
export const updateMovie = async (id, movieData) => {
  try {
    const response = await fetch(`${API_URL}/movies/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(movieData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar película');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Elimina una película
export const deleteMovie = async (id) => {
  try {
    const response = await fetch(`${API_URL}/movies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al eliminar película');
    }

    return data;
  } catch (error) {
    throw error;
  }
};