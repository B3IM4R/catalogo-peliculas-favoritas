import { getMovies, createMovie, updateMovie, deleteMovie } from './api/movies.js';
import { searchMovies } from './api/omdb.js';
import { getUser, logout, requireAuth } from './utils/auth.js';
import { validateMovieData, validateGenre, getGenreErrorMessage } from './utils/validators.js';
import { renderMovies, addMovieToGrid } from './components/movieCard.js';

// Verificar autenticación
requireAuth();

// Elementos del navbar
const dropdownUserName = document.getElementById('dropdownUserName');
const dropdownUserEmail = document.getElementById('dropdownUserEmail');
const accountDropdownBtn = document.getElementById('accountDropdownBtn');
const accountDropdownMenu = document.getElementById('accountDropdownMenu');
const logoutBtnDropdown = document.getElementById('logoutBtnDropdown');

// Elementos del DOM
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const moviesGrid = document.getElementById('moviesGrid');

// Modal y formulario de agregar
const addModal = document.getElementById('addModal');
const addMovieBtn = document.getElementById('addMovieBtn');
const addMovieBtnEmpty = document.getElementById('addMovieBtnEmpty');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const addForm = document.getElementById('addForm');

// Inputs del formulario de agregar
const addTitleInput = document.getElementById('addTitle');
const addYearInput = document.getElementById('addYear');
const addDirectorInput = document.getElementById('addDirector');
const addGenreInput = document.getElementById('addGenre');
const addPlotInput = document.getElementById('addPlot');

// Mensajes del formulario de agregar
const titleValidation = document.getElementById('titleValidation');
const addErrorMessage = document.getElementById('addErrorMessage');
const addSuccessMessage = document.getElementById('addSuccessMessage');

// Modal de detalles
const detailsModal = document.getElementById('detailsModal');
const closeDetailsBtn = document.getElementById('closeDetailsBtn');
const cancelDetailsBtn = document.getElementById('cancelDetailsBtn');
const deleteMovieBtn = document.getElementById('deleteMovieBtn');
const detailsForm = document.getElementById('detailsForm');

// Inputs del modal de detalles
const detailsMovieId = document.getElementById('detailsMovieId');
const detailsPoster = document.getElementById('detailsPoster');
const detailsTitle = document.getElementById('detailsTitle');
const detailsYear = document.getElementById('detailsYear');
const detailsDirector = document.getElementById('detailsDirector');
const detailsGenre = document.getElementById('detailsGenre');
const detailsPlot = document.getElementById('detailsPlot');
const detailsErrorMessage = document.getElementById('detailsErrorMessage');

// Estado de validación
let validatedImdbID = null;
let searchTimeout = null;

// Inicialización del navbar
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

// Event listeners de agregar película
addMovieBtn.addEventListener('click', openAddModal);
if (addMovieBtnEmpty) {
  addMovieBtnEmpty.addEventListener('click', openAddModal);
}
cancelAddBtn.addEventListener('click', closeAddModal);
addModal.addEventListener('click', (e) => {
  if (e.target === addModal) closeAddModal();
});
addTitleInput.addEventListener('blur', validateTitle);
addForm.addEventListener('submit', handleAddMovie);

// Event listeners del modal de detalles
closeDetailsBtn.addEventListener('click', closeDetailsModal);
cancelDetailsBtn.addEventListener('click', closeDetailsModal);
deleteMovieBtn.addEventListener('click', handleDeleteMovie);
detailsModal.addEventListener('click', (e) => {
  if (e.target === detailsModal) closeDetailsModal();
});
detailsForm.addEventListener('submit', handleUpdateMovie);

// Cargar películas al iniciar
loadMovies();

/**
 * Carga y muestra todas las películas del usuario
 */
async function loadMovies() {
  try {
    showLoadingState();

    const response = await getMovies();
    const movies = response.data;

    hideLoadingState();

    if (movies.length === 0) {
      showEmptyState();
    } else {
      showMoviesGrid(movies);
    }

  } catch (error) {
    console.error('Error al cargar películas:', error);
    hideLoadingState();
    alert('Error al cargar las películas');
  }
}

