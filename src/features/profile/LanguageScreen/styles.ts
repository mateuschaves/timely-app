import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

export const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.background.secondary};
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 16px 20px;
  background-color: transparent;
  position: relative;
`;

export const BackButton = styled.TouchableOpacity`
  padding: 8px;
  position: absolute;
  left: 12px;
  z-index: 1;
`;

export const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.text.primary};
  flex: 1;
  text-align: center;
`;

export const Content = styled.View`
  flex: 1;
  padding: 8px;
`;

export const LanguageList = styled.View`
  background-color: ${colors.background.primary};
  border-radius: 12px;
  overflow: hidden;
  margin: 8px;
`;

export const LanguageItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  min-height: 64px;
`;

export const LanguageItemText = styled.Text`
  font-size: 17px;
  color: ${colors.text.primary};
  font-weight: 400;
`;

export const LanguageItemCheck = styled.View`
  width: 22px;
  height: 22px;
  border-radius: 11px;
  border-width: 2px;
  border-color: ${colors.primary};
  align-items: center;
  justify-content: center;
`;

export const LanguageItemCheckInner = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${colors.primary};
`;

export const Divider = styled.View`
  height: 1px;
  background-color: ${colors.border.light};
  margin-left: 24px;
`;

