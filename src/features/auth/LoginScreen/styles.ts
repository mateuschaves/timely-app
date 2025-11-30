import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/theme';

export const Container = styled.View`
  flex: 1;
  background-color: ${colors.background.primary};
  justify-content: center;
  align-items: center;
  padding: ${spacing.lg}px;
`;

export const Content = styled.View`
  width: 100%;
  max-width: 400px;
  align-items: center;
`;

export const Logo = styled.Text`
  font-size: 80px;
  margin-bottom: ${spacing.lg}px;
`;

export const Title = styled.Text`
  font-size: ${typography.sizes.xxxl}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm}px;
  text-align: center;
`;

export const Subtitle = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.xxl}px;
  text-align: center;
`;

export const AppleButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  width: 100%;
  height: 50px;
  background-color: ${colors.primary};
  border-radius: ${borderRadius.md}px;
  justify-content: center;
  align-items: center;
  margin-top: ${spacing.lg}px;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

export const ButtonText = styled.Text`
  color: ${colors.text.inverse};
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
`;

export const ErrorText = styled.Text`
  color: ${colors.status.error};
  font-size: ${typography.sizes.sm}px;
  margin-bottom: ${spacing.sm}px;
  text-align: center;
`;

export const LoadingIndicator = styled(ActivityIndicator).attrs({
  color: colors.text.inverse,
  size: 'small',
})``;

export const TermsText = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.text.secondary};
  line-height: ${typography.sizes.xs * 1.4}px;
  text-align: center;
  margin-top: ${spacing.md}px;
`;

export const TermsLink = styled.Text`
  color: ${colors.primary};
  font-weight: ${typography.weights.semibold};
  text-decoration-line: underline;
`;


