import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            localStorage.removeItem('rol');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;