// Patch file - use these styled components

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
