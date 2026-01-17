# Implementação de Live Activity - Guia Rápido

## O que foi implementado?

Foi adicionada funcionalidade de **Live Activity** para iOS que exibe informações em tempo real na Tela de Bloqueio quando o usuário está com um ponto em andamento (trabalho iniciado).

## Funcionalidades

✅ **Iniciar Live Activity automaticamente** ao bater ponto de entrada
✅ **Exibir horário de entrada** do trabalho
✅ **Exibir tempo decorrido** desde o início do trabalho (atualiza a cada 1 minuto)
✅ **Parar Live Activity automaticamente** ao bater ponto de saída
✅ **Restaurar Live Activity** ao abrir o app com sessão ativa

## Como funciona?

### 1. Quando o usuário bate ponto de entrada:
- O sistema inicia uma Live Activity
- A Live Activity mostra o horário de entrada
- O tempo decorrido é atualizado automaticamente a cada minuto

### 2. Quando o usuário bate ponto de saída:
- O sistema para a Live Activity
- A informação desaparece da Tela de Bloqueio

### 3. Se o app é fechado e reaberto com trabalho em andamento:
- O sistema restaura automaticamente a Live Activity
- O tempo decorrido continua sendo atualizado corretamente

## Arquivos Modificados

### Principais:

1. **`src/features/time-clock/hooks/useLiveActivity.ts`** (NOVO)
   - Hook que gerencia toda a lógica de Live Activity
   - Funções: `startWorkSessionActivity`, `stopWorkSessionActivity`

2. **`src/features/home/HomeScreen/index.tsx`**
   - Integra o hook de Live Activity
   - Chama as funções nos momentos certos (clock-in/clock-out)

3. **`modules/expo-live-activity/index.ts`** (NOVO)
   - Define a estrutura de dados da Live Activity

### Configuração:

4. **`app.json`**
   - iOS deployment target atualizado para 16.1
   - Plugin expo-live-activity adicionado
   - `NSSupportsLiveActivities: true` no infoPlist

5. **`package.json`**
   - Dependência `expo-live-activity@0.4.2` adicionada

### Traduções:

6. **`src/i18n/locales/pt-BR.json`**
7. **`src/i18n/locales/en-US.json`**
   - Textos da Live Activity adicionados

### Testes:

8. **`jest.setup.js`**
   - Mock do módulo expo-live-activity adicionado

## Requisitos para Testar

⚠️ **IMPORTANTE**: Live Activities requerem:

1. **Dispositivo físico iOS** (não funciona no simulador)
2. **iOS 16.1 ou superior**
3. **Development build** (precisa rodar `expo prebuild`)

## Como Testar

### Passo 1: Gerar código nativo
```bash
npx expo prebuild --platform ios
```

### Passo 2: Construir e instalar no dispositivo
```bash
npx expo run:ios --device
```

### Passo 3: Testar funcionalidade
1. Abra o app e faça login
2. Toque em "Iniciar Trabalho"
3. **Bloqueie o dispositivo**
4. Verifique que a Live Activity aparece na Tela de Bloqueio
5. Aguarde 1 minuto e veja o tempo atualizar
6. Desbloqueie e abra o app
7. Toque em "Finalizar Trabalho"
8. Bloqueie novamente e verifique que a Live Activity desapareceu

### Para iPhone 14 Pro ou superior:
A Live Activity também aparecerá na **Dynamic Island**!

## Estrutura do Código

### useLiveActivity Hook

```typescript
const { 
  startWorkSessionActivity,  // Inicia Live Activity
  stopWorkSessionActivity,   // Para Live Activity
  isSupported               // Verifica se é suportado
} = useLiveActivity();
```

### Dados da Live Activity

```typescript
interface LiveActivityData {
  entryTime: string;      // Horário de entrada (ISO)
  elapsedTime: string;    // Tempo decorrido (HH:MM:SS)
}
```

## Fluxo Técnico

### Clock-In:
```
Usuário clica "Iniciar Trabalho"
    ↓
API de clock-in é chamada
    ↓
Sucesso? → startWorkSessionActivity(entryTime)
    ↓
Live Activity iniciada
    ↓
Intervalo de 1 minuto iniciado para atualizar elapsed time
```

### Clock-Out:
```
Usuário clica "Finalizar Trabalho"
    ↓
API de clock-out é chamada
    ↓
Sucesso? → stopWorkSessionActivity()
    ↓
Live Activity parada
    ↓
Intervalo de atualização cancelado
```

### Restauração:
```
App abre
    ↓
useEffect verifica último evento
    ↓
Último evento foi clock-in?
    ↓ SIM
Restaura Live Activity com horário original
    ↓ NÃO
Garante que Live Activity está parada
```

## Solução de Problemas

### Live Activity não aparece:
1. Verifique se está usando dispositivo físico (não funciona no simulador)
2. Confirme que o iOS é 16.1 ou superior
3. Verifique se Live Activities estão habilitadas em Configurações > Notificações
4. Verifique os logs no Xcode Console

### Tempo não atualiza:
1. Aguarde pelo menos 1 minuto (intervalo de atualização)
2. Verifique se o app ainda está rodando em background
3. Cheque os logs para ver se as chamadas de update estão sendo feitas

### Live Activity não para após clock-out:
1. Verifique se a API de clock-out retornou sucesso
2. Cheque os logs para confirmar que `stopWorkSessionActivity` foi chamado
3. Force close no app e reabra

## Documentação Completa

Para detalhes técnicos completos, consulte:
- **Inglês**: `docs/LIVE_ACTIVITY.md`
- **README**: Seção "Live Activity (iOS 16.1+)"

## Próximos Passos Possíveis

Melhorias futuras que podem ser implementadas:

1. ✨ Adicionar ações na Live Activity (ex: abrir app ao tocar)
2. ✨ Mostrar informações adicionais (localização, pausas)
3. ✨ Notificações em marcos (ex: "4 horas trabalhadas")
4. ✨ Personalizar aparência baseado no horário
5. ✨ Suporte para múltiplas sessões simultâneas

## Notas Importantes

- ✅ Todos os testes passando (292 testes)
- ✅ Sem vulnerabilidades de segurança (CodeQL scan limpo)
- ✅ Código revisado e comentários em inglês
- ✅ Compatível com Expo SDK 54
- ⚠️ Funcionalidade exclusiva do iOS (Android não suporta Live Activities)
- ⚠️ Requer build nativo (não funciona com Expo Go)

## Suporte

Para dúvidas ou problemas:
1. Consulte a documentação completa em `docs/LIVE_ACTIVITY.md`
2. Verifique os logs do console para mensagens de erro
3. Teste em um dispositivo físico iOS 16.1+
