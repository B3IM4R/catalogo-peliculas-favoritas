import API_URL from '../config. js';

// Registra un nuevo usuario
export const register = async (name, email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    // Intentar leer el JSON
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error('Error al procesar la respuesta del servidor');
    }

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    // Verificar que la respuesta tenga la estructura esperada
    if (!data.success || !data.data || !data.data.token) {
      throw new Error('Respuesta del servidor inválida');
    }

    return data;
  } catch (error) {
    // Si es un error de red
    if (error.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
    }
    
    throw error;
  }
};

// Inicia sesión
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    // Intentar leer el JSON
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error('Error al procesar la respuesta del servidor');
    }

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    // Verificar que la respuesta tenga la estructura esperada
    if (!data.success || !data.data || !data.data.token) {
      throw new Error('Respuesta del servidor inválida');
    }

    return data;
  } catch (error) {
    // Si es un error de red
    if (error.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
    }
    
    throw error;
  }
};