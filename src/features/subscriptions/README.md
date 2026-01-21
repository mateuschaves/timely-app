# Módulo de Assinaturas (Subscriptions)

Este módulo fornece integração completa com o RevenueCat para gerenciamento de assinaturas no aplicativo Timely.

## 📋 Recursos

- ✅ Inicialização do RevenueCat SDK
- ✅ Carregamento de ofertas de assinatura
- ✅ Compra de assinaturas
- ✅ Restauração de compras
- ✅ Gerenciamento de usuários
- ✅ Verificação de status de assinatura

## 🚀 Instalação

As dependências já estão instaladas:

```bash
npm install react-native-purchases
```

## 📖 Uso

### 1. Configurar o Provider

Envolva seu aplicativo com o `SubscriptionProvider`:

```tsx
import { SubscriptionProvider } from '@features/subscriptions';

function App() {
  return (
    <SubscriptionProvider 
      apiKey="your_revenuecat_api_key"
      appUserId="optional_user_id"
    >
      <YourApp />
    </SubscriptionProvider>
  );
}
```

### 2. Usar os Hooks

#### useSubscriptions

Hook para acessar informações de assinaturas:

```tsx
import { useSubscriptions } from '@features/subscriptions';

function SubscriptionScreen() {
  const {
    packages,           // Pacotes disponíveis
    currentOffering,    // Oferta atual
    customerInfo,       // Informações do cliente
    isLoading,          // Estado de carregamento
    error,              // Erro, se houver
    loadOfferings,      // Função para recarregar ofertas
    refreshCustomerInfo,// Função para atualizar info do cliente
    hasActiveSubscription, // Função para verificar assinatura ativa
  } = useSubscriptions();

  const isSubscribed = hasActiveSubscription();

  return (
    <View>
      {packages.map(pkg => (
        <Text key={pkg.identifier}>
          {pkg.product.title} - {pkg.product.priceString}
        </Text>
      ))}
    </View>
  );
}
```

#### usePurchase

Hook para operações de compra:

```tsx
import { usePurchase } from '@features/subscriptions';

function PurchaseButton({ package }) {
  const { purchase, restore, isLoading, error } = usePurchase();

  const handlePurchase = async () => {
    try {
      const result = await purchase(package);
      console.log('Compra realizada:', result);
    } catch (error) {
      console.error('Erro na compra:', error);
    }
  };

  const handleRestore = async () => {
    try {
      const customerInfo = await restore();
      console.log('Compras restauradas:', customerInfo);
    } catch (error) {
      console.error('Erro ao restaurar:', error);
    }
  };

  return (
    <View>
      <Button onPress={handlePurchase} disabled={isLoading}>
        Comprar
      </Button>
      <Button onPress={handleRestore} disabled={isLoading}>
        Restaurar Compras
      </Button>
    </View>
  );
}
```

#### useSubscriptionUser

Hook para gerenciamento de usuários:

```tsx
import { useSubscriptionUser } from '@features/subscriptions';

function UserManagement() {
  const { loginUser, logoutUser, customerInfo, isLoading } = useSubscriptionUser();

  const handleLogin = async (userId: string) => {
    try {
      await loginUser(userId);
      console.log('Usuário logado no RevenueCat');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      console.log('Usuário deslogado do RevenueCat');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <View>
      <Button onPress={() => handleLogin('user123')}>Login</Button>
      <Button onPress={handleLogout}>Logout</Button>
    </View>
  );
}
```

### 3. Usar o Service Diretamente

Se preferir usar o service diretamente sem o contexto:

```tsx
import { revenueCatService } from '@features/subscriptions';

// Inicializar
await revenueCatService.configure('your_api_key', 'optional_user_id');

// Obter ofertas
const offering = await revenueCatService.getOfferings();

// Comprar
const result = await revenueCatService.purchasePackage(package);

// Restaurar
const customerInfo = await revenueCatService.restorePurchases();

// Verificar assinatura ativa
const hasSubscription = await revenueCatService.hasActiveSubscription();
```

## 🔑 Configuração do RevenueCat

1. Crie uma conta em [RevenueCat](https://www.revenuecat.com/)
2. Configure seus produtos no App Store Connect / Google Play Console
3. Adicione os produtos no RevenueCat Dashboard
4. Copie sua API Key do RevenueCat
5. Use a API Key no `SubscriptionProvider`

### Chaves de API

- **iOS**: Use a chave iOS do RevenueCat
- **Android**: Use a chave Android do RevenueCat

O módulo detecta automaticamente a plataforma.

## 📱 Configuração Nativa

### iOS

Adicione no seu `ios/Podfile`:

```ruby
pod 'RevenueCat', '~> 4.0'
```

Execute:

```bash
cd ios && pod install
```

### Android

A configuração é automática via npm.

## 🧪 Testes

Para testar assinaturas:

1. Configure produtos de teste no App Store Connect / Google Play Console
2. Use contas de teste (Sandbox no iOS, Test no Android)
3. Verifique as transações no RevenueCat Dashboard

## 📚 Tipos

O módulo exporta os seguintes tipos TypeScript:

```typescript
interface SubscriptionPackage {
  identifier: string;
  packageType: string;
  product: SubscriptionProduct;
  offering?: PurchasesOffering;
}

interface SubscriptionProduct {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
  introPrice?: {
    price: number;
    priceString: string;
    period: string;
  };
}

interface SubscriptionState {
  customerInfo: CustomerInfo | null;
  packages: SubscriptionPackage[];
  offerings: PurchasesOffering[];
  currentOffering: PurchasesOffering | null;
  isLoading: boolean;
  error: Error | null;
}

interface PurchaseResult {
  customerInfo: CustomerInfo;
  productIdentifier: string;
  transaction?: any;
}
```

## 🔗 Links Úteis

- [Documentação RevenueCat](https://docs.revenuecat.com/)
- [React Native Purchases](https://github.com/RevenueCat/react-native-purchases)
- [RevenueCat Dashboard](https://app.revenuecat.com/)

## ⚠️ Notas Importantes

- A inicialização do SDK deve ser feita antes de qualquer operação
- Use o modo DEBUG apenas em desenvolvimento
- Sempre trate erros de compra adequadamente
- Teste com contas sandbox/test antes de produção
- Mantenha suas API Keys seguras (use variáveis de ambiente)
