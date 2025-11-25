/**
 * Configuração da API com Axios
 * 
 * Para usar variáveis de ambiente, instale expo-constants:
 * npm install expo-constants
 * 
 * E então use:
 * import Constants from 'expo-constants';
 * export const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, removeToken } from './token';

// URL base da API - localhost na porta 3000
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Configurações de timeout
export const API_TIMEOUT = 10000; // 10 segundos

/**
 * Cliente Axios configurado para a API
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para requisições - adiciona token JWT automaticamente
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Busca o token do AsyncStorage
    const token = await getToken();
    
    // Adiciona o token no header Authorization se existir
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log no Reactotron em desenvolvimento
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

// Interceptor para respostas (tratamento de erros global)
apiClient.interceptors.response.use(
  (response) => {
    // Log no Reactotron em desenvolvimento
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
    // Tratamento global de erros
    if (error.response) {
      // Erro com resposta do servidor
      const status = error.response.status;
      
      // Se receber 401 (Não autorizado), remove o token e força logout
      if (status === 401) {
        console.warn('Token inválido ou expirado. Removendo token...');
        await removeToken();
        // Aqui você pode adicionar lógica para redirecionar para login
        // Por exemplo, usando um evento ou contexto
      }
      
      // Log de erro no Reactotron
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
      // Erro de rede
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
      // Outro erro
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

// Headers padrão (mantido para compatibilidade)
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