/**
 * Muestra el estado de carga
 */
function showLoadingState() {
  loadingState.classList.remove('hidden');
  emptyState.classList.add('hidden');
  moviesGrid.classList.add('hidden');
}

/**
 * Oculta el estado de carga
 */
function hideLoadingState() {
  loadingState.classList.add('hidden');
}

/**
 * Muestra el estado vacío
 */
function showEmptyState() {
  emptyState.classList.remove('hidden');
}

/**
 * Muestra el grid con películas
 */
function showMoviesGrid(movies) {
  moviesGrid.classList.remove('hidden');
  renderMovies(movies, moviesGrid);
}

/**
 * Abre el modal de agregar película
 */
function openAddModal() {
  addForm.reset();
  validatedImdbID = null;
  titleValidation.classList.add('hidden');
  addErrorMessage.classList.add('hidden');
  addSuccessMessage.classList.add('hidden');
  addModal.classList.remove('hidden');
  lockBodyScroll();
}

/**
 * Cierra el modal de agregar película
 */
function closeAddModal() {
  addModal.classList.add('hidden');
  addForm.reset();
  validatedImdbID = null;
  titleValidation.classList.add('hidden');
  unlockBodyScroll();
}

/**
 * Valida el título en OMDb
 */
async function validateTitle() {
  const title = addTitleInput.value.trim();

  if (title.length === 0) {
    titleValidation.classList.add('hidden');
    validatedImdbID = null;
    return;
  }

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  titleValidation.innerHTML = '<span class="text-gray-500 text-sm"> Buscando en OMDb...</span>';
  titleValidation.classList.remove('hidden');

  try {
    const response = await searchMovies(title);
    const movies = response.data;

    if (movies.length === 0) {
      titleValidation.innerHTML = '<span class="text-orange-600 text-sm"> No se encontró en OMDb. Verifica el título en inglés.</span>';
      validatedImdbID = null;
      return;
    }

    const movie = movies[0];
    validatedImdbID = movie.imdbID;

    titleValidation.innerHTML = `<span class="text-green-600 text-sm font-medium"> Película encontrada: ${movie.Title} (${movie.Year})</span>`;

  } catch (error) {
    console.error('Error al validar título:', error);
    titleValidation.innerHTML = '<span class="text-red-600 text-sm"> Error al buscar en OMDb</span>';
    validatedImdbID = null;
  }
}

/**
 * Maneja el envío del formulario de agregar película
 */
async function handleAddMovie(e) {
  e.preventDefault();

  const movieData = {
    title: addTitleInput.value.trim(),
    year: parseInt(addYearInput.value),
    director: addDirectorInput.value.trim(),
    genre: addGenreInput.value.trim(),
    plot: addPlotInput.value.trim()
  };

  addErrorMessage.classList.add('hidden');
  addSuccessMessage.classList.add('hidden');

  // Validar datos
  const validationError = validateMovieData(movieData, validatedImdbID);
  if (validationError) {
    addErrorMessage.textContent = validationError;
    addErrorMessage.classList.remove('hidden');
    return;
  }

  // Agregar imdbID al objeto
  movieData.imdbID = validatedImdbID;
  if (!movieData.plot) delete movieData.plot;

  try {
    const response = await createMovie(movieData);
    const newMovie = response.data;

    // Mostrar mensaje de éxito
    addSuccessMessage.textContent = '¡Película agregada exitosamente!';
    addSuccessMessage.classList.remove('hidden');

    // Agregar la película al grid sin recargar
    addMovieToGrid(newMovie, moviesGrid, emptyState);

    // Limpiar formulario para agregar otra
    addForm.reset();
    validatedImdbID = null;
    titleValidation.classList.add('hidden');

    // Ocultar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      addSuccessMessage.classList.add('hidden');
    }, 3000);

    // Hacer scroll al inicio del formulario para ver el mensaje
    addModal.querySelector('.bg-white').scrollTop = 0;

  } catch (error) {
    console.error('Error al agregar película:', error);
    addErrorMessage.textContent = error.message || 'Error al agregar la película';
    addErrorMessage.classList.remove('hidden');
  }
}

