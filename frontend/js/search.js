import { searchMovies, getMovieDetails } from './api/omdb.js';
import { createMovie } from './api/movies.js';
import { getUser, logout, requireAuth } from './utils/auth.js';

// Verificar autenticación
requireAuth();

// Elementos del navbar
const dropdownUserName = document.getElementById('dropdownUserName');
const dropdownUserEmail = document.getElementById('dropdownUserEmail');
const accountDropdownBtn = document.getElementById('accountDropdownBtn');
const accountDropdownMenu = document.getElementById('accountDropdownMenu');
const logoutBtnDropdown = document.getElementById('logoutBtnDropdown');

// Elementos del DOM
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const initialState = document.getElementById('initialState');
const resultsGrid = document.getElementById('resultsGrid');
const moviesGrid = document.getElementById('moviesGrid');
const searchTerm = document.getElementById('searchTerm');
const detailsModal = document.getElementById('detailsModal');
const modalContent = document.getElementById('modalContent');

// Cache de detalles de películas
const movieDetailsCache = {};

// Inicializar navbar
const user = getUser();
dropdownUserName.textContent = user.name;
dropdownUserEmail.textContent = user.email;

// Event listeners del navbar
logoutBtnDropdown.addEventListener('click', logout);

accountDropdownBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  accountDropdownMenu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  if (!accountDropdownBtn.contains(e.target) && !accountDropdownMenu.contains(e.target)) {
    accountDropdownMenu.classList.add('hidden');
  }
});

// Event listeners de búsqueda
searchForm.addEventListener('submit', handleSearch);

// Cerrar modal al hacer click fuera del contenido
detailsModal.addEventListener('click', (e) => {
  if (e.target === detailsModal) {
    closeModal();
  }
});

/**
 * Maneja la búsqueda de películas
 */
async function handleSearch(e) {
  e.preventDefault();

  const query = searchInput.value.trim();

  if (query.length < 2) {
    showErrorNotification('Por favor ingresa al menos 2 caracteres');
    return;
  }

  try {
    // Ocultar estados previos
    initialState.classList.add('hidden');
    errorState.classList.add('hidden');
    resultsGrid.classList.add('hidden');
    loadingState.classList.remove('hidden');

    // Buscar películas
    const response = await searchMovies(query);
    const movies = response.data;

    loadingState.classList.add('hidden');

    if (movies.length === 0) {
      errorState.textContent = 'No se encontraron películas con ese título';
      errorState.classList.remove('hidden');
      return;
    }

    // Mostrar resultados
    searchTerm.textContent = query;
    resultsGrid.classList.remove('hidden');
    
    // Cargar detalles de cada película para obtener el género
    await loadMoviesWithDetails(movies);

  } catch (error) {
    console.error('Error al buscar películas:', error);
    loadingState.classList.add('hidden');
    errorState.textContent = error.message || 'Error al buscar películas';
    errorState.classList.remove('hidden');
  }
}

/**
 * Carga los detalles de cada película para obtener géneros
 */
async function loadMoviesWithDetails(movies) {
  const moviesWithGenres = await Promise.all(
    movies.map(async (movie) => {
      try {
        // Si ya está en cache, usar ese
        if (movieDetailsCache[movie.imdbID]) {
          return { ...movie, genre: movieDetailsCache[movie.imdbID].genre };
        }

        // Si no, obtener detalles
        const response = await getMovieDetails(movie.imdbID);
        const details = response.data;
        
        // Guardar en cache
        movieDetailsCache[movie.imdbID] = details;
        
        return { ...movie, genre: details.genre };
      } catch (error) {
        console.error(`Error al obtener género de ${movie.Title}:`, error);
        return { ...movie, genre: 'N/A' };
      }
    })
  );

  renderMovies(moviesWithGenres);
}

/**
 * Renderiza los resultados de búsqueda con géneros
 */
