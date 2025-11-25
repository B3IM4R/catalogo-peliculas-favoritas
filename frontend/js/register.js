import { register } from './api/auth.js';
import { saveAuth } from './utils/auth.js';

const registerForm = document.getElementById('registerForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');

// Regex del email (igual que en el modelo de BD)
const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// Valida el formulario de registro
function validateForm(name, email, password) {
  if (name.length < 2) {
    return 'El nombre debe tener al menos 2 caracteres';
  }
  if (name.length > 50) {
    return 'El nombre no puede exceder 50 caracteres';
  }

  if (!EMAIL_REGEX.test(email)) {
    return 'Por favor ingresa un email válido (ejemplo: usuario@dominio.com)';
  }

  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }

  return null;
}

// Manejar el envío del formulario
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Obtener los valores del formulario (con trim)
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  
  // Ocultar mensajes
  errorMessage.classList.add('hidden');
  successMessage.classList.add('hidden');
  
  // Validar formulario
  const validationError = validateForm(name, email, password);
  if (validationError) {
    errorMessage.textContent = validationError;
    errorMessage.classList.remove('hidden');
    return;
  }
  
  // Mostrar loading
  submitBtn.disabled = true;
  btnText.textContent = 'Creando cuenta...';
  btnSpinner.classList.remove('hidden');
  
  try {
    // Llamar a la API de registro
    const response = await register(name, email, password);
    
    // Guardar token y datos del usuario
    saveAuth(response.data.token, {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email
    });
    
    // Mostrar mensaje de éxito
    successMessage.textContent = '¡Cuenta creada exitosamente! Redirigiendo...';
    successMessage.classList.remove('hidden');
    
    // Redirigir al catálogo después de 1.5 segundos
    setTimeout(() => {
      window.location.href = './catalog.html';
    }, 1500);
    
  } catch (error) {
    errorMessage.textContent = error.message || 'Error al crear la cuenta';
    errorMessage.classList.remove('hidden');
    
    // Restaurar botón
    submitBtn.disabled = false;
    btnText.textContent = 'Crear Cuenta';
    btnSpinner.classList.add('hidden');
  }
});