import { smartCapitalize } from '../utils/formatters.js';

/**
 * Crea el HTML interno de una card de película
 * @param {Object} movie - Datos de la película
 * @returns {string} HTML de la card
 */
export function createMovieCardHTML(movie) {
  return `
    <div class="relative h-96 bg-gray-200 flex-shrink-0">
      <img 
        src="${movie.poster}" 
        alt="${smartCapitalize(movie.title)}"
        class="w-full h-full object-cover"
        onerror="this.src='https://via.placeholder.com/300x450?text=Sin+Poster'"
      >
    </div>
    
    <div class="p-4 flex flex-col flex-grow">
      <h3 class="font-bold text-lg text-gray-800 mb-2 truncate" title="${smartCapitalize(movie.title)}">
        ${smartCapitalize(movie.title)}
      </h3>
      
      <p class="text-gray-600 text-sm mb-1 font-semibold">
        ${movie.year}
      </p>
      
      <p class="text-gray-600 text-sm mb-4 truncate" title="${smartCapitalize(movie.genre)}">
        ${smartCapitalize(movie.genre)}
      </p>
      
      <div class="mt-auto">
        <button 
          onclick="window.viewMovieDetails('${movie._id}')"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-medium text-sm"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  `;
}

/**
 * Renderiza todas las películas en el grid
 * @param {Array} movies - Array de películas
 * @param {HTMLElement} container - Contenedor donde renderizar
 */
export function renderMovies(movies, container) {
  container.innerHTML = movies.map(movie => `
    <div class="bg-white rounded-xl shadow-md overflow-hidden movie-card flex flex-col h-full">
      ${createMovieCardHTML(movie)}
    </div>
  `).join('');
}

/**
 * Agrega una película al inicio del grid
 * @param {Object} movie - Datos de la película
 * @param {HTMLElement} container - Contenedor donde agregar
 * @param {HTMLElement} emptyState - Elemento de estado vacío a ocultar
 */
export function addMovieToGrid(movie, container, emptyState) {
  const movieCard = document.createElement('div');
  movieCard.className = 'bg-white rounded-xl shadow-md overflow-hidden movie-card flex flex-col h-full';
  movieCard.innerHTML = createMovieCardHTML(movie);

  if (container.classList.contains('hidden')) {
    emptyState.classList.add('hidden');
    container.classList.remove('hidden');
  }

  container.prepend(movieCard);
}