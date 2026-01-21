# Guia de Integração do RevenueCat

Este guia detalha como integrar o módulo de assinaturas do RevenueCat no aplicativo Timely.

## 📋 Pré-requisitos

Antes de começar, você precisará:

1. **Conta no RevenueCat**: Crie uma conta gratuita em [revenuecat.com](https://www.revenuecat.com/)
2. **Produtos configurados**: Configure seus produtos de assinatura no App Store Connect (iOS) e/ou Google Play Console (Android)
3. **RevenueCat configurado**: Adicione seus produtos no RevenueCat Dashboard

## 🔧 Configuração

### 1. Obter API Keys

1. Acesse o [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Vá para **Settings > API Keys**
3. Copie suas chaves:
   - **iOS**: `appl_xxxxxxxxxxxxxxxx`
   - **Android**: `goog_xxxxxxxxxxxxxxxx`

### 2. Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
# RevenueCat API Keys
REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxxx
REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxxx
```

### 3. Integrar no App.tsx

Adicione o `SubscriptionProvider` no seu `App.tsx`:

```tsx
import { SubscriptionProvider } from '@features/subscriptions';
import { Platform } from 'react-native';

// Selecionar a chave correta baseada na plataforma
const REVENUECAT_API_KEY = Platform.select({
  ios: process.env.REVENUECAT_IOS_KEY || 'appl_xxxxxxxxxxxxxxxx',
  android: process.env.REVENUECAT_ANDROID_KEY || 'goog_xxxxxxxxxxxxxxxx',
});

function App() {
  return (
    <SubscriptionProvider apiKey={REVENUECAT_API_KEY}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            {/* Resto do app */}
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SubscriptionProvider>
  );
}
```

### 4. Sincronizar com Autenticação (Opcional mas Recomendado)

Para vincular assinaturas com usuários autenticados, crie um componente de integração:

```tsx
// src/features/subscriptions/components/SubscriptionAuthSync.tsx
import React, { useEffect } from 'react';
import { useAuthContext } from '@features/auth';
import { useSubscriptionUser } from '@features/subscriptions';

export const SubscriptionAuthSync = () => {
  const { user } = useAuthContext();
  const { loginUser, logoutUser } = useSubscriptionUser();

  useEffect(() => {
    if (user?.id) {
      // Fazer login no RevenueCat com o ID do usuário
      loginUser(user.id).catch((error) => {
        console.error('Failed to sync user with RevenueCat:', error);
      });
    } else {
      // Fazer logout quando o usuário sair
      logoutUser().catch((error) => {
        console.error('Failed to logout from RevenueCat:', error);
      });
    }
  }, [user?.id, loginUser, logoutUser]);

  return null;
};
```

Adicione este componente no seu App.tsx:

```tsx
import { SubscriptionAuthSync } from '@features/subscriptions/components/SubscriptionAuthSync';

function App() {
  return (
    <SubscriptionProvider apiKey={REVENUECAT_API_KEY}>
      <AuthProvider>
        <SubscriptionAuthSync />
        {/* Resto do app */}
      </AuthProvider>
    </SubscriptionProvider>
  );
}
```

## 📱 Configuração Nativa

### iOS

1. Instale as dependências nativas:

```bash
cd ios
pod install
cd ..
```

2. Configure o In-App Purchase no Xcode:
   - Abra o projeto no Xcode
   - Vá em **Signing & Capabilities**
   - Adicione **In-App Purchase** capability

3. Configure produtos no App Store Connect:
   - Acesse [App Store Connect](https://appstoreconnect.apple.com/)
   - Vá em **My Apps > [Seu App] > In-App Purchases**
   - Crie produtos de assinatura (Auto-Renewable Subscriptions)

### Android

1. Configure o Google Play Billing no AndroidManifest.xml (já deve estar configurado com Expo):

```xml
<uses-permission android:name="com.android.vending.BILLING" />
```

2. Configure produtos no Google Play Console:
   - Acesse [Google Play Console](https://play.google.com/console/)
   - Vá em **Monetize > Subscriptions**
   - Crie seus produtos de assinatura

## 🎯 Configuração no RevenueCat Dashboard

### 1. Conectar App Stores

1. Acesse **App Settings > App Store Connect** (iOS) ou **Google Play** (Android)
2. Siga as instruções para conectar sua conta

### 2. Criar Offerings

1. Vá em **Offerings**
2. Clique em **Create New Offering**
3. Adicione seus produtos:
   - **Package Type**: Monthly, Annual, etc.
   - **Product ID**: O ID do produto criado no App Store/Google Play
4. Marque como **Current** para torná-la ativa

### 3. Configurar Entitlements

1. Vá em **Entitlements**
2. Crie entitlements (ex: "premium", "pro")
3. Vincule os produtos aos entitlements

## 🧪 Testes

### Ambiente de Teste

Para testar sem fazer compras reais:

#### iOS Sandbox

1. Crie uma conta de teste sandbox no App Store Connect:
   - **Users and Access > Sandbox Testers**
2. No dispositivo/simulador, faça logout do App Store real
3. Faça login com a conta sandbox quando solicitado

#### Android Testing

1. Configure contas de teste no Google Play Console:
   - **Settings > License Testing**
2. Adicione os emails de teste
3. Instale a versão de teste do app

### Verificar Integração

Execute este código para verificar se está tudo funcionando:

```tsx
import { revenueCatService } from '@features/subscriptions';

// Verificar se está configurado
const isConfigured = revenueCatService.isSDKConfigured();
console.log('RevenueCat configured:', isConfigured);

// Carregar ofertas
const offerings = await revenueCatService.getOfferings();
console.log('Available offerings:', offerings);

// Verificar customer info
const customerInfo = await revenueCatService.getCustomerInfo();
console.log('Customer info:', customerInfo);
```

## 🚀 Uso em Produção

### 1. Build de Produção

Para iOS:
```bash
npm run build:ios
```

Para Android:
```bash
npm run build:android
```

### 2. Submeter para Review

Certifique-se de:
- Todos os produtos estão aprovados nas lojas
- O RevenueCat está em modo Production (não Sandbox)
- As API Keys de produção estão configuradas
- Testou o fluxo de compra completo em sandbox

### 3. Monitoramento

1. **RevenueCat Dashboard**: Monitore vendas, renovações e churns
2. **Charts**: Veja métricas de receita em tempo real
3. **Customer View**: Veja o histórico de cada cliente

## 🔒 Segurança

### Proteger API Keys

**NUNCA** commite suas API Keys no código. Use variáveis de ambiente:

1. Adicione ao `.gitignore`:
```
.env
.env.local
```

2. Use `expo-constants` para acessar as variáveis:

```tsx
import Constants from 'expo-constants';

const REVENUECAT_API_KEY = Platform.select({
  ios: Constants.expoConfig?.extra?.revenueCatIosKey,
  android: Constants.expoConfig?.extra?.revenueCatAndroidKey,
});
```

3. Configure no `app.json`:

```json
{
  "expo": {
    "extra": {
      "revenueCatIosKey": process.env.REVENUECAT_IOS_KEY,
      "revenueCatAndroidKey": process.env.REVENUECAT_ANDROID_KEY
    }
  }
}
```

## 📊 Métricas e Analytics

O RevenueCat automaticamente rastreia:

- **MRR (Monthly Recurring Revenue)**: Receita mensal recorrente
- **ARR (Annual Recurring Revenue)**: Receita anual recorrente
- **Churn Rate**: Taxa de cancelamento
- **Trial Conversion**: Taxa de conversão de trial
- **Lifetime Value**: Valor de vida do cliente

Acesse essas métricas no Dashboard > Charts.

## 🐛 Troubleshooting

### Problema: "No offerings available"

**Solução:**
1. Verifique se os produtos estão criados no App Store/Google Play
2. Confirme que os produtos estão adicionados ao Offering no RevenueCat
3. Certifique-se de que o Offering está marcado como "Current"
4. Aguarde alguns minutos para sincronização

### Problema: "Purchase failed"

**Solução:**
1. Verifique se está usando conta sandbox (em teste)
2. Confirme que o produto está disponível na região do dispositivo
3. Verifique se não há assinaturas duplicadas
4. Tente restaurar compras antes de comprar novamente

### Problema: "SDK not configured"

**Solução:**
1. Verifique se o `SubscriptionProvider` está envolvendo o app
2. Confirme que a API Key está correta
3. Verifique se não há erros no console

## 📚 Recursos Adicionais

- [Documentação do RevenueCat](https://docs.revenuecat.com/)
- [React Native Purchases SDK](https://github.com/RevenueCat/react-native-purchases)
- [Guia de Migração](https://docs.revenuecat.com/docs/migrating-to-revenuecat)
- [Best Practices](https://www.revenuecat.com/blog/engineering/best-practices/)
- [Community](https://community.revenuecat.com/)

## 🆘 Suporte

- **RevenueCat Support**: support@revenuecat.com
- **Community Slack**: [RevenueCat Community](https://www.revenuecat.com/community/)
- **GitHub Issues**: [react-native-purchases](https://github.com/RevenueCat/react-native-purchases/issues)
