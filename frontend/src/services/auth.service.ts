import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://thinkel.onrender.com';

export const registerUser = async (data: { name: string; email: string; password: string }) => {
  const response = await axios.post(`${API_URL}/api/auth/register`, data);
  return response.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, data);
  return response.data;
};

export const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await axios.get(`${API_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateProfile = async (data: FormData) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await axios.put(`${API_URL}/api/auth/profile`, data, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    },
  });
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
