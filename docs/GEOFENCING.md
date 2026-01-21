# Geofencing - Detecção Automática de Chegada ao Trabalho

## Visão Geral

Este documento descreve a implementação do sistema de geofencing (cercas geográficas) no aplicativo Timely, que permite detectar automaticamente quando o usuário chega ou sai do trabalho, mesmo com o aplicativo fechado.

## Problema a Resolver

O usuário precisa registrar manualmente o ponto toda vez que chega ao trabalho ou sai dele. Com geofencing, o app pode detectar automaticamente quando o usuário entra ou sai da região do trabalho e enviar uma notificação para facilitar o registro do ponto.

## Solução Implementada

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     iOS System                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  CLLocationManager (Background)                       │   │
│  │  - Monitora região do trabalho 24/7                  │   │
│  │  - Detecta entrada/saída mesmo com app fechado       │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ExpoGeofencingModule (Native Swift)                 │   │
│  │  - Recebe eventos do CLLocationManager               │   │
│  │  - Envia notificações locais                         │   │
│  │  - Comunica com JavaScript via Expo Modules          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                 React Native / TypeScript                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  useGeofencing Hook                                   │   │
│  │  - Gerencia estado do monitoramento                  │   │
│  │  - Solicita permissões                               │   │
│  │  - Inicia/para monitoramento                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WorkplaceLocationScreen                             │   │
│  │  - Interface para configurar local de trabalho       │   │
│  │  - Ativa/desativa detecção                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  App.tsx (Notification Handler)                      │   │
│  │  - Recebe tap na notificação                         │   │
│  │  - Abre app e cria deeplink                          │   │
│  │  - Aciona clock in/out via deeplink existente        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Componentes Implementados

### 1. Native Module (`expo-geofencing`)

**Localização**: `/modules/expo-geofencing/`

**Arquivos**:
- `ios/ExpoGeofencingModule.swift` - Implementação nativa em Swift
- `src/ExpoGeofencingModule.ts` - Bindings TypeScript
- `index.ts` - Exports do módulo
- `expo-module.config.json` - Configuração do módulo

**Funcionalidades**:
- `startMonitoring(id, lat, lon, radius)` - Inicia monitoramento de região
- `stopMonitoring(id)` - Para monitoramento de região específica
- `stopAllMonitoring()` - Para todo monitoramento
- `requestAlwaysAuthorization()` - Solicita permissão "Sempre"
- `hasAlwaysAuthorization()` - Verifica se tem permissão

**Eventos Emitidos**:
- `onGeofenceEnter` - Usuário entrou na região
- `onGeofenceExit` - Usuário saiu da região
- `onGeofenceError` - Erro no monitoramento

### 2. Draft API Endpoints

**Localização**: `/src/api/clock-in-draft.ts` e `/src/api/clock-out-draft.ts`

**Endpoints**:
```typescript
// Criar entrada em rascunho
POST /clockin/draft
Body: {
  hour: string;              // ISO timestamp (obrigatório)
  location?: {               // Coordenadas (opcional)
    type: 'Point';
    coordinates: [longitude, latitude];
  }
}

// Criar saída em rascunho
POST /clockin/draft
Body: {
  hour: string;              // ISO timestamp (obrigatório)
  location?: {               // Coordenadas (opcional)
    type: 'Point';
    coordinates: [longitude, latitude];
  }
}
```

**Comportamento**:
- Chamadas automaticamente quando geofence é cruzado
- Criam entradas em modo rascunho
- Usuário pode revisar e confirmar depois
- Incluem localização automática do evento

### 3. React Hook (`useGeofencing`)

**Localização**: `/src/features/time-clock/hooks/useGeofencing.ts`

**Estados**:
```typescript
{
  isAvailable: boolean;        // true no iOS
  isMonitoring: boolean;        // se está monitorando
  hasPermission: boolean;       // se tem permissão "Sempre"
  workplaceLocation: WorkLocation | null; // coordenadas do trabalho
}
```

**Métodos**:
```typescript
requestPermission(): Promise<boolean>  // Solicita permissão
startMonitoring(): Promise<boolean>     // Inicia monitoramento
stopMonitoring(): Promise<boolean>      // Para monitoramento
```

**Comportamento**:
- Obtém localização do trabalho das configurações do usuário
- Registra listeners para eventos de geofencing
- Envia notificações quando detecta entrada/saída
- Gerencia estado de monitoramento

### 3. Interface de Usuário (`WorkplaceLocationScreen`)

**Localização**: `/src/features/profile/WorkplaceLocationScreen/`

**Funcionalidades**:
- Visualizar status do monitoramento (Ativo/Inativo)
- Ver coordenadas do local de trabalho configurado
- Botão "Usar Localização Atual" - Define trabalho como localização atual
- Botão "Ativar/Desativar Detecção" - Liga/desliga monitoramento
- Botão "Atualizar Localização" - Atualiza para nova localização
- Avisos sobre permissões necessárias
- Instruções de uso

**Navegação**:
- Acessível via Perfil → Localização do Trabalho

### 4. Integração com App (`App.tsx`)

**Adições**:
- Import do `useGeofencing` hook
- Listener para respostas de notificações de geofencing
- Inicialização automática do geofencing ao autenticar
- Conversão de notificações em deeplinks para clock in/out

## Fluxo de Uso

### Configuração Inicial

1. **Usuário abre o app**
2. **Navega para Perfil → Localização do Trabalho**
3. **Toca em "Usar Localização Atual"**
   - App solicita permissão de localização "Quando em Uso"
   - Obtém coordenadas atuais
   - Salva no backend em `workLocation`
