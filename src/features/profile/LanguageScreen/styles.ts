import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/theme';

export const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.background.secondary};
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
  color: ${colors.text.primary};
  flex: 1;
  text-align: center;
`;

export const Content = styled.View`
  flex: 1;
  padding: ${spacing.sm}px;
`;

export const LanguageList = styled.View`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.lg}px;
  overflow: hidden;
  margin: ${spacing.sm}px;
`;

export const LanguageItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.lg}px ${spacing.lg}px;
  min-height: 64px;
`;

export const LanguageItemText = styled.Text`
  font-size: ${typography.sizes.lg}px;
  color: ${colors.text.primary};
  font-weight: ${typography.weights.regular};
`;

export const LanguageItemCheck = styled.View`
  width: 22px;
  height: 22px;
  border-radius: ${borderRadius.round}px;
  border-width: 2px;
  border-color: ${colors.primary};
  align-items: center;
  justify-content: center;
`;

export const LanguageItemCheckInner = styled.View`
  width: 12px;
  height: 12px;
  border-radius: ${borderRadius.round}px;
  background-color: ${colors.primary};
`;

export const Divider = styled.View`
  height: 1px;
  background-color: ${colors.border.light};
  margin-left: ${spacing.lg}px;
`;

