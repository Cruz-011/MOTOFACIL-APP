// src/config/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.0.119:8080/api';

// Cria instância do Axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para enviar token automaticamente
api.interceptors.request.use(
  async (config) => {
    try {
      const usuario = await AsyncStorage.getItem('@usuario_logado');
      if (usuario) {
        const { token } = JSON.parse(usuario);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.warn('Erro ao buscar token do AsyncStorage:', err.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para log de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Erro na API:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
