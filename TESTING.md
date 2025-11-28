# 🧪 Guia de Testes

Este projeto possui uma configuração completa de testes com Jest e React Native Testing Library, configurada para garantir uma cobertura mínima de 90%.

## 📦 Dependências de Teste

- `jest` - Framework de testes
- `jest-expo` - Preset do Jest para Expo
- `@testing-library/react-native` - Biblioteca para testar componentes React Native
- `@testing-library/jest-native` - Matchers adicionais para Jest
- `react-test-renderer` - Renderizador para testes
- `@testing-library/react-hooks` - Utilitários para testar hooks
- `ts-jest` - Suporte TypeScript para Jest

## 🚀 Executando Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar testes em CI
npm run test:ci
```

## 📁 Estrutura de Testes

Os testes estão organizados seguindo a estrutura do código fonte:

```
src/
├── api/
│   └── __tests__/
│       ├── get-user-me.test.ts
│       ├── clock-in.test.ts
│       ├── clock-out.test.ts
│       ├── signin-with-apple.test.ts
│       ├── update-user-me.test.ts
│       ├── get-user-settings.test.ts
│       ├── get-time-clock-entries.test.ts
│       ├── update-user-settings.test.ts
│       ├── get-clock-history.test.ts
│       └── clock.test.ts
├── config/
│   └── __tests__/
│       ├── token.test.ts
│       └── api.test.ts
├── features/
│   ├── auth/
│   │   ├── context/
│   │   │   └── __tests__/
│   │   │       └── AuthContext.test.tsx
│   │   └── LoginScreen/
│   │       └── __tests__/
│   │           └── LoginScreen.test.tsx
│   ├── home/
│   │   └── hooks/
│   │       └── __tests__/
│   │           └── useLastEvent.test.ts
│   └── time-clock/
│       └── hooks/
│           └── __tests__/
│               └── useLocation.test.ts
├── hooks/
│   └── __tests__/
│       └── useNotifications.test.ts
└── utils/
    └── __tests__/
        ├── feedback.test.tsx
        └── notifications.test.ts
```

## 🎯 Cobertura de Testes

O projeto está configurado para exigir uma cobertura mínima de 90% em:
- **Statements** (declarações)
- **Branches** (ramificações)
- **Functions** (funções)
- **Lines** (linhas)

### Arquivos Excluídos da Cobertura

Os seguintes arquivos são excluídos do cálculo de cobertura:
- Arquivos de tipos TypeScript (`.d.ts`)
- Arquivos `index.ts` (apenas re-exports)
- Arquivos de estilos (`.styles.ts`)
- Arquivos de tipos (`types/**`)
- Arquivos de localização (`locales/**`)
- Configuração do Reactotron (`reactotron.d.ts`)

## 🔧 Configuração

### Jest Config (`jest.config.js`)

- **Preset**: `jest-expo` - Configuração otimizada para Expo
- **Environment**: `jsdom` - Ambiente de teste para componentes React
- **Module Mapper**: Configurado para resolver aliases `@/` e `@features/`
- **Transform Ignore Patterns**: Configurado para transformar módulos necessários do React Native e Expo

### Setup (`jest.setup.js`)

O arquivo de setup contém:
- Mocks para AsyncStorage
- Mocks para módulos Expo (expo-apple-authentication, expo-location, expo-linking, expo-notifications, etc.)
- Mocks para console.tron (Reactotron)
- Configuração de `__DEV__`

## 📝 Tipos de Testes

### 1. Testes de Funções da API

Testam as funções que fazem chamadas HTTP para a API:

```typescript
// Exemplo: src/api/__tests__/get-user-me.test.ts
describe('getUserMe', () => {
  it('should fetch user data successfully', async () => {
    // Testa sucesso
  });
  
  it('should handle API errors', async () => {
    // Testa tratamento de erros
  });
});
```

### 2. Testes de Hooks

Testam hooks customizados usando `@testing-library/react-hooks`:

```typescript
// Exemplo: src/features/home/hooks/__tests__/useLastEvent.test.ts
describe('useLastEvent', () => {
  it('should return last event and next action', async () => {
    const { result } = renderHook(() => useLastEvent(), {
      wrapper: createWrapper(),
    });
    // Testa comportamento do hook
  });
});
```

### 3. Testes de Componentes

Testam componentes React Native usando `@testing-library/react-native`:

```typescript
// Exemplo: src/features/auth/LoginScreen/__tests__/LoginScreen.test.tsx
describe('LoginScreen', () => {
  it('should render login screen correctly', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('auth.title')).toBeTruthy();
  });
});
```

### 4. Testes de Utilitários

Testam funções utilitárias e helpers:

```typescript
// Exemplo: src/config/__tests__/token.test.ts
describe('token', () => {
  describe('saveToken', () => {
    it('should save token successfully', async () => {
      // Testa salvamento de token
    });
  });
});
```

## 🎨 Boas Práticas

1. **Isolamento**: Cada teste deve ser independente
2. **Mocks**: Use mocks para dependências externas (API, AsyncStorage, etc.)
3. **Nomenclatura**: Use nomes descritivos para testes
4. **Cobertura**: Mantenha a cobertura acima de 90%
5. **Organização**: Mantenha a estrutura de pastas consistente

## 🐛 Troubleshooting

### Erro: "Cannot find module"
- Verifique se o módulo está mockado no `jest.setup.js`
- Verifique se o `moduleNameMapper` está configurado corretamente

### Erro: "ReferenceError: You are trying to import a file outside of the scope"
- Verifique se o `testEnvironment` está configurado como `jsdom`
- Verifique se os mocks do Expo estão configurados corretamente

### Cobertura baixa
- Execute `npm run test:coverage` para ver quais arquivos precisam de mais testes
- Adicione testes para casos não cobertos

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Hooks](https://react-hooks-testing-library.com/)
