# Configuração do Sentry

Este projeto está configurado para usar o Sentry para monitoramento de erros e performance.

## Configuração

### 1. Criar um projeto no Sentry

1. Acesse [sentry.io](https://sentry.io/)
2. Crie uma conta ou faça login
3. Crie um novo projeto para React Native
4. Copie o DSN fornecido

### 2. Configurar o DSN

Adicione o DSN do Sentry no arquivo `app.json`:

```json
{
  "expo": {
    "extra": {
      "sentryDsn": "https://seu-dsn@sentry.io/projeto-id"
    }
  }
}
```

**Importante:** Para segurança, é recomendado usar variáveis de ambiente em produção através do EAS Build:

```json
{
  "expo": {
    "extra": {
      "sentryDsn": "${SENTRY_DSN}"
    }
  }
}
```

E configurar a variável no `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "SENTRY_DSN": "https://seu-dsn@sentry.io/projeto-id"
      }
    }
  }
}
```

### 3. Rebuild do App

Após configurar o DSN, você precisará fazer um rebuild do app:

```bash
npm run build:prod
```

## Funcionalidades

### Captura automática de erros

O Sentry está configurado para capturar automaticamente:
- Erros JavaScript não tratados
- Promise rejections não tratadas
- Erros de componentes React

### Performance Monitoring

O Sentry está configurado com:
- Tracking de navegação automático
- Session tracking
- Performance monitoring com 100% de sample rate

### Ambientes

- **Desenvolvimento (`__DEV__`)**: Sentry desabilitado
- **Produção**: Sentry habilitado apenas se DSN estiver configurado

## Uso Manual

Para capturar erros manualmente ou adicionar contexto:

```typescript
import { Sentry } from './src/config/sentry';

// Capturar uma exceção
try {
  // código que pode gerar erro
} catch (error) {
  Sentry.captureException(error);
}

// Capturar uma mensagem
Sentry.captureMessage('Algo importante aconteceu');

// Adicionar contexto do usuário
Sentry.setUser({
  id: userId,
  email: userEmail,
});

// Adicionar breadcrumbs
Sentry.addBreadcrumb({
  message: 'User clicked button',
  category: 'action',
  level: 'info',
});
```

## Verificação

Para verificar se o Sentry está funcionando, você pode forçar um erro de teste:

```typescript
// Apenas para teste - remover após validação
Sentry.captureMessage('Test message from Timely App');
```

## Referências

- [Documentação Sentry React Native](https://docs.sentry.io/platforms/react-native/)
- [Documentação sentry-expo](https://docs.expo.dev/guides/using-sentry/)