/**
 * Abre el modal de detalles con los datos de la película
 */
async function openDetailsModal(movieId) {
  try {
    const response = await getMovies();
    const movie = response.data.find(m => m._id === movieId);

    if (!movie) {
      alert('Película no encontrada');
      return;
    }

    // Llenar el modal con los datos
    detailsMovieId.value = movie._id;
    detailsPoster.src = movie.poster;
    detailsTitle.value = movie.title;
    detailsYear.value = movie.year;
    detailsDirector.value = movie.director;
    detailsGenre.value = movie.genre;
    detailsPlot.value = movie.plot || '';

    detailsErrorMessage.classList.add('hidden');
    detailsModal.classList.remove('hidden');
    lockBodyScroll();

  } catch (error) {
    console.error('Error al obtener película:', error);
    alert('Error al cargar los detalles de la película');
  }
}

/**
 * Cierra el modal de detalles
 */
function closeDetailsModal() {
  detailsModal.classList.add('hidden');
  detailsForm.reset();
  detailsErrorMessage.classList.add('hidden');
  unlockBodyScroll();
}

/**
 * Maneja la actualización de una película
 */
async function handleUpdateMovie(e) {
  e.preventDefault();

  const movieId = detailsMovieId.value;
  const movieData = {
    title: detailsTitle.value.trim(),
    year: parseInt(detailsYear.value),
    director: detailsDirector.value.trim(),
    genre: detailsGenre.value.trim(),
    plot: detailsPlot.value.trim()
  };

  detailsErrorMessage.classList.add('hidden');

  // Validar año
  if (isNaN(movieData.year) || movieData.year < 1888 || movieData.year > 2030) {
    detailsErrorMessage.textContent = 'El año debe estar entre 1888 y 2030';
    detailsErrorMessage.classList.remove('hidden');
    return;
  }

  // Validar director
  if (!movieData.director || movieData.director.length < 3 || movieData.director.length > 100) {
    detailsErrorMessage.textContent = 'El director debe tener entre 3 y 100 caracteres';
    detailsErrorMessage.classList.remove('hidden');
    return;
  }

  // Validar género
  if (!movieData.genre || movieData.genre.length === 0) {
    detailsErrorMessage.textContent = 'El género es obligatorio';
    detailsErrorMessage.classList.remove('hidden');
    return;
  }

  if (!validateGenre(movieData.genre)) {
    detailsErrorMessage.textContent = getGenreErrorMessage();
    detailsErrorMessage.classList.remove('hidden');
    return;
  }

  // Validar sinopsis
  if (movieData.plot && movieData.plot.length > 1000) {
    detailsErrorMessage.textContent = 'La sinopsis no puede exceder 1000 caracteres';
    detailsErrorMessage.classList.remove('hidden');
    return;
  }

  if (!movieData.plot) delete movieData.plot;

  try {
    await updateMovie(movieId, movieData);
    closeDetailsModal();
    await loadMovies();
    
    // Mostrar notificación de éxito
    showSuccessNotification('Película actualizada exitosamente');

  } catch (error) {
    console.error('Error al actualizar película:', error);
    detailsErrorMessage.textContent = error.message || 'Error al actualizar la película';
    detailsErrorMessage.classList.remove('hidden');
  }
}

/**
 * Maneja la eliminación de una película
 */
async function handleDeleteMovie() {
  const movieId = detailsMovieId.value;
  const movieTitle = detailsTitle.value;

  const confirmed = confirm(
    `¿Estás seguro de eliminar "${movieTitle}"?\n\nEsta acción no se puede deshacer.`
  );

  if (!confirmed) return;

  try {
    await deleteMovie(movieId);
    closeDetailsModal();
    await loadMovies();

    // Mostrar notificación de éxito
    showSuccessNotification('Película eliminada exitosamente');

  } catch (error) {
    console.error('Error al eliminar película:', error);
    
    // Mostrar notificación de error
    showErrorNotification(error.message || 'Error al eliminar la película');
  }
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
 * Muestra los detalles de una película
 */
window.viewMovieDetails = (movieId) => {
  openDetailsModal(movieId);
};