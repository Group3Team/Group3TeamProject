import { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from './theme.js';

const STORAGE_KEY = 'color-mode';

const ColorModeContext = createContext({ mode: 'light', toggle: () => {} });

export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'light';
    } catch {
      return 'light';
    }
  });

  const value = useMemo(
    () => ({
      mode,
      toggle: () =>
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light';
          try {
            localStorage.setItem(STORAGE_KEY, next);
          } catch {
            /* ignore */
          }
          return next;
        }),
    }),
    [mode],
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export const useColorMode = () => useContext(ColorModeContext);
