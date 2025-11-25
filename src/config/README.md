# Configuração da API

Este diretório contém as configurações centralizadas da API.

## Arquivos

- `api.ts` - Configuração do cliente Axios e interceptors
- `token.ts` - Gerenciamento de tokens JWT
- `index.ts` - Exportações centralizadas

## Uso

### Cliente Axios

```typescript
import { apiClient, API_ENDPOINTS } from '@/config/api';

// Fazer uma requisição GET
const response = await apiClient.get(API_ENDPOINTS.TIME_CLOCK);

// Fazer uma requisição POST
const response = await apiClient.post(API_ENDPOINTS.TIME_CLOCK, data);
```

### Gerenciamento de Token

```typescript
import { saveToken, getToken, removeToken } from '@/config/token';

// Salvar token após login
await saveToken('seu-jwt-token-aqui');

// Recuperar token
const token = await getToken();

// Remover token (logout)
await removeToken();
```

## Interceptors

### Request Interceptor
- Adiciona automaticamente o token JWT no header `Authorization` se existir
- Formato: `Bearer {token}`

### Response Interceptor
- Trata erros globalmente
- Remove token automaticamente em caso de erro 401 (Não autorizado)

## Configuração

A URL da API pode ser configurada através de variável de ambiente:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Ou edite diretamente em `api.ts`:

```typescript
export const API_BASE_URL = 'http://localhost:3000';
```

