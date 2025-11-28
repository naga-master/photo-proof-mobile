/**
 * Studio Group Layout
 * Tab-based navigation for studio users
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { useTheme } from '@/theme/ThemeProvider';
import { colors, spacing, typography } from '@/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function StudioLayout() {
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
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => getTabBarIcon(focused ? 'home' : 'home-outline', focused),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ focused }) => getTabBarIcon(focused ? 'folder' : 'folder-outline', focused),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ focused }) => getTabBarIcon(focused ? 'people' : 'people-outline', focused),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.uploadButton,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Ionicons name="cloud-upload" size={24} color={colors.white} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => getTabBarIcon(focused ? 'settings' : 'settings-outline', focused),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  uploadButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});
