import React, { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/context/ThemeContext';
import { useFeedback } from '@/utils/feedback';
import { useSubscriptions, usePurchase } from '@/features/subscriptions';
import { Button } from '@/components/Button';
import type { PurchasesPackage } from 'react-native-purchases';
import {
  Container,
  Content,
  Header,
  CloseButton,
  HeroSection,
  HeroIcon,
  HeroEmoji,
  HeroTitle,
  HeroSubtitle,
  FeaturesContainer,
  FeatureItem,
  FeatureCheckIcon,
  FeatureTextContainer,
  FeatureTitle,
  FeatureSubtitle,
  PackagesSectionContainer,
  PackagesRow,
  PackageCard,
  PackageHeader,
  PackageName,
  PackagePrice,
  PackagePriceUnit,
  PackageDescription,
  PackageHighlight,
  PackageHighlightText,
  ButtonContainer,
  RestoreButtonText,
  LoadingContainer,
  ErrorContainer,
  ErrorText,
} from './styles';

type PaywallRouteParams = {
  Paywall: {
    feature?: 'geofencing' | 'justified_absences';
  };
};

type PaywallRouteProp = RouteProp<PaywallRouteParams, 'Paywall'>;

export function PaywallScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<PaywallRouteProp>();
  const { theme } = useTheme();
  const { showSuccess, showError } = useFeedback();
  const { packages, currentOffering, isLoading: isLoadingOfferings } = useSubscriptions();
  const { purchase, restore, isLoading: isPurchasing } = usePurchase();
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  const features = [
    {
      icon: 'location' as const,
      text: t('subscriptions.featureGeofencing'),
      description: t('subscriptions.featureGeofencingDesc'),
    },
    {
      icon: 'calendar' as const,
      text: t('subscriptions.featureJustifiedAbsences'),
      description: t('subscriptions.featureJustifiedAbsencesDesc'),
    },
    {
      icon: 'analytics' as const,
      text: t('subscriptions.featureAdvancedReports'),
      description: t('subscriptions.featureAdvancedReportsDesc'),
    },
  ];

  useEffect(() => {
    if (packages.length === 0) {
      return;
    }

    const selectedStillExists = selectedPackage
      ? packages.some((pkg) => pkg.identifier === selectedPackage.identifier)
      : false;

    if (!selectedPackage || !selectedStillExists) {
      const annualPackage = packages.find((pkg) => pkg.packageType === 'ANNUAL');
      setSelectedPackage(annualPackage ?? packages[0]);
    }
  }, [packages, selectedPackage]);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      showError(t('subscriptions.selectPackageError'));
      return;
    }

    try {
      const result = await purchase(selectedPackage);
      if (result) {
        showSuccess(t('subscriptions.purchaseSuccess'));
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      // Check if user cancelled
      if (error?.userCancelled) {
        return;
      }
      
      showError(error.message || t('subscriptions.purchaseError'));
    }
  };

  const handleRestore = async () => {
    try {
      const customerInfo = await restore();
      const hasActiveSubscription = 
        Object.keys(customerInfo.entitlements.active).length > 0;
      
      if (hasActiveSubscription) {
        showSuccess(t('subscriptions.restoreSuccess'));
        navigation.goBack();
      } else {
        showError(t('subscriptions.noSubscriptionToRestore'));
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      showError(error.message || t('subscriptions.restoreError'));
    }
  };

  const getPackageDisplayName = (pkg: PurchasesPackage): string => {
    const packageType = pkg.packageType;
    
    switch (packageType) {
      case 'MONTHLY':
        return t('subscriptions.packageMonthly');
      case 'ANNUAL':
        return t('subscriptions.packageAnnual');
      case 'WEEKLY':
        return t('subscriptions.packageWeekly');
      case 'LIFETIME':
        return t('subscriptions.packageLifetime');
      default:
        return pkg.identifier;
    }
  };

  const getPackageDescription = (pkg: PurchasesPackage): string => {
    const packageType = pkg.packageType;
    
    switch (packageType) {
      case 'MONTHLY':
        return t('subscriptions.packageMonthlyDesc');
      case 'ANNUAL':
        return t('subscriptions.packageAnnualDesc');
      case 'WEEKLY':
        return t('subscriptions.packageWeeklyDesc');
      case 'LIFETIME':
        return t('subscriptions.packageLifetimeDesc');
      default:
        return '';
    }
  };

  const isRecommended = (pkg: PurchasesPackage): boolean => {
    return pkg.packageType === 'ANNUAL';
  };

  if (isLoadingOfferings) {
    return (
      <Container>
        <Header>
          <CloseButton onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={theme.text.primary} />
          </CloseButton>
        </Header>
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.primary} />
        </LoadingContainer>
      </Container>
    );
  }

  if (!currentOffering || packages.length === 0) {
    return (
      <Container>
        <Header>
          <CloseButton onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={theme.text.primary} />
          </CloseButton>
        </Header>
        <ErrorContainer>
          <Ionicons name="alert-circle" size={48} color={theme.status.error} />
          <ErrorText>{t('subscriptions.noOfferings')}</ErrorText>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <CloseButton onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={theme.text.primary} />
        </CloseButton>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          <HeroSection>
            <HeroIcon>
              <HeroEmoji>⏰</HeroEmoji>
            </HeroIcon>
            <HeroTitle>{t('subscriptions.heroTitle')}</HeroTitle>
            <HeroSubtitle>{t('subscriptions.heroSubtitle')}</HeroSubtitle>
          </HeroSection>

          <FeaturesContainer>
            {features.map((feature, index) => (
              <FeatureItem key={index}>
                <FeatureCheckIcon>
                  <Ionicons name="checkmark" size={20} color={theme.secondary} />
                </FeatureCheckIcon>
                <FeatureTextContainer>
                  <FeatureTitle>{feature.text}</FeatureTitle>
                  <FeatureSubtitle>{feature.description || ''}</FeatureSubtitle>
                </FeatureTextContainer>
              </FeatureItem>
            ))}
          </FeaturesContainer>

          <PackagesSectionContainer>
            <PackagesRow>
              {packages.slice(0, 2).map((pkg) => (
                <PackageCard
                  key={pkg.identifier}
                  isSelected={selectedPackage?.identifier === pkg.identifier}
                  isRecommended={isRecommended(pkg)}
                  onPress={() => setSelectedPackage(pkg)}
                  activeOpacity={0.7}
                  style={{ flex: 1, marginHorizontal: 4 }}
                >
                  {isRecommended(pkg) && (
                    <PackageHighlight>
                      <Ionicons name="star" size={14} color={theme.background.primary} />
                      <PackageHighlightText>{t('subscriptions.recommended')}</PackageHighlightText>
                    </PackageHighlight>
                  )}
                  <PackageHeader>
                    <PackageName>{getPackageDisplayName(pkg)}</PackageName>
                  </PackageHeader>
                  <PackagePrice>
                    {pkg.product.priceString}
                    <PackagePriceUnit>
                      {pkg.packageType === 'MONTHLY' && `/${t('subscriptions.month')}`}
                      {pkg.packageType === 'ANNUAL' && `/${t('subscriptions.year')}`}
                      {pkg.packageType === 'WEEKLY' && `/${t('subscriptions.week')}`}
                    </PackagePriceUnit>
                  </PackagePrice>
                  <PackageDescription>{getPackageDescription(pkg)}</PackageDescription>
                </PackageCard>
              ))}
            </PackagesRow>
          </PackagesSectionContainer>

          <ButtonContainer>
            <Button
              title={t('subscriptions.subscribe')}
              onPress={handlePurchase}
              disabled={!selectedPackage || isPurchasing}
              isLoading={isPurchasing}
            />
          </ButtonContainer>

          <RestoreButtonText onPress={handleRestore}>{t('subscriptions.restorePurchases')}</RestoreButtonText>
        </Content>
      </ScrollView>
    </Container>
  );
}
