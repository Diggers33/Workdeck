// Professional color palette for Resource Planner
export const colors = {
  // Text
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  // Backgrounds
  bgWhite: '#FFFFFF',
  bgSubtle: '#FAFBFC',
  bgHover: '#F8FAFC',
  bgSelected: '#EFF6FF',

  // Borders
  borderLight: '#F1F5F9',
  borderDefault: '#E2E8F0',

  // Status (muted versions)
  statusGreen: '#059669',
  statusAmber: '#D97706',
  statusRed: '#DC2626',
  statusGray: '#94A3B8',

  // Allocation bars (muted)
  barBlue: '#6366F1',
  barPurple: '#8B5CF6',
  barTeal: '#14B8A6',
  barOrange: '#F97316',
  barGreen: '#10B981',
};

// Typography
export const typography = {
  // Font sizes
  xs: '11px',
  sm: '12px',
  base: '13px',
  md: '14px',
  lg: '16px',
  xl: '18px',

  // Font weights
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,

  // Line heights
  lineHeightTight: 1.25,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.625,
};

// Spacing
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
};

// Border radius
export const radius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
};

// Capacity/Utilization colors
export const utilizationColors = {
  under: {
    bg: '#FFFFFF',
    border: '#E2E8F0',
    text: '#64748B',
  },
  optimal: {
    bg: '#ECFDF5',
    border: '#A7F3D0',
    text: '#059669',
  },
  warning: {
    bg: '#FFFBEB',
    border: '#FDE68A',
    text: '#D97706',
  },
  over: {
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#DC2626',
  },
};

// Get utilization color based on percentage
export const getUtilizationColor = (percent: number) => {
  if (percent > 100) return utilizationColors.over;
  if (percent >= 85) return utilizationColors.warning;
  if (percent >= 50) return utilizationColors.optimal;
  return utilizationColors.under;
};

// Project colors (professional palette)
export const projectColors = [
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#EAB308', // Yellow
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];
