# Exemplos de Uso do Módulo de Assinaturas

Este documento fornece exemplos práticos de como usar o módulo de assinaturas do RevenueCat.

## Exemplo 1: Tela de Assinaturas Completa

```tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSubscriptions, usePurchase } from '@features/subscriptions';
import type { PurchasesPackage } from '@features/subscriptions';

export const SubscriptionScreen = () => {
  const {
    packages,
    currentOffering,
    hasActiveSubscription,
    isLoading: loadingOfferings,
    loadOfferings,
  } = useSubscriptions();

  const { purchase, restore, isLoading: purchaseLoading } = usePurchase();
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    loadOfferings();
  }, []);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      setSelectedPackage(pkg);
      const result = await purchase(pkg);
      
      Alert.alert(
        'Compra realizada!',
        'Sua assinatura foi ativada com sucesso.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      if (error.code === 'USER_CANCELLED') {
        // Usuário cancelou a compra
        return;
      }
      
      Alert.alert(
        'Erro na compra',
        'Não foi possível processar sua assinatura. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setSelectedPackage(null);
    }
  };

  const handleRestore = async () => {
    try {
      const customerInfo = await restore();
      
      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        Alert.alert(
          'Restaurado com sucesso!',
          'Suas compras foram restauradas.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Nenhuma compra encontrada',
          'Não encontramos nenhuma assinatura para restaurar.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Erro ao restaurar',
        'Não foi possível restaurar suas compras. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const isSubscribed = hasActiveSubscription();

  if (loadingOfferings) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assine o Timely Premium</Text>
        <Text style={styles.subtitle}>
          Tenha acesso a todos os recursos premium
        </Text>
      </View>

      {isSubscribed && (
        <View style={styles.subscribedBanner}>
          <Text style={styles.subscribedText}>
            ✓ Você já é um assinante Premium!
          </Text>
        </View>
      )}

      <View style={styles.packages}>
        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.identifier}
            style={[
              styles.packageCard,
              selectedPackage?.identifier === pkg.identifier && styles.packageCardLoading,
            ]}
            onPress={() => handlePurchase(pkg)}
            disabled={purchaseLoading}
          >
            <View style={styles.packageHeader}>
              <Text style={styles.packageTitle}>
                {pkg.product.title}
              </Text>
              {pkg.packageType === 'ANNUAL' && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Mais Popular</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.packageDescription}>
              {pkg.product.description}
            </Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {pkg.product.priceString}
              </Text>
              <Text style={styles.period}>
                {pkg.packageType === 'MONTHLY' ? '/mês' : '/ano'}
              </Text>
            </View>

            {pkg.product.introPrice && (
              <Text style={styles.introPrice}>
                Teste grátis por {pkg.product.introPrice.period}
              </Text>
            )}

            {purchaseLoading && selectedPackage?.identifier === pkg.identifier ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <Text style={styles.buyButton}>
                {isSubscribed ? 'Alterar Plano' : 'Assinar'}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        disabled={purchaseLoading}
      >
        <Text style={styles.restoreButtonText}>
          Restaurar Compras
        </Text>
      </TouchableOpacity>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Recursos Premium:</Text>
        <Text style={styles.feature}>✓ Sem limites de pontos de entrada/saída</Text>
        <Text style={styles.feature}>✓ Relatórios avançados</Text>
        <Text style={styles.feature}>✓ Backup automático</Text>
        <Text style={styles.feature}>✓ Suporte prioritário</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  subscribedBanner: {
    backgroundColor: '#4CAF50',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  subscribedText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  packages: {
    padding: 16,
  },
  packageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageCardLoading: {
    opacity: 0.6,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  period: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  introPrice: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 12,
  },
  buyButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    paddingVertical: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  restoreButton: {
    padding: 16,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  features: {
    padding: 20,
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  feature: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
});
```

## Exemplo 2: Verificar Status de Assinatura

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useSubscriptions } from '@features/subscriptions';

export const ProfileScreen = () => {
  const { hasActiveSubscription, customerInfo } = useSubscriptions();

  const isSubscribed = hasActiveSubscription();

  return (
    <View>
      <Text>Status: {isSubscribed ? 'Premium' : 'Free'}</Text>
      
      {isSubscribed && customerInfo && (
        <View>
          <Text>Assinaturas ativas:</Text>
          {Object.keys(customerInfo.entitlements.active).map((key) => (
            <Text key={key}>- {key}</Text>
          ))}
        </View>
      )}
    </View>
  );
};
```

## Exemplo 3: Integração com Autenticação

```tsx
import React, { useEffect } from 'react';
import { useAuthContext } from '@features/auth';
import { useSubscriptionUser } from '@features/subscriptions';

