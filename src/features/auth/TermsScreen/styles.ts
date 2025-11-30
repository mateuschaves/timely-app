import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius, typography } from '@/theme';

export const Container = styled(SafeAreaView)<{ theme: any }>`
  flex: 1;
  background-color: ${({ theme }) => theme.background.primary};
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${spacing.md}px ${spacing.lg}px;
  background-color: transparent;
  position: relative;
`;

export const BackButton = styled.TouchableOpacity`
  padding: ${spacing.sm}px;
  position: absolute;
  left: ${spacing.sm}px;
  z-index: 1;
`;

export const HeaderTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
  flex: 1;
  text-align: center;
`;

export const Content = styled.View`
  flex: 1;
`;

export const ScrollContent = styled.ScrollView`
  flex: 1;
  padding: ${spacing.lg}px;
`;

export const Section = styled.View`
  margin-bottom: ${spacing.xl}px;
`;

export const SectionTitle = styled.Text.attrs({
  selectable: true,
})`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: ${spacing.sm}px;
`;

export const SectionText = styled.Text.attrs({
  selectable: true,
})`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.regular};
  color: ${({ theme }) => theme.text.secondary};
  line-height: ${typography.sizes.md * 1.5}px;
`;

export const TermsText = styled.Text.attrs({
  selectable: true,
})`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.regular};
  color: ${({ theme }) => theme.text.secondary};
  line-height: ${typography.sizes.md * 1.5}px;
  text-align: center;
`;

export const LinkText = styled.TouchableOpacity`
  margin-top: ${spacing.sm}px;
`;

export const LinkTextContent = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.primary};
  text-decoration-line: underline;
`;

