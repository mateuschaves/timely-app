import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import styled from 'styled-components/native';
import { colors, spacing, borderRadius } from '@/theme';

// Componente base de skeleton com animação shimmer
const SkeletonBase = styled.View`
  background-color: ${colors.background.secondary};
  border-radius: ${borderRadius.sm}px;
  overflow: hidden;
`;

const ShimmerOverlay = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.6);
`;

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 20, borderRadius = 4, style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  return (
    <SkeletonBase style={[{ width, height, borderRadius }, style]}>
      <ShimmerOverlay
        style={{
          transform: [{ translateX }],
          opacity,
        }}
      />
    </SkeletonBase>
  );
};

// Container para o skeleton do resumo do mês
export const SkeletonMonthSummaryCard = styled.View`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.lg}px;
  margin-bottom: ${spacing.lg}px;
  margin-top: 0px;
  border-width: 1px;
  border-color: ${colors.border.light};
`;

export const SkeletonSummaryRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-start;
  margin-bottom: ${spacing.md}px;
`;

export const SkeletonSummaryItem = styled.View`
  flex: 1;
  align-items: center;
`;

export const SkeletonSummaryDivider = styled.View`
  width: 1px;
  height: 40px;
  background-color: ${colors.border.light};
  margin: 0 ${spacing.md}px;
`;

export const SkeletonDifferenceRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: ${spacing.md}px;
  margin-top: ${spacing.md}px;
  border-top-width: 1px;
  border-top-color: ${colors.border.light};
`;

// Container para o skeleton do card de dia
export const SkeletonDayCard = styled.View`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.lg}px;
  margin-bottom: ${spacing.lg}px;
  border-width: 1px;
  border-color: ${colors.border.light};
`;

export const SkeletonDayHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.md}px;
`;

export const SkeletonDayHeaderRight = styled.View`
  flex-direction: row;
  align-items: center;
`;

// Componente completo do skeleton do resumo do mês
export const MonthSummarySkeleton: React.FC = () => {
  return (
    <SkeletonMonthSummaryCard>
      <SkeletonSummaryRow>
        <SkeletonSummaryItem>
          <Skeleton width={80} height={32} borderRadius={8} />
          <Skeleton width={60} height={16} borderRadius={4} style={{ marginTop: spacing.xs }} />
        </SkeletonSummaryItem>
        <SkeletonSummaryDivider />
        <SkeletonSummaryItem>
          <Skeleton width={80} height={32} borderRadius={8} />
          <Skeleton width={60} height={16} borderRadius={4} style={{ marginTop: spacing.xs }} />
        </SkeletonSummaryItem>
      </SkeletonSummaryRow>
      <SkeletonDifferenceRow>
        <Skeleton width={80} height={16} borderRadius={4} />
        <Skeleton width={60} height={20} borderRadius={4} />
      </SkeletonDifferenceRow>
    </SkeletonMonthSummaryCard>
  );
};

// Componente completo do skeleton do card de dia
export const DayCardSkeleton: React.FC = () => {
  return (
    <SkeletonDayCard>
      <SkeletonDayHeader>
        <Skeleton width={120} height={20} borderRadius={4} />
        <SkeletonDayHeaderRight>
          <Skeleton width={50} height={24} borderRadius={12} style={{ marginRight: spacing.sm }} />
          <Skeleton width={40} height={24} borderRadius={12} style={{ marginRight: spacing.sm }} />
          <Skeleton width={24} height={24} borderRadius={4} />
        </SkeletonDayHeaderRight>
      </SkeletonDayHeader>
    </SkeletonDayCard>
  );
};

// Componente principal do skeleton loader
export const HistorySkeletonLoader: React.FC = () => {
  return (
    <>
      <MonthSummarySkeleton />
      <DayCardSkeleton />
      <DayCardSkeleton />
      <DayCardSkeleton />
      <DayCardSkeleton />
      <DayCardSkeleton />
    </>
  );
};

