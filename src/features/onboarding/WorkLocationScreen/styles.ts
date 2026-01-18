import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius, typography } from '@/theme';

export const Container = styled(SafeAreaView)<{ theme: any }>`
  flex: 1;
  background-color: ${({ theme }) => theme.background.primary};
  margin: ${spacing.xl}px;
  border-radius: ${borderRadius.xl}px;
  overflow: hidden;
  max-width: 480px;
  width: 100%;
  max-height: 85%;
  align-self: center;
  shadow-color: #000;
  shadow-offset: 0px 20px;
  shadow-opacity: 0.3;
  shadow-radius: 25px;
  elevation: 10;
`;

export const Header = styled.View`
  padding: ${spacing.md}px ${spacing.lg}px;
  align-items: flex-end;
`;

export const SkipButton = styled.TouchableOpacity`
  padding: ${spacing.sm}px ${spacing.md}px;
`;

export const SkipButtonText = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.text.secondary};
`;

export const Content = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
})`
  flex: 1;
  max-height: 100%;
`;

export const Title = styled.Text`
  font-size: ${typography.sizes.xxl}px;
  font-weight: ${typography.weights.bold};
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: ${spacing.sm}px;
`;

export const Subtitle = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.regular};
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: ${spacing.xl}px;
  line-height: 22px;
`;

export const LocationContainer = styled.View`
  margin-bottom: ${spacing.xl}px;
  min-height: 150px;
  justify-content: center;
  align-items: center;
`;

export const LocationButton = styled.TouchableOpacity<{ theme: any }>`
  background-color: ${({ theme }) => theme.primary};
  padding: ${spacing.md}px ${spacing.lg}px;
  border-radius: ${borderRadius.lg}px;
  align-items: center;
  justify-content: center;
  min-height: 50px;
`;

export const LocationButtonText = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: #ffffff;
`;

export const LocationStatus = styled.View`
  padding: ${spacing.md}px;
  align-items: center;
`;

export const LocationStatusText = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.regular};
  color: ${({ theme }) => theme.text.secondary};
`;

export const LoadingContainer = styled.View`
  padding: ${spacing.xl}px;
  align-items: center;
  justify-content: center;
`;

export const ButtonContainer = styled.View`
  padding: ${spacing.lg}px;
`;

export const ContinueButton = styled.TouchableOpacity<{ theme: any }>`
  background-color: ${({ theme }) => theme.primary};
  padding: ${spacing.md}px ${spacing.lg}px;
  border-radius: ${borderRadius.lg}px;
  align-items: center;
  justify-content: center;
  min-height: 50px;
`;

export const ContinueButtonText = styled.Text<{ theme: any; disabled?: boolean }>`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme, disabled }) => {
    if (disabled) return '#999';
    // No modo escuro, primary é branco, então texto deve ser preto
    // No modo claro, primary é preto, então texto deve ser branco
    return theme.colorScheme === 'dark' ? '#000000' : '#ffffff';
  }};
`;

export const SearchContainer = styled.View`
  position: relative;
  margin-bottom: ${spacing.md}px;
  z-index: 10;
`;

export const SearchInputWrapper = styled.View`
  position: relative;
  flex-direction: row;
  align-items: center;
`;

export const SearchInput = styled.TextInput<{ theme: any }>`
  flex: 1;
  background-color: ${({ theme }) => (theme.colorScheme === 'dark' ? '#2a2a2a' : theme.background.secondary)};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  padding-right: ${spacing.xxl}px;
  font-size: ${typography.sizes.md}px;
  color: ${({ theme }) => theme.text.primary};
  border: 1px solid ${({ theme }) => theme.border.medium};
  min-height: 48px;
`;

export const SearchLoadingIndicator = styled.View`
  position: absolute;
  right: ${spacing.md}px;
  top: 50%;
  transform: translateY(-10px);
  z-index: 1;
`;

export const SuggestionsList = styled.View<{ theme: any }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => (theme.colorScheme === 'dark' ? '#2a2a2a' : theme.background.primary)};
  border-radius: ${borderRadius.md}px;
  margin-top: ${spacing.xs}px;
  max-height: 200px;
  border: 1px solid ${({ theme }) => theme.border.medium};
  shadow-color: ${({ theme }) => theme.shadows.sm.shadowColor};
  shadow-offset: 0px 2px;
  shadow-opacity: ${({ theme }) => theme.shadows.sm.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.sm.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.sm.elevation};
  z-index: 1000;
`;

export const SuggestionItem = styled.TouchableOpacity`
  padding: ${spacing.md}px ${spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.border.light};
`;

export const SuggestionText = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.xs}px;
  color: ${({ theme }) => theme.text.primary};
  line-height: 16px;
`;

export const MapContainer = styled.View`
  height: 400px;
  border-radius: ${borderRadius.lg}px;
  overflow: hidden;
  margin-bottom: ${spacing.md}px;
  position: relative;
`;

// MapView is now platform-specific (AppleMaps.View or GoogleMaps.View)

export const ErrorText = styled.Text`
  color: #ff4444;
  font-size: ${typography.sizes.sm}px;
  margin-bottom: ${spacing.sm}px;
  text-align: center;
`;

export const CurrentLocationButton = styled.TouchableOpacity<{ theme: any; disabled?: boolean }>`
  position: absolute;
  bottom: ${spacing.md}px;
  right: ${spacing.md}px;
  background-color: ${({ theme, disabled }) => (disabled ? theme.text.tertiary : theme.primary)};
  padding: ${spacing.sm}px ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  shadow-color: ${({ theme }) => theme.shadows.md.shadowColor};
  shadow-offset: 0px 2px;
  shadow-opacity: ${({ theme }) => theme.shadows.md.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.md.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.md.elevation};
`;

export const CurrentLocationButtonText = styled.Text<{ theme: any; disabled?: boolean }>`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme, disabled }) => {
    if (disabled) return '#999';
    // No modo escuro, primary é branco, então texto deve ser preto
    // No modo claro, primary é preto, então texto deve ser branco
    return theme.colorScheme === 'dark' ? '#000000' : '#ffffff';
  }};
`;
