import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, removeToken } from './token';

export const API_BASE_URL = 'https://timely-api-yfoa.onrender.com';
export const API_TIMEOUT = 10000;
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }``
    
    if (__DEV__ && (console as any).tron) {
      (console as any).tron.display({
        name: 'API Request',
        value: {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          headers: config.headers,
        },
        preview: `${config.method?.toUpperCase()} ${config.url}`,
        important: true,
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__ && (console as any).tron) {
      (console as any).tron.display({
        name: 'API Response',
        value: {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
          data: response.data,
        },
        preview: `${response.status} ${response.config.url}`,
        important: response.status >= 400,
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        console.warn('Token inválido ou expirado. Removendo token...');
        await removeToken();
      }
      
      if (__DEV__ && (console as any).tron) {
        (console as any).tron.error({
          name: 'API Error',
          value: {
            status,
            statusText: error.response.statusText,
            url: error.config?.url,
            data: error.response.data,
          },
          preview: `Error ${status}: ${error.config?.url}`,
          important: true,
        });
      }
      
      console.error('Erro na API:', status, error.response.data);
    } else if (error.request) {
      if (__DEV__ && (console as any).tron) {
        (console as any).tron.error({
          name: 'Network Error',
          value: error.request,
          preview: 'Network request failed',
          important: true,
        });
      }
      console.error('Erro de rede:', error.request);
    } else {
      if (__DEV__ && (console as any).tron) {
        (console as any).tron.error({
          name: 'Request Error',
          value: error.message,
          preview: error.message,
          important: true,
        });
      }
      console.error('Erro:', error.message);
    }
    return Promise.reject(error);
  }
);

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

