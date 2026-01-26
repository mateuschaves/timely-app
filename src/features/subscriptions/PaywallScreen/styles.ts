import styled from 'styled-components/native';
import { spacing } from '@/theme';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background.primary};
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${spacing.md}px;
  padding-top: ${spacing.xl}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const BackButton = styled.TouchableOpacity`
  padding: ${spacing.xs}px;
  margin-right: ${spacing.sm}px;
`;

export const CloseButton = styled.TouchableOpacity`
  padding: ${spacing.xs}px;
  margin-right: ${spacing.sm}px;
`;

export const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  flex: 1;
`;

export const Content = styled.View`
  padding: ${spacing.lg}px;
`;

export const HeroSection = styled.View`
  align-items: center;
  padding: ${spacing.xl}px 0;
  margin-bottom: ${spacing.lg}px;
`;

export const HeroTitle = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${({ theme }) => theme.text.primary};
  text-align: center;
  margin-bottom: ${spacing.sm}px;
`;

export const HeroSubtitle = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  line-height: 24px;
`;

export const FeaturesSection = styled.View`
  margin-bottom: ${spacing.xl}px;
`;

export const FeatureItem = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.sm}px;
`;

export const FeatureIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.primaryLight || theme.colors.primary}20;
  align-items: center;
  justify-content: center;
  margin-right: ${spacing.md}px;
`;

export const FeatureText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.text.primary};
  flex: 1;
`;

export const PackagesSection = styled.View`
  margin-bottom: ${spacing.lg}px;
`;

interface PackageCardProps {
  isSelected: boolean;
  isRecommended: boolean;
}

export const PackageCard = styled.TouchableOpacity<PackageCardProps>`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: 12px;
  padding: ${spacing.lg}px;
  margin-bottom: ${spacing.md}px;
  border-width: 2px;
  border-color: ${({ theme, isSelected }) => 
    isSelected ? theme.colors.primary : 'transparent'};
  position: relative;
  ${({ isRecommended }) => isRecommended && `
    border-color: ${({ theme }) => theme.colors.primary};
  `}
`;

export const PackageHighlight = styled.View`
  position: absolute;
  top: -12px;
  right: ${spacing.md}px;
  background-color: ${({ theme }) => theme.colors.primary};
  padding: ${spacing.xs}px ${spacing.md}px;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.background};
`;

export const PackageHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.sm}px;
`;

export const PackageName = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.text.primary};
`;

export const PackagePrice = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

export const PackagePriceUnit = styled.Text`
  font-size: 14px;
  font-weight: normal;
  color: ${({ theme }) => theme.text.secondary};
`;

export const PackageDescription = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.text.secondary};
  line-height: 20px;
`;

export const ButtonContainer = styled.View`
  margin-bottom: ${spacing.md}px;
`;

export const RestoreButton = styled.TouchableOpacity`
  padding: ${spacing.md}px;
  align-items: center;
`;

export const RestoreButtonText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
`;

export const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const ErrorContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${spacing.xl}px;
`;

export const ErrorText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  margin-top: ${spacing.md}px;
`;
