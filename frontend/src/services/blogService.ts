import axios from 'axios';

// ✅ Cambiar a usar /api
const API_URL = import.meta.env.VITE_API_URL || 'https://thinkel.onrender.com/api';

// Configurar interceptor para incluir token automáticamente
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================================
// POSTS
// ============================================

export const getAllPosts = async (params?: {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
}) => {
  const response = await axios.get(`${API_URL}/posts`, { params }); // ✅ Cambiar /blog/posts a /posts
  return response.data;
};

export const getPostBySlug = async (slug: string) => {
  const response = await axios.get(`${API_URL}/posts/slug/${slug}`); // ✅ Cambiar ruta
  return response.data;
};

export const getPostsByUser = async (username: string) => {
  const response = await axios.get(`${API_URL}/posts?author=${username}`); // ✅ Usar query params
  return response.data;
};

export const createPost = async (data: {
  title: string;
  content: string;
  description: string;
  tags: string[];
  thumbnail?: string;
}) => {
  const response = await axios.post(
    `${API_URL}/posts`, // ✅ Cambiar ruta
    data,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const updatePost = async (
  postId: string,
  data: {
    title?: string;
    content?: string;
    description?: string;
    tags?: string[];
    thumbnail?: string;
  }
) => {
  const response = await axios.put(
    `${API_URL}/posts/${postId}`, // ✅ Cambiar ruta
    data,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const deletePost = async (postId: string) => {
  const response = await axios.delete(
    `${API_URL}/posts/${postId}`, // ✅ Cambiar ruta
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const likePost = async (postId: string) => {
  const response = await axios.post(
    `${API_URL}/posts/${postId}/like`, // ✅ Cambiar ruta
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

// ============================================
// COMENTARIOS
// ============================================

export const getComments = async (postId: string) => {
  const response = await axios.get(`${API_URL}/comments/post/${postId}`); // ✅ Cambiar ruta
  return response.data;
};

export const createComment = async (
  postId: string,
  data: {
    content: string;
    parentId?: string;
  }
) => {
  const response = await axios.post(
    `${API_URL}/comments`, // ✅ Cambiar ruta
    { ...data, postId }, // ✅ Incluir postId en el body
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const updateComment = async (
  commentId: string,
  data: {
    content: string;
  }
) => {
  const response = await axios.put(
    `${API_URL}/comments/${commentId}`, // ✅ Cambiar ruta
    data,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const deleteComment = async (commentId: string) => {
  const response = await axios.delete(
    `${API_URL}/comments/${commentId}`, // ✅ Cambiar ruta
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const likeComment = async (commentId: string) => {
  const response = await axios.post(
    `${API_URL}/comments/${commentId}/like`, // ✅ Cambiar ruta
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

// ============================================
// BÚSQUEDA
// ============================================

export const searchPosts = async (query: string) => {
  const response = await axios.get(`${API_URL}/posts`, {
    params: { search: query }, // ✅ Usar parámetro search
  });
  return response.data;
};

// ============================================
// UPLOAD (Si tienes ruta de upload)
// ============================================

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(
    `${API_URL}/upload`, // ✅ Verificar si existe esta ruta
    formData,
    {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};
