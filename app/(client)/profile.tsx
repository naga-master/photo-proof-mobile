/**
 * Profile Screen - Client Profile & Settings
 */

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useAuthStore, useBiometrics } from '@/stores/authStore';
import { useTheme } from '@/theme/ThemeProvider';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';

export default function ProfileScreen() {
  const { theme, isDark, setThemeMode, themeMode } = useTheme();
  const { user, logout } = useAuthStore();
  const { available: biometricsAvailable, enabled: biometricsEnabled, enable, disable } = useBiometrics();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleBiometricsToggle = async () => {
    try {
      if (biometricsEnabled) {
        await disable();
      } else {
        await enable(user?.username || '');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const styles = createStyles(theme, isDark);

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const ProfileItem = ({
    icon,
    label,
    value,
    onPress,
    showArrow = true,
    danger = false,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    danger?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.profileItem, pressed && styles.itemPressed]}
      disabled={!onPress}
    >
      <View style={[styles.itemIcon, danger && styles.itemIconDanger]}>
        <Ionicons
          name={icon as any}
          size={20}
          color={danger ? colors.error.main : theme.colors.primary}
        />
      </View>
      <Text style={[styles.itemLabel, danger && styles.itemLabelDanger]}>{label}</Text>
      {value && <Text style={styles.itemValue}>{value}</Text>}
      {showArrow && onPress && (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      )}
    </Pressable>
  );

  const ProfileToggle = ({
    icon,
    label,
    value,
    onValueChange,
    disabled = false,
  }: {
    icon: string;
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <View style={[styles.profileItem, disabled && styles.itemDisabled]}>
      <View style={styles.itemIcon}>
        <Ionicons name={icon as any} size={20} color={theme.colors.primary} />
      </View>
      <Text style={styles.itemLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.neutral[300], true: theme.colors.primary }}
        thumbColor={colors.white}
        disabled={disabled}
      />
    </View>
  );

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeIn} style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user?.name || 'G')}</Text>
            </View>
            <Text style={styles.profileName}>{user?.name || 'Guest'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Client</Text>
            </View>
          </Animated.View>

          {/* Account */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <ProfileSection title="Account">
              <ProfileItem
                icon="person-outline"
                label="Edit Profile"
                onPress={() => {}}
              />
              <ProfileItem
                icon="lock-closed-outline"
                label="Change Password"
                onPress={() => {}}
              />
            </ProfileSection>
          </Animated.View>

          {/* Appearance */}
          <Animated.View entering={FadeInDown.delay(300)}>
            <ProfileSection title="Appearance">
              <ProfileItem
                icon="moon-outline"
                label="Theme"
                value={themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light'}
                onPress={() => {
                  const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
                  const currentIndex = modes.indexOf(themeMode);
                  const nextMode = modes[(currentIndex + 1) % modes.length];
                  setThemeMode(nextMode);
                }}
              />
            </ProfileSection>
          </Animated.View>

          {/* Security */}
          <Animated.View entering={FadeInDown.delay(400)}>
            <ProfileSection title="Security">
              {biometricsAvailable && (
                <ProfileToggle
                  icon="finger-print"
                  label="Biometric Login"
                  value={biometricsEnabled}
                  onValueChange={handleBiometricsToggle}
                />
              )}
            </ProfileSection>
          </Animated.View>

          {/* Orders & Invoices */}
          <Animated.View entering={FadeInDown.delay(500)}>
            <ProfileSection title="Orders & Invoices">
              <ProfileItem
                icon="bag-outline"
                label="My Orders"
                onPress={() => router.push('/(common)/orders' as Href)}
              />
              <ProfileItem
                icon="receipt-outline"
                label="Invoices"
                onPress={() => router.push('/(common)/invoices' as Href)}
              />
            </ProfileSection>
          </Animated.View>

          {/* Support */}
          <Animated.View entering={FadeInDown.delay(600)}>
            <ProfileSection title="Support">
              <ProfileItem
                icon="help-circle-outline"
                label="Help Center"
                onPress={() => {}}
              />
              <ProfileItem
                icon="chatbubble-outline"
                label="Contact Studio"
                onPress={() => {}}
              />
              <ProfileItem
                icon="shield-outline"
                label="Privacy Policy"
                onPress={() => {}}
              />
            </ProfileSection>
          </Animated.View>

          {/* Logout */}
          <Animated.View entering={FadeInDown.delay(700)}>
            <ProfileSection title="">
              <ProfileItem
                icon="log-out-outline"
                label="Logout"
                onPress={handleLogout}
                showArrow={false}
                danger
              />
            </ProfileSection>
          </Animated.View>

          {/* Version */}
          <Text style={styles.versionText}>Photo Proof v2.0.0</Text>

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[4],
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    scrollContent: {
      padding: spacing[6],
    },
    profileCard: {
      alignItems: 'center',
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.xl,
      paddingVertical: spacing[8],
      paddingHorizontal: spacing[6],
      marginBottom: spacing[6],
      ...shadows.sm,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.full,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[4],
    },
    avatarText: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    profileName: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    profileEmail: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: spacing[1],
    },
    roleBadge: {
      backgroundColor: theme.colors.primary + '15',
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1.5],
      borderRadius: borderRadius.full,
      marginTop: spacing[3],
    },
    roleText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.colors.primary,
    },
    section: {
      marginBottom: spacing[6],
    },
    sectionTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.textSecondary,
      marginBottom: spacing[2],
      paddingHorizontal: spacing[1],
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sectionContent: {
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      ...shadows.sm,
    },
    profileItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    itemPressed: {
      backgroundColor: theme.colors.primary + '08',
    },
    itemDisabled: {
      opacity: 0.5,
    },
    itemIcon: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.lg,
      backgroundColor: theme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing[3],
    },
    itemIconDanger: {
      backgroundColor: colors.error.light + '30',
    },
    itemLabel: {
      flex: 1,
      fontSize: typography.fontSize.base,
      color: theme.colors.text,
    },
    itemLabelDanger: {
      color: colors.error.main,
    },
    itemValue: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginRight: spacing[2],
    },
    versionText: {
      textAlign: 'center',
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: spacing[2],
    },
  });
