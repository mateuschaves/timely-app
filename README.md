# Timely App

Aplicativo React Native para registro de horas trabalhadas, desenvolvido com Expo, TypeScript, React Navigation e React Query.

## 🚀 Tecnologias

- **Expo** - Framework para desenvolvimento React Native
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação entre telas
- **React Query** - Gerenciamento de estado e cache de dados
- **Styled Components** - Estilização com CSS-in-JS
- **Expo Linking** - Suporte a deeplinks
- **Expo Apple Authentication** - Login com Apple
- **AsyncStorage** - Persistência local de dados

## 📁 Estrutura do Projeto

O projeto segue uma arquitetura baseada em **features**, onde cada funcionalidade possui sua própria pasta com:

```
src/
├── features/
│   ├── auth/
│   │   ├── LoginScreen/       # Tela de login
│   │   │   ├── index.tsx      # Componente
│   │   │   └── styles.ts      # Estilos
│   │   ├── context/           # Context de autenticação
│   │   ├── hooks/             # Hook useAuth
│   │   ├── types/             # Tipos de autenticação
│   │   └── index.ts
│   ├── home/
│   │   ├── HomeScreen/
│   │   │   ├── index.tsx      # Componente
│   │   │   └── styles.ts      # Estilos
│   │   └── index.ts
│   ├── history/
│   │   ├── HistoryScreen/
│   │   │   ├── index.tsx      # Componente
│   │   │   └── styles.ts      # Estilos
│   │   └── index.ts
│   └── time-clock/
│       ├── hooks/             # Custom hooks
│       ├── types/             # Tipos TypeScript
│       └── index.ts
└── navigation/
    ├── AppNavigator.tsx       # Navegação autenticada
    └── AuthNavigator.tsx      # Navegação de autenticação
```

## 🔗 Deeplink

O app está configurado para receber deeplinks no formato:

```
timely://?time=2024-01-01T10:00:00Z&type=entry
```

### Parâmetros:
- `time` (obrigatório): Data/hora no formato ISO 8601
- `type` (opcional): Tipo de registro (`entry` ou `exit`). Padrão: `entry`

### Como Testar

#### Método Rápido (Scripts npm)
```bash
# Testar deeplink de entrada
npm run deeplink:entry

# Testar deeplink de saída
npm run deeplink:exit

# Testar com hora customizada
npm run deeplink:custom "2024-01-01T14:30:00Z"
```

#### Método Manual

**iOS Simulator:**
```bash
xcrun simctl openurl booted "timely://?time=2024-01-01T10:00:00Z&type=entry"
```

**Android Emulator:**
```bash
adb shell am start -W -a android.intent.action.VIEW -d "timely://?time=2024-01-01T10:00:00Z&type=entry" com.timelyapp
```

**Dispositivo Físico (iOS):**
1. Abra o Safari
2. Digite: `timely://?time=2024-01-01T10:00:00Z&type=entry`

📖 **Guia completo de testes:** Veja [DEEPLINK_TESTING.md](./DEEPLINK_TESTING.md) para mais detalhes.

### Exemplo de uso no Shortcuts da Apple:

1. Abra o app Shortcuts
2. Crie um novo atalho
3. Adicione a ação "Abrir URLs"
4. Configure a URL: `timely://?time={HORA_ATUAL}&type=entry`
5. Execute o atalho para bater o ponto automaticamente

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Iniciar o projeto
npm start
```

## 🛠️ Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run ios` - Executa no iOS
- `npm run android` - Executa no Android
- `npm run web` - Executa no navegador

## 🔧 Configuração da API

A API ainda não está implementada. Para configurar:

1. Edite `src/features/time-clock/hooks/useTimeClock.ts`
2. Substitua `API_BASE_URL` pela URL real da sua API
3. Remova `enabled: false` da query quando a API estiver pronta

## 🔐 Autenticação

O app utiliza **Apple Sign In** para autenticação. A autenticação está disponível apenas no iOS.

### Funcionalidades:
- Login com Apple
- Persistência da sessão (usuário permanece logado após fechar o app)
- Navegação protegida (rotas só acessíveis após login)
- Logout

### Configuração no iOS:

1. Certifique-se de que o `bundleIdentifier` está configurado no `app.json`
2. No Apple Developer Console, configure o Sign In with Apple para seu app
3. Execute `npx expo prebuild` para gerar os arquivos nativos
4. O login será exibido automaticamente quando o usuário não estiver autenticado

## 📝 Próximos Passos

- [ ] Implementar API backend
- [x] Adicionar autenticação
- [x] Implementar persistência local
- [ ] Adicionar notificações
- [ ] Melhorar UI/UX

