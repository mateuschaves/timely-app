# Reactotron Setup

Reactotron é uma ferramenta de debugging para React Native que permite inspecionar o estado da aplicação, ver logs, monitorar requisições HTTP, etc.

## Instalação

As dependências já estão instaladas. Se precisar reinstalar:

```bash
npm install --save-dev reactotron-react-native reactotron-react-query reactotron-core-client
```

## Como Usar

### 1. Instalar o App Reactotron

Baixe e instale o Reactotron Desktop:
- **macOS**: [Download](https://github.com/infinitered/reactotron/releases)
- **Windows/Linux**: [Download](https://github.com/infinitered/reactotron/releases)

### 2. Iniciar o App

1. Abra o Reactotron Desktop
2. Inicie seu app React Native (`npm start`)
3. O Reactotron se conectará automaticamente ao app

### 3. Funcionalidades Disponíveis

#### Logs Customizados

```typescript
// Log simples
console.tron.log('Mensagem de log');

// Log com objeto
console.tron.display({
  name: 'Nome do Log',
  value: { dados: 'aqui' },
  preview: 'Preview do log',
  important: true, // Destaque no Reactotron
});

// Log de erro
console.tron.error('Erro ocorrido');
```

#### Monitoramento Automático

- **React Query**: Todas as queries e mutations são monitoradas automaticamente
- **API Requests**: Todas as requisições HTTP são logadas automaticamente
- **AsyncStorage**: Operações do AsyncStorage são monitoradas
- **Console Logs**: Logs do console aparecem no Reactotron

#### Limpar Logs

```typescript
console.tron.clear(); // Limpa todos os logs
```

## Configuração

A configuração está em `src/config/reactotron.ts`.

### Hosts

- **iOS Simulator**: `localhost`
- **Android Emulator**: `10.0.2.2`
- **Dispositivo Físico**: IP da sua máquina na rede local

Para usar em dispositivo físico, edite `src/config/reactotron.ts`:

```typescript
host: '192.168.1.100', // Substitua pelo IP da sua máquina
```

## Troubleshooting

### Reactotron não conecta

1. Verifique se o Reactotron Desktop está aberto
2. Verifique se está em modo desenvolvimento (`__DEV__ === true`)
3. Para Android, certifique-se de usar `10.0.2.2` como host
4. Verifique o firewall da sua máquina

### Logs não aparecem

1. Certifique-se de que `__DEV__` está `true`
2. Verifique se o Reactotron está conectado (ícone verde no canto inferior)
3. Tente limpar o cache: `npx expo start -c`

## Desenvolvimento vs Produção

O Reactotron **só funciona em desenvolvimento**. Em produção:
- O código do Reactotron não é incluído no bundle
- `console.tron` retorna funções vazias (não causa erros)
- Não há impacto na performance