function renderMovies(movies) {
  moviesGrid.innerHTML = movies.map(movie => `
    <div class="bg-white rounded-xl shadow-md overflow-hidden movie-card cursor-pointer flex flex-col h-full"
         onclick="showMovieDetails('${movie.imdbID}')">
      <!-- Póster -->
      <div class="relative h-96 bg-gray-200 flex-shrink-0">
        <img 
          src="${movie. Poster !== 'N/A' ? movie.Poster : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22450%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22300%22 height=%22450%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial, sans-serif%22 font-size=%2218%22 fill=%22%236b7280%22%3ESin Póster%3C/text%3E%3C/svg%3E'}"
          alt="${movie.Title}"
          class="w-full h-full object-cover"
        >
      </div>
      
      <!-- Información -->
      <div class="p-4 flex flex-col flex-grow">
        <!-- Título -->
        <h3 class="font-bold text-lg text-gray-800 mb-2 truncate" title="${movie.Title}">
          ${movie.Title}
        </h3>
        
        <!-- Año -->
        <p class="text-gray-600 text-sm mb-1">
          <span class="font-semibold">${movie.Year}</span>
        </p>
        
        <!-- Género -->
        <p class="text-gray-500 text-sm mb-4 line-clamp-2" title="${movie.genre}">
          ${movie.genre}
        </p>
        
        <!-- Botón -->
        <div class="mt-auto">
          <button 
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-medium text-sm"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Muestra los detalles de una película en modal (igual a catalog)
 */
window.showMovieDetails = async (imdbID) => {
  try {
    detailsModal.classList.remove('hidden');
    lockBodyScroll();
    
    modalContent.innerHTML = `
      <div class="flex justify-center items-center py-20">
        <div class="spinner"></div>
        <span class="ml-3 text-gray-600">Cargando detalles...</span>
      </div>
    `;

    // Obtener detalles (del cache si existe)
    let movie;
    if (movieDetailsCache[imdbID]) {
      movie = movieDetailsCache[imdbID];
    } else {
      const response = await getMovieDetails(imdbID);
      movie = response.data;
      movieDetailsCache[imdbID] = movie;
    }

    // Renderizar modal igual a catalog
    modalContent.innerHTML = `
      <!-- Contenedor de póster + información -->
      <div class="flex flex-col md:flex-row gap-6 mb-6">
        
        <!-- Columna 1: Póster (altura fija) -->
        <div class="md:w-1/3 flex-shrink-0">
          <img 
            src="${movie.poster}" 
            alt="${movie.title}"
            class="w-full rounded-lg shadow-lg"
            style="height: 500px; object-fit: cover;"
            onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22450%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22300%22 height=%22450%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial, sans-serif%22 font-size=%2218%22 fill=%22%236b7280%22%3ESin Póster%3C/text%3E%3C/svg%3E'"
          >
        </div>

        <!-- Columna 2: Información (altura fija) -->
        <div class="md:w-2/3 flex flex-col" style="height: 500px;">
          
          <div class="space-y-4 pr-2" style="padding-left: 2px;">
            
            <!-- Título -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Título
              </label>
              <input 
                type="text" 
                value="${movie.title}"
                readonly
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              >
            </div>

            <!-- Año -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Año
              </label>
              <input 
                type="text" 
                value="${movie.year}"
                readonly
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              >
            </div>

            <!-- Director -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Director
              </label>
              <input 
                type="text" 
                value="${movie.director}"
                readonly
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              >
            </div>

            <!-- Géneros -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Géneros
              </label>
              <input 
                type="text" 
                value="${movie.genre}"
                readonly
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              >
            </div>

            <!-- Sinopsis -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Sinopsis
              </label>
              <textarea 
                readonly
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 resize-none"
                style="height: 130px; overflow-y: auto;"
              >${movie.plot || 'Sin sinopsis disponible'}</textarea>
            </div>

          </div>

        </div>
      </div>

      <!-- Botones -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button 
          onclick="addMovieToCatalog('${movie.imdbID}')"
          class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          + Agregar a Mi Catálogo
        </button>
        <button 
          onclick="closeModal()"
          class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
        >
          Cerrar
        </button>
      </div>
    `;

  } catch (error) {
    console.error('Error al obtener detalles:', error);
    modalContent.innerHTML = `
      <div class="text-center py-10">
        <p class="text-red-600 font-semibold mb-4">Error al cargar los detalles</p>
        <button 
          onclick="closeModal()"
          class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition-colors font-semibold"
        >
          Cerrar
        </button>
      </div>
    `;
  }
};

/**
 * Agrega una película al catálogo personal
 */
window.addMovieToCatalog = async (imdbID) => {
  try {
    const movie = movieDetailsCache[imdbID];

    if (!movie) {
      showErrorNotification('Error al obtener los datos de la película');
      return;
    }

    await createMovie({
      title: movie.title,
      year: movie.year,
      director: movie.director,
      genre: movie.genre,
      imdbID: movie.imdbID,
      plot: movie.plot
    });

    showSuccessNotification('¡Película agregada exitosamente a tu catálogo!');
    closeModal();

  } catch (error) {
    console.error('Error al agregar película:', error);
    showErrorNotification(error.message || 'Error al agregar la película');
  }
};

/**
 * Cierra el modal
 */
window.closeModal = () => {
  detailsModal.classList.add('hidden');
  unlockBodyScroll();
};

/**
 * Bloquea el scroll del body
 */
function lockBodyScroll() {
  document.body.style.overflow = 'hidden';
}

/**
 * Desbloquea el scroll del body
 */
function unlockBodyScroll() {
  document.body.style.overflow = '';
}

/**
 * Muestra una notificación de éxito temporal
 * @param {string} message - Mensaje a mostrar
 */
function showSuccessNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('animate-fade-out');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

/**
 * Muestra una notificación de error temporal
 * @param {string} message - Mensaje a mostrar
 */
function showErrorNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('animate-fade-out');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 4000);
}