import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
console.log('API Base URL:', baseURL);

const api = axios.create({
    baseURL,
    timeout: 15000,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error Details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method,
        });
        return Promise.reject(error);
    }
);

export default api;
