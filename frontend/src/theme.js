import { createTheme } from '@mui/material/styles';

const lightPalette = {
  mode: 'light',
  primary: {
    main: '#357179',
    light: '#6BA8AF',
    dark: '#234D54',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FFC107',
    light: '#FFD75A',
    dark: '#C79100',
    contrastText: '#1A2D2E',
  },
  background: {
    default: '#FAFAF7',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1A2D2E',
    secondary: '#5C6B6C',
    disabled: '#A8B0B1',
  },
  error: { main: '#D64545' },
  warning: { main: '#E07A1F' },
  success: { main: '#2D8A6E' },
  info: { main: '#4A8A93' },
  divider: 'rgba(26, 45, 46, 0.08)',
};

const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#6BA8AF',
    light: '#9CCBD0',
    dark: '#357179',
    contrastText: '#0E1819',
  },
  secondary: {
    main: '#FFC107',
    light: '#FFD75A',
    dark: '#C79100',
    contrastText: '#1A2D2E',
  },
  background: {
    default: '#0E1819',
    paper: '#1A2628',
  },
  text: {
    primary: '#F5F2EA',
    secondary: '#9DAAAB',
    disabled: '#5C6B6C',
  },
  error: { main: '#E5736C' },
  warning: { main: '#F5A164' },
  success: { main: '#5DBE9F' },
  info: { main: '#7AB7BF' },
  divider: 'rgba(245, 242, 234, 0.1)',
};

const baseTypography = {
  fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif',
  h1: { fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.02em', lineHeight: 1.2 },
  h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em', lineHeight: 1.25 },
  h3: { fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.01em', lineHeight: 1.3 },
  h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.35 },
  h5: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
  h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
  body1: { fontSize: '1rem', lineHeight: 1.6 },
  body2: { fontSize: '0.875rem', lineHeight: 1.55 },
  button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
};

const baseComponents = {
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: { borderRadius: 10, paddingInline: 18, paddingBlock: 9 },
    },
  },
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 14,
        border: `0.5px solid ${theme.palette.divider}`,
      }),
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 8, fontWeight: 500 },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: { borderRadius: 10 },
    },
  },
  MuiPaper: {
    styleOverrides: {
      rounded: { borderRadius: 12 },
    },
  },
};

export const createAppTheme = (mode = 'light') =>
  createTheme({
    palette: mode === 'dark' ? darkPalette : lightPalette,
    typography: baseTypography,
    shape: { borderRadius: 12 },
    components: baseComponents,
  });
