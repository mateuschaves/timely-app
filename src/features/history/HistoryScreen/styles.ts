import styled from 'styled-components/native';
import { FlatList } from 'react-native';

export const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #f5f5f5;
  padding-bottom: 100px;
`;

export const List = styled(FlatList)`
  flex: 1;
  padding: 16px;
`;

export const EntryCard = styled.View`
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

interface EntryTypeProps {
  type: 'entry' | 'exit';
}

export const EntryType = styled.Text<EntryTypeProps>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => (props.type === 'entry' ? '#28a745' : '#dc3545')};
  margin-bottom: 8px;
  text-transform: uppercase;
`;

export const EntryTime = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
`;

export const EntryDate = styled.Text`
  font-size: 14px;
  color: #666;
`;

export const EmptyState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px;
`;

export const EmptyStateText = styled.Text`
  font-size: 16px;
  color: #999;
  text-align: center;
`;


