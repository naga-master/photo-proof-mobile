/**
 * Theme Provider with Multi-Tenant Branding Support
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { MMKV } from 'react-native-mmkv';

import {
  Theme,
  lightTheme,
  darkTheme,
  createStudioTheme,
} from './index';
import { apiClient } from '../services/api/client';
import { useAuthStore } from '../stores/authStore';

// Storage for theme preferences
const storage = new MMKV({ id: 'theme-storage' });

// Theme mode type
type ThemeMode = 'light' | 'dark' | 'system';

// Theme context type
interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  isLoading: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  refreshBranding: () => Promise<void>;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Storage keys
const THEME_MODE_KEY = 'theme_mode';

// Props
interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { user, isAuthenticated } = useAuthStore();

  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [studioBranding, setStudioBranding] = useState<Theme['branding']>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme mode
  useEffect(() => {
    const savedMode = storage.getString(THEME_MODE_KEY) as ThemeMode | undefined;
    if (savedMode) {
      setThemeModeState(savedMode);
    }
    setIsLoading(false);
  }, []);

  // Fetch studio branding when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.studio_id) {
      fetchStudioBranding(user.studio_id);
    } else {
      setStudioBranding({});
    }
  }, [isAuthenticated, user?.studio_id]);

  // Fetch studio branding from API
  const fetchStudioBranding = async (studioId: string) => {
    try {
      const response = await apiClient.get<{
        logo?: string;
        studio_name?: string;
        brand_color?: string;
        secondary_color?: string;
      }>(`/api/studio/${studioId}/branding`);

      setStudioBranding({
        logo: response.logo,
        studioName: response.studio_name,
        customPrimary: response.brand_color,
        customSecondary: response.secondary_color,
      });

      console.log('[ThemeProvider] Studio branding loaded:', response.studio_name);
    } catch (error) {
      console.warn('[ThemeProvider] Failed to fetch studio branding:', error);
      // Keep default branding on error
    }
  };

  // Set theme mode with persistence
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    storage.set(THEME_MODE_KEY, mode);
    console.log('[ThemeProvider] Theme mode changed:', mode);
  };

  // Refresh branding
  const refreshBranding = async () => {
    if (user?.studio_id) {
      await fetchStudioBranding(user.studio_id);
    }
  };

  // Determine if dark mode
  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  // Build final theme
  const theme = useMemo(() => {
    const baseTheme = isDark ? darkTheme : lightTheme;
    
    // Apply studio branding if available
    if (Object.keys(studioBranding).length > 0) {
      return createStudioTheme(baseTheme, studioBranding);
    }
    
    return baseTheme;
  }, [isDark, studioBranding]);

  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    isDark,
    isLoading,
    setThemeMode,
    refreshBranding,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for quick access to theme colors
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

// Hook for quick access to spacing
export const useSpacing = () => {
  const { theme } = useTheme();
  return theme.spacing;
};

// Hook for styled components
export const useThemedStyles = <T extends Record<string, any>>(
  styleFactory: (theme: Theme) => T
): T => {
  const { theme } = useTheme();
  return useMemo(() => styleFactory(theme), [theme, styleFactory]);
};
