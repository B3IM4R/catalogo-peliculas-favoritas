import axios from 'axios';

// CONTROLADOR: Buscar películas en OMDb API
// Ruta: GET /api/omdb/search?title=inception
export const searchMovies = async (req, res) => {
  try {
    // Obtenemos el título que el usuario quiere buscar desde los query params
    const { title } = req.query;

    // Validamos que el usuario haya enviado un título
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Debes proporcionar un título para buscar'
      });
    }

    // Hacemos la petición a OMDb API
    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        apikey: process.env.OMDB_API_KEY,
        s: title,
        type: 'movie'
      }
    });

    // OMDb devuelve Response: "True" si hay resultados, "False" si no
    if (response.data.Response === 'False') {
      return res.status(404).json({
        success: false,
        message: response.data.Error || 'No se encontraron películas'
      });
    }

    // Devolvemos los resultados
    res.status(200).json({
      success: true,
      count: response.data.Search.length,
      data: response.data.Search
    });

  } catch (error) {
    console.error('Error en searchMovies:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar películas en OMDb',
      error: error.message
    });
  }
};

// CONTROLADOR: Obtener detalles completos de una película por IMDb ID
// Ruta: GET /api/omdb/movie/:imdbID
export const getMovieDetails = async (req, res) => {
  try {
    // Obtenemos el IMDb ID desde los parámetros de la URL
    const { imdbID } = req.params;

    // Hacemos la petición a OMDb API
    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        apikey: process.env.OMDB_API_KEY,
        i: imdbID,
        plot: 'full'
      }
    });

    if (response.data.Response === 'False') {
      return res.status(404).json({
        success: false,
        message: response.data.Error || 'Película no encontrada'
      });
    }

    // Formateamos los datos para que coincidan con nuestro modelo
    const movieData = {
      title: response.data.Title,
      year: parseInt(response.data.Year),
      director: response.data.Director,
      genre: response.data.Genre,
      poster: response.data.Poster !== 'N/A' ? response.data.Poster : 'https://via.placeholder.com/300x450?text=Sin+Poster',
      imdbID: response.data.imdbID,
      plot: response.data.Plot !== 'N/A' ? response.data.Plot : ''
    };

    res.status(200).json({
      success: true,
      data: movieData
    });

  } catch (error) {
    console.error('Error en getMovieDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles de la película',
      error: error.message
    });
  }
};