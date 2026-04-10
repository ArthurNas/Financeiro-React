import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.API_URL || 'http://localhost:8080'
})

// Interceptor para adicionar o Token em cada requisição
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Padrão Bearer exigido pelo Spring Security
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, error => {
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    localStorage.clear();
    window.location.href = '/login';
  }

  return Promise.reject(error);
});

// Interceptor para lidar com erro 401 (Token expirado)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Se o Java disser que o token é inválido, desloga o utilizador
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api