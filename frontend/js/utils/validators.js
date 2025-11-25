// Géneros válidos de OMDb
const VALID_GENRES = [
  'action', 'adventure', 'animation', 'biography', 'comedy', 'crime', 
  'documentary', 'drama', 'family', 'fantasy', 'film-noir', 'history', 
  'horror', 'music', 'musical', 'mystery', 'romance', 'sci-fi', 
  'sport', 'thriller', 'war', 'western'
];

/**
 * Valida que el género sea válido de OMDb
 * @param {string} genre - Género o géneros separados por coma
 * @returns {boolean} true si es válido
 */
export function validateGenre(genre) {
  const genres = genre.toLowerCase().split(',').map(g => g.trim());
  
  for (let g of genres) {
    if (!VALID_GENRES.includes(g)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Obtiene el mensaje de error con todos los géneros válidos
 * @returns {string} Mensaje de error completo
 */
export function getGenreErrorMessage() {
  const genresCapitalized = VALID_GENRES.map(g => {
    return g.charAt(0).toUpperCase() + g.slice(1);
  }).join(', ');
  
  return `Ingresa géneros válidos separados por coma: ${genresCapitalized}`;
}

/**
 * Valida los datos de una película antes de enviar al backend
 * @param {Object} data - Datos de la película
 * @param {string} imdbID - ID validado de OMDb
 * @returns {string|null} Mensaje de error o null si es válido
 */
export function validateMovieData(data, imdbID) {
  const { title, year, director, genre, plot } = data;

  // Validar imdbID
  if (!imdbID) {
    return 'Debes ingresar un título válido que exista en OMDb';
  }

  // Validar título
  if (!title || title.length === 0 || title.length > 200) {
    return 'El título es obligatorio y debe tener máximo 200 caracteres';
  }

  // Validar año
  if (isNaN(year) || year < 1888 || year > 2030) {
    return 'El año debe estar entre 1888 y 2030';
  }

  // Validar director
  if (!director || director.length < 3 || director.length > 100) {
    return 'El director debe tener entre 3 y 100 caracteres';
  }

  // Validar género
  if (!genre || genre.length === 0) {
    return 'El género es obligatorio';
  }

  if (!validateGenre(genre)) {
    return getGenreErrorMessage();
  }

  // Validar sinopsis (opcional)
  if (plot && plot.length > 1000) {
    return 'La sinopsis no puede exceder 1000 caracteres';
  }

  return null; // Todo válido
}