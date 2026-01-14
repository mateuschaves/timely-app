import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import { STORAGE_KEYS } from './storage';

export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    
    // No iOS, também salva no App Group UserDefaults para que o App Intent possa acessar
    if (Platform.OS === 'ios') {
      console.log('🔍 Verificando módulo nativo TokenStorage...');
      console.log('📦 NativeModules disponíveis:', Object.keys(NativeModules));
      console.log('🔑 TokenStorage existe?', !!NativeModules.TokenStorage);
      
      if (NativeModules.TokenStorage) {
        console.log('📋 Métodos disponíveis em TokenStorage:', Object.keys(NativeModules.TokenStorage));
        console.log('🔍 Tipo de saveToken:', typeof NativeModules.TokenStorage.saveToken);
      }
      
      try {
        // Tenta usar o módulo nativo se disponível
        if (NativeModules.TokenStorage) {
          console.log('💾 Tentando salvar token no App Group UserDefaults via módulo nativo...');
          
          // Tenta chamar o método diretamente, mesmo que não seja detectado como função
          try {
            const result = await NativeModules.TokenStorage.saveToken(token);
            console.log('✅ Token salvo no App Group UserDefaults com sucesso');
          } catch (methodError) {
            console.error('❌ Erro ao chamar saveToken:', methodError);
            console.error('❌ Detalhes do erro:', JSON.stringify(methodError));
            throw methodError;
          }
        } else {
          console.warn('⚠️ Módulo TokenStorage não encontrado');
          console.warn('⚠️ O App Intent pode não funcionar sem o módulo nativo');
        }
      } catch (e) {
        console.error('❌ Erro ao salvar token no App Group UserDefaults:', e);
        console.error('❌ Detalhes do erro:', JSON.stringify(e));
        console.error('❌ Stack trace:', e instanceof Error ? e.stack : 'N/A');
      }
    }
  } catch (error) {
    console.error('Erro ao salvar token:', error);
    throw error;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Erro ao recuperar token:', error);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    
    // Remove também do UserDefaults no iOS
    if (Platform.OS === 'ios') {
      try {
        if (NativeModules.TokenStorage && typeof NativeModules.TokenStorage.removeToken === 'function') {
          await NativeModules.TokenStorage.removeToken();
        }
        // Remove também a chave alternativa
        await AsyncStorage.removeItem('timely_token');
      } catch (e) {
        // Ignora erro se o módulo nativo não estiver disponível
        console.warn('Não foi possível remover token do UserDefaults:', e);
      }
    }
  } catch (error) {
    console.error('Erro ao remover token:', error);
    throw error;
  }
};

