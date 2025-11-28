/**
 * Client Group Layout
 * Tab-based navigation for client users
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

import { useTheme } from '@/theme/ThemeProvider';
import { spacing, typography } from '@/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function ClientLayout() {
  const { theme, isDark } = useTheme();

  const getTabBarIcon = (name: IconName, focused: boolean) => (
    <Ionicons
      name={name}
      size={24}
      color={focused ? theme.colors.primary : theme.colors.textSecondary}
    />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
        },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isDark ? 'rgba(23, 23, 23, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: spacing[2],
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={100}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="albums"
        options={{
          title: 'Albums',
          tabBarIcon: ({ focused }) => getTabBarIcon(focused ? 'albums' : 'albums-outline', focused),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ focused }) => getTabBarIcon(focused ? 'heart' : 'heart-outline', focused),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: 'Store',
          tabBarIcon: ({ focused }) => getTabBarIcon(focused ? 'storefront' : 'storefront-outline', focused),
        }}
      />
      <Tabs.Screen
        name="contracts"
        options={{
          title: 'Contracts',
          tabBarIcon: ({ focused }) => getTabBarIcon(focused ? 'document-text' : 'document-text-outline', focused),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => getTabBarIcon(focused ? 'person' : 'person-outline', focused),
        }}
      />
    </Tabs>
  );
}
