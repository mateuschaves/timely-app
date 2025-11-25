# API Layer

Esta pasta contém todas as funções de chamada à API, organizadas por domínio/feature.

## Estrutura

Cada arquivo contém:
- **Types**: Interfaces TypeScript para request e response
- **Functions**: Funções que fazem as chamadas HTTP usando o `apiClient`

## Arquivos

### `signin-with-apple.ts`
Endpoints de autenticação:
- `signInWithApple` - Login com Apple

### `get-time-clock-entries.ts`
- `getTimeClockEntries` - Busca todos os registros de ponto (GET /time-clock)

### `clock-in.ts`
- `clockIn` - Registra uma entrada de ponto (POST /clockin)
  - Request: `{ action: 'clock-in', hour: string, location?: LocationCoordinates, photoUrl?: string, notes?: string }`

### `clock-out.ts`
- `clockOut` - Registra uma saída de ponto (POST /clockin)
  - Request: `{ action: 'clock-out', hour: string, location?: LocationCoordinates, photoUrl?: string, notes?: string }`
- `clockOut` - Registra uma saída de ponto (POST /clockin)

## Uso com React Query

As funções da API são usadas dentro de hooks que utilizam React Query:

```typescript
// Exemplo: useMutation
const mutation = useMutation({
  mutationFn: signInWithApple,
  onSuccess: (data) => {
    // data já está tipado como SignInWithAppleResponse
  },
});

// Exemplo: useQuery
const { data } = useQuery({
  queryKey: ['timeClockEntries'],
  queryFn: getTimeClockEntries,
  // data já está tipado como GetTimeClockEntriesResponse
});
```

## Adicionando novos endpoints

1. Crie um **novo arquivo** com nome semântico (ex: `refresh-token.ts`, `update-profile.ts`)
2. Defina os tipos de request e response
3. Crie a função que chama o endpoint usando `apiClient` (endpoint escrito diretamente no código)
4. Exporte no `index.ts`

**IMPORTANTE**: Cada arquivo deve conter apenas **uma chamada de API**.

Exemplo:

```typescript
// src/api/refresh-token.ts

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
}

export const refreshToken = async (
  data: RefreshTokenRequest
): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<RefreshTokenResponse>(
    '/auth/refresh',
    data
  );
  return response.data;
};
```

