import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native';

export const Container = styled.View`
  flex: 1;
  background-color: #f5f5f5;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

export const Content = styled.View`
  width: 100%;
  max-width: 400px;
  align-items: center;
`;

export const Logo = styled.Text`
  font-size: 80px;
  margin-bottom: 20px;
`;

export const Title = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
`;

export const Subtitle = styled.Text`
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
  text-align: center;
`;

export const AppleButton = styled.TouchableOpacity`
  width: 100%;
  height: 50px;
  background-color: #000;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

export const ButtonText = styled.Text`
  color: #fff;
  font-size: 17px;
  font-weight: 600;
`;

export const ErrorText = styled.Text`
  color: #dc3545;
  font-size: 14px;
  margin-bottom: 10px;
  text-align: center;
`;

export const LoadingIndicator = styled(ActivityIndicator).attrs({
  color: '#fff',
  size: 'small',
})``;


