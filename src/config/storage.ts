/**
 * Chaves centralizadas para AsyncStorage
 * 
 * Todas as chaves de armazenamento do app devem ser definidas aqui
 * para facilitar manutenção e evitar conflitos.
 */

export const STORAGE_KEYS = {
  /**
   * Dados do usuário autenticado
   * Armazena: User object (JSON stringified)
   */
  USER: '@timely:user',
  
  /**
   * Token JWT de autenticação
   * Armazena: string (JWT token)
   */
  TOKEN: '@timely:token',
  
  /**
   * Idioma preferido do usuário
   * Armazena: 'pt-BR' | 'en-US' | 'system'
   */
  LANGUAGE: '@timely:language',
  
  // Adicione outras chaves aqui conforme necessário
  // Exemplo:
  // SETTINGS: '@timely:settings',
  // CACHE: '@timely:cache',
} as const;

/**
 * Tipo para as chaves de storage
 */
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