export const AuthIntegration = () => {
  const { user } = useAuthContext();
  const { loginUser, logoutUser } = useSubscriptionUser();

  // Sincronizar usuário do app com RevenueCat
  useEffect(() => {
    if (user?.id) {
      loginUser(user.id).catch(console.error);
    } else {
      logoutUser().catch(console.error);
    }
  }, [user?.id]);

  return null;
};
```

## Exemplo 4: Paywall Simples

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useSubscriptions, usePurchase } from '@features/subscriptions';

export const PaywallModal = ({ onClose }: { onClose: () => void }) => {
  const { packages } = useSubscriptions();
  const { purchase } = usePurchase();

  const handlePurchase = async () => {
    if (packages.length === 0) return;
    
    try {
      await purchase(packages[0]); // Comprar primeiro pacote
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <View>
      <Text>Upgrade para Premium!</Text>
      <Button title="Assinar Agora" onPress={handlePurchase} />
      <Button title="Fechar" onPress={onClose} />
    </View>
  );
};
```

## Exemplo 5: Hook Customizado para Verificar Acesso

```tsx
import { useSubscriptions } from '@features/subscriptions';

export const usePremiumFeature = () => {
  const { hasActiveSubscription } = useSubscriptions();

  const hasPremiumAccess = hasActiveSubscription();

  const checkAccess = (callback: () => void) => {
    if (hasPremiumAccess) {
      callback();
    } else {
      // Mostrar paywall ou mensagem
      alert('Este recurso é exclusivo para assinantes Premium');
    }
  };

  return {
    hasPremiumAccess,
    checkAccess,
  };
};

// Uso:
// const { hasPremiumAccess, checkAccess } = usePremiumFeature();
// checkAccess(() => {
//   // Executar funcionalidade premium
// });
```

## Exemplo 6: Integração no App.tsx

```tsx
import React from 'react';
import { SubscriptionProvider } from '@features/subscriptions';

const REVENUECAT_API_KEY = Platform.select({
  ios: 'test_YVLYOxJIIWXPufinNXuknZzCrbk',
  android: 'test_YVLYOxJIIWXPufinNXuknZzCrbk',
});

function App() {
  return (
    <SubscriptionProvider apiKey={REVENUECAT_API_KEY}>
      <AuthProvider>
        {/* Resto do app */}
      </AuthProvider>
    </SubscriptionProvider>
  );
}
```

## Tratamento de Erros

```tsx
try {
  await purchase(package);
} catch (error: any) {
  // Erros comuns do RevenueCat
  switch (error.code) {
    case 'USER_CANCELLED':
      // Usuário cancelou a compra - não mostrar erro
      break;
    case 'STORE_PROBLEM':
      Alert.alert('Erro', 'Problema com a loja. Tente novamente mais tarde.');
      break;
    case 'PURCHASE_NOT_ALLOWED':
      Alert.alert('Erro', 'Compras não estão habilitadas neste dispositivo.');
      break;
    case 'PURCHASE_INVALID':
      Alert.alert('Erro', 'O produto não está disponível para compra.');
      break;
    case 'PRODUCT_NOT_AVAILABLE_FOR_PURCHASE':
      Alert.alert('Erro', 'Este produto não está disponível.');
      break;
    case 'PRODUCT_ALREADY_PURCHASED':
      Alert.alert('Atenção', 'Você já possui esta assinatura.');
      break;
    default:
      Alert.alert('Erro', 'Não foi possível completar a compra.');
      console.error('Purchase error:', error);
  }
}
```

## Testes de Assinatura

Para testar assinaturas em desenvolvimento:

1. **iOS Sandbox:**
   - Configure contas de teste no App Store Connect
   - Faça login com a conta de teste no dispositivo (Settings > App Store > Sandbox Account)

2. **Android Testing:**
   - Configure contas de teste no Google Play Console
   - Adicione os emails de teste em Internal Testing

3. **RevenueCat Sandbox:**
   - Use o modo Sandbox no RevenueCat Dashboard
   - Veja as transações de teste em tempo real

## Notas Importantes

- Sempre teste compras em ambiente sandbox/test antes de produção
- Mantenha suas API Keys seguras (use variáveis de ambiente)
- O RevenueCat lida automaticamente com receipt validation
- Assinaturas são compartilhadas entre dispositivos do mesmo usuário
- Use `restore()` para recuperar compras em novos dispositivos
