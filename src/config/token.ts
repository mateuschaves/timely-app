/**
 * Gerenciamento de Token JWT
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storage';

/**
 * Salva o token JWT no AsyncStorage
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } catch (error) {
    console.error('Erro ao salvar token:', error);
    throw error;
  }
};

/**
 * Recupera o token JWT do AsyncStorage
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Erro ao recuperar token:', error);
    return null;
  }
};

/**
 * Remove o token JWT do AsyncStorage
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Erro ao remover token:', error);
    throw error;
  }
};

