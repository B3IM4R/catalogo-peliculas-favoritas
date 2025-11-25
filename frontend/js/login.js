import { login } from './api/auth.js';
import { saveAuth } from './utils/auth.js';

const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');

// Regex del email (igual que en el modelo de BD)
const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// Valida el formulario de login
function validateForm(email, password) {
  if (!EMAIL_REGEX.test(email)) {
    return 'Por favor ingresa un email válido';
  }

  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }

  return null;
}

// Manejar el envío del formulario
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Obtener los valores del formulario (con trim)
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  
  // Ocultar mensaje de error
  errorMessage.classList.add('hidden');
  
  // Validar formulario
  const validationError = validateForm(email, password);
  if (validationError) {
    errorMessage.textContent = validationError;
    errorMessage.classList.remove('hidden');
    return;
  }
  
  // Mostrar loading
  submitBtn.disabled = true;
  btnText.textContent = 'Iniciando sesión...';
  btnSpinner.classList.remove('hidden');
  
  try {
    // Llamar a la API de login
    const response = await login(email, password);
    
    // Guardar token y datos del usuario
    saveAuth(response.data.token, {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email
    });
    
    // Redirigir al catálogo
    window.location.href = './catalog.html';
    
  } catch (error) {
    errorMessage.textContent = error.message || 'Error al iniciar sesión';
    errorMessage.classList.remove('hidden');
    
    // Restaurar botón
    submitBtn.disabled = false;
    btnText.textContent = 'Iniciar Sesión';
    btnSpinner.classList.add('hidden');
  }
});