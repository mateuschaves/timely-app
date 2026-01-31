import styled from 'styled-components/native';
import { spacing } from '@/theme';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background.primary};
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${spacing.sm}px;
  padding-top: ${spacing.md}px;
  padding-bottom: ${spacing.md}px;
  border-bottom-width: 0;
  background-color: ${({ theme }) => theme.background.primary};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 2;
`;

export const BackButton = styled.TouchableOpacity`
  padding: ${spacing.xs}px;
  margin-right: ${spacing.sm}px;
`;

export const CloseButton = styled.TouchableOpacity`
  padding: ${spacing.xs}px;
  margin-left: auto;
`;

export const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  flex: 1;
`;

export const Content = styled.View`
  padding: ${spacing.sm}px;
  padding-bottom: ${spacing.md}px;
`;

export const HeroSection = styled.View`
  align-items: center;
  padding: ${spacing.sm}px 0;
  margin-bottom: ${spacing.sm}px;
`;

export const HeroIcon = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: ${({ theme }) => theme.background.secondary};
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing.sm}px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 8px;
  elevation: 5;
`;

export const HeroEmoji = styled.Text`
  font-size: 56px;
`;

export const HeroTitle = styled.Text`
  font-size: 26px;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  text-align: center;
  margin-bottom: ${spacing.xs}px;
  letter-spacing: -0.5px;
`;

export const HeroSubtitle = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  line-height: 20px;
  letter-spacing: 0.2px;
  padding: 0 ${spacing.md}px;
`;

export const FeaturesContainer = styled.View`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: 12px;
  padding: ${spacing.md}px;
  padding-bottom: ${spacing.sm}px;
  margin-bottom: ${spacing.md}px;
  gap: ${spacing.xs}px;
`;

export const FeatureItem = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${spacing.sm}px;
  padding-bottom: ${spacing.sm}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.border.light};
  
  &:last-child {
    border-bottom-width: 0;
    padding-bottom: 0;
  }
`;

export const FeatureCheckIcon = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.primary};
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  flex-shrink: 0;
`;

export const FeatureTextContainer = styled.View`
  flex: 1;
  gap: 2px;
`;

export const FeatureTitle = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  line-height: 18px;
`;

export const FeatureSubtitle = styled.Text`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.text.secondary};
  line-height: 16px;
`;

export const PackagesSectionContainer = styled.View`
  margin-bottom: ${spacing.sm}px;
`;

export const PackagesRow = styled.View`
  flex-direction: row;
  gap: ${spacing.xs}px;
  justify-content: space-between;
`;

interface PackageCardProps {
  isSelected: boolean;
  isRecommended: boolean;
}

export const PackageCard = styled.TouchableOpacity<PackageCardProps>`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: 14px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.xs}px;
  border-width: 2px;
  border-color: ${({ theme, isSelected }) => 
    isSelected ? theme.primary : 'transparent'};
  position: relative;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.1;
  shadow-radius: 5px;
  elevation: 3;
  ${({ isRecommended, isSelected, theme }) => isRecommended && !isSelected && `
    border-color: ${theme.border.light};
    shadow-color: #000;
    shadow-opacity: 0.08;
  `}
`;


export const PackageHighlight = styled.View`
  position: absolute;
  top: -12px;
  right: ${spacing.lg}px;
  background-color: ${({ theme }) => theme.primary};
  padding: ${spacing.xs}px ${spacing.md}px;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  shadow-color: ${({ theme }) => theme.primary};
  shadow-offset: 0px 3px;
  shadow-opacity: 0.3;
  shadow-radius: 4px;
  elevation: 4;
`;

export const PackageHighlightText = styled.Text`
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.background.primary};
`;

export const PackageHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.xs}px;
  width: 100%;
`;

export const PackageName = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  letter-spacing: 0.2px;
`;

export const PackagePrice = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.primary};
  letter-spacing: -0.5px;
`;

export const PackagePriceUnit = styled.Text`
  font-size: 14px;
  font-weight: normal;
  color: ${({ theme }) => theme.text.secondary};
`;

export const PackageDescription = styled.Text`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
  line-height: 16px;
  margin-top: ${spacing.xs}px;
  letter-spacing: 0.2px;
`;

export const ButtonContainer = styled.View`
  margin-bottom: ${spacing.xs}px;
  margin-top: ${spacing.sm}px;
  gap: ${spacing.xs}px;
`;

export const RestoreButton = styled.TouchableOpacity`
  padding: ${spacing.sm}px ${spacing.md}px;
  align-items: center;
  justify-content: center;
  margin-top: ${spacing.xs}px;
  border-radius: 10px;
  border-width: 1.5px;
  border-color: ${({ theme }) => theme.primary};
  background-color: transparent;
`;

export const RestoreButtonText = styled.Text`
  font-size: 15px;
  color: ${({ theme }) => theme.primary};
  font-weight: 700;
  letter-spacing: 0.3px;
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
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: 12px;
  margin: ${spacing.md}px;
`;

export const ErrorText = styled.Text`
  font-size: 15px;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  margin-top: ${spacing.md}px;
  line-height: 21px;
  font-weight: 500;
`;
