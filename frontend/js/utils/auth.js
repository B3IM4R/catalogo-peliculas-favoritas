// Guarda el token y los datos del usuario en localStorage
export const saveAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Obtiene el token del localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Obtiene los datos del usuario del localStorage
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

//Verifica si el usuario está autenticado
export const isAuthenticated = () => {
  return !!getToken();
};

// Cierra sesión (elimina token y datos del usuario)
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../pages/login.html';
};

// Obtiene los headers con el token de autorización
export const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
};

// Redirige al login si no está autenticado
export const requireAuth = () => {
  if (!isAuthenticated()) {
    window.location.href = './login.html';
  }
};