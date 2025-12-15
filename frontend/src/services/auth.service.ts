import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://thinkel.onrender.com/api';

export const registerUser = async (data: { name: string; email: string; password: string }) => {
  const response = await axios.post(`${API_URL}/auth/register`, data);
  return response.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await axios.post(`${API_URL}/auth/login`, data);
  return response.data;
};

export const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await axios.get(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateProfile = async (data: FormData) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  console.log('📤 Enviando actualización a:', `${API_URL}/auth/profile`);
  console.log('📦 FormData entries:');
  for (let [key, value] of data.entries()) {
    console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
  }
  
  const response = await axios.put(`${API_URL}/auth/profile`, data, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    },
  });
  
  console.log('✅ Respuesta del servidor:', response.data);
  
  return response.data;
};

// ============================================
// FUNCIONES ADICIONALES DE AUTENTICACIÓN
// ============================================

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};