4. **Toca em "Ativar Detecção"**
   - App solicita permissão "Sempre"
   - iOS mostra diálogo de upgrade de permissão
   - Usuário seleciona "Sempre Permitir"
5. **Monitoramento iniciado** ✅

### Uso Diário

#### Chegando ao Trabalho

1. **Usuário entra na região de 100m do trabalho**
2. **iOS detecta entrada** (app pode estar fechado)
3. **iOS acorda o app brevemente**
4. **App cria automaticamente um ponto de entrada em RASCUNHO** via `POST /clockin/draft`
5. **App envia notificação**: "🏢 Registramos um ponto de entrada em rascunho para você revisar"
6. **Usuário pode revisar e confirmar o rascunho depois**

#### Saindo do Trabalho

1. **Usuário sai da região de 100m do trabalho**
2. **iOS detecta saída**
3. **App cria automaticamente um ponto de saída em RASCUNHO** via `POST /clockin/draft`
4. **App envia notificação**: "🚶 Registramos um ponto de saída em rascunho para você revisar"
5. **Usuário pode revisar e confirmar o rascunho depois**

## Configurações e Permissões

### app.json

```json
{
  "ios": {
    "infoPlist": {
      "NSLocationAlwaysAndWhenInUseUsageDescription": "Precisamos da sua localização para detectar quando você chega ao trabalho e registrar o ponto automaticamente, mesmo com o app fechado.",
      "NSLocationAlwaysUsageDescription": "Precisamos da sua localização para detectar quando você chega ao trabalho e registrar o ponto automaticamente, mesmo com o app fechado.",
      "UIBackgroundModes": ["location", "remote-notification"]
    }
  },
  "plugins": [
    [
      "expo-location",
      {
        "locationAlwaysAndWhenInUsePermission": "...",
        "locationAlwaysPermission": "...",
        "isIosBackgroundLocationEnabled": true
      }
    ]
  ]
}
```

### Permissões Necessárias

1. **Location When In Use** - Para obter localização ao configurar
2. **Location Always** - Para monitoramento em background
3. **Notifications** - Para enviar alertas

## Parâmetros do Geofencing

- **Raio**: 100 metros
- **Identificador**: "workplace"
- **Precisão**: ~50-200m (depende de GPS/Wi-Fi/célula)
- **Latência**: 5-15 minutos típica
- **Bateria**: Impacto mínimo (usa Cell ID primariamente)

## Limitações e Considerações

### Técnicas

- **Apenas iOS**: Implementação atual é iOS-only
- **Uma localização**: Suporta apenas um local de trabalho
- **Precisão variável**: Depende de condições do ambiente
- **Latência**: Não é instantâneo (5-15 min típico)
- **Bateria**: Impacto mínimo mas existe

### Privacidade

- **Localização sensível**: Requer permissão "Sempre"
- **Transparência**: Usuário deve entender o que está permitindo
- **Controle**: Usuário pode desativar a qualquer momento
- **Dados**: Coordenadas salvas no backend

### UX

- **Confirmação**: Usuário sempre confirma o ponto
- **Flexibilidade**: Pode ignorar notificação se já registrou
- **Feedback**: Status claro na tela de configuração

## Testes

### Testes em Dispositivo Real

```bash
# 1. Build do app
eas build --profile development --platform ios

# 2. Instalar no iPhone
# 3. Ir para Perfil → Localização do Trabalho
# 4. Configurar local atual como trabalho
# 5. Ativar detecção
# 6. Conceder permissão "Sempre"
# 7. Sair do raio de 100m
# 8. Aguardar 5-15 minutos
# 9. Retornar ao local
# 10. Verificar notificação
```

### Simulação no Xcode

1. Abrir projeto iOS no Xcode
2. Executar no dispositivo
3. Debug → Simulate Location
4. Selecionar localização diferente
5. Aguardar evento de geofencing

**Nota**: Simulação pode ser inconsistente. Teste real é recomendado.

## Troubleshooting

### Notificações não aparecem

- ✅ Verificar permissão de notificações
- ✅ Verificar permissão "Sempre" de localização
- ✅ Verificar Background App Refresh ativado
- ✅ Verificar console do Xcode para logs

### Geofence não detecta entrada/saída

- ✅ Mover-se pelo menos 100m de distância
- ✅ Aguardar 5-15 minutos para sistema iOS processar
- ✅ Verificar que Location Services está ativo
- ✅ Tentar em local aberto (melhor GPS)
- ✅ Verificar bateria não está em modo economia extrema

### Permissão não concedida

- ✅ Ir em Settings → Privacy → Location Services
- ✅ Encontrar Timely
- ✅ Selecionar "Always"
- ✅ Verificar que "Precise Location" está ON

## Próximos Passos / Melhorias Futuras

- [ ] Suporte para Android (Google Play Services)
- [ ] Múltiplos locais de trabalho
- [ ] Ajuste de raio da cerca pelo usuário
- [ ] Histórico de detecções
- [ ] Analytics de precisão
- [ ] Modo "férias" (pausar geofencing)
- [ ] Integração com calendário (só ativar em dias úteis)

## Referências

- [Apple CLLocationManager](https://developer.apple.com/documentation/corelocation/cllocationmanager)
- [Apple Region Monitoring](https://developer.apple.com/documentation/corelocation/monitoring_the_user_s_proximity_to_geographic_regions)
- [Expo Modules](https://docs.expo.dev/modules/overview/)
- [React Native Geolocation](https://reactnative.dev/docs/geolocation)
