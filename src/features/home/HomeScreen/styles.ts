import styled from 'styled-components/native';

export const Container = styled.SafeAreaView`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-bottom: 100px;
  background-color: #f5f5f5;
`;

export const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
`;

export const Subtitle = styled.Text`
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
`;

interface ButtonProps {
  variant?: 'primary' | 'outline' | 'secondary';
}

export const Button = styled.TouchableOpacity<ButtonProps>`
  width: 100%;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  background-color: ${props => {
    if (props.variant === 'outline') return 'transparent';
    if (props.variant === 'secondary') return '#6c757d';
    return '#007bff';
  }};
  border: ${props => {
    if (props.variant === 'outline') return '2px solid #007bff';
    return 'none';
  }};
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

interface ButtonTextProps {
  variant?: 'primary' | 'outline' | 'secondary';
}

export const ButtonText = styled.Text<ButtonTextProps>`
  color: ${props => {
    if (props.variant === 'outline') return '#007bff';
    return '#fff';
  }};
  font-size: 16px;
  font-weight: 600;
  text-align: center;
`;

export const DeeplinkMessage = styled.Text`
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 12px;
  text-align: center;
  width: 100%;
  border: 1px solid #c3e6cb;
`;

