/**
 * Login Screen
 * Supports studio and client login with biometrics
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useAuthStore, useBiometrics } from '@/stores/authStore';
import { useTheme } from '@/theme/ThemeProvider';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const {
    studioLogin,
    clientLogin,
    isLoading,
    error,
    clearError,
  } = useAuthStore();
  const { available: biometricsAvailable, enabled: biometricsEnabled, login: loginWithBiometrics } = useBiometrics();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isStudioLogin, setIsStudioLogin] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [username, password, isStudioLogin]);

  // Try biometric login on mount if enabled
  useEffect(() => {
    if (biometricsEnabled) {
      handleBiometricLogin();
    }
  }, [biometricsEnabled]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter your username and password',
      });
      return;
    }

    try {
      const credentials = {
        username: username.trim(),
        password: password,
      };

      if (isStudioLogin) {
        await studioLogin(credentials);
      } else {
        await clientLogin(credentials);
      }

      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: 'Login successful',
      });

      // Navigation is handled by NavigationGuard in _layout.tsx
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: err.detail || 'Invalid username or password',
      });
    }
  };

  const handleBiometricLogin = async () => {
    try {
      await loginWithBiometrics();
      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: 'Biometric login successful',
      });
    } catch (err: any) {
      if (err.message !== 'Biometric authentication failed') {
        Toast.show({
          type: 'info',
          text1: 'Session Expired',
          text2: 'Please login with your credentials',
        });
      }
    }
  };

  const styles = createStyles(theme, isDark);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo / Header */}
            <Animated.View entering={FadeIn.duration(600)} style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <Ionicons
                  name="camera"
                  size={64}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.appName}>Photo Proof</Text>
              <Text style={styles.tagline}>Professional Photo Management</Text>
            </Animated.View>

            {/* Title Section */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.titleSection}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </Animated.View>

            {/* Login Type Toggle */}
            <Animated.View entering={FadeInDown.delay(300)} style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Login as Studio</Text>
              <Switch
                value={isStudioLogin}
                onValueChange={setIsStudioLogin}
                trackColor={{ false: colors.neutral[300], true: theme.colors.primary }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.neutral[300]}
              />
            </Animated.View>

            {/* Form Section */}
            <Animated.View entering={FadeInDown.delay(400)} style={styles.form}>
              {/* Username Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.neutral[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your username"
                    placeholderTextColor={colors.neutral[400]}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.neutral[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.neutral[400]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={colors.neutral[400]}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Remember Me & Forgot Password */}
              <View style={styles.optionsRow}>
                <Pressable
                  style={styles.rememberMe}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={14} color={colors.white} />
                    )}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </Pressable>

                <Link href="/(auth)/forgot-password" asChild>
                  <Pressable>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </Pressable>
                </Link>
              </View>

              {/* Login Button */}
              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.buttonPressed,
                  isLoading && styles.buttonDisabled,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </Pressable>

              {/* Biometric Login */}
              {biometricsAvailable && (
                <Pressable
                  onPress={handleBiometricLogin}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.biometricButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Ionicons
                    name={Platform.OS === 'ios' ? 'finger-print' : 'finger-print'}
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.biometricButtonText}>
                    Sign in with {Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Biometrics'}
                  </Text>
                </Pressable>
              )}
            </Animated.View>

            {/* Sign Up Link */}
            <Animated.View entering={FadeInDown.delay(500)} style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </Pressable>
              </Link>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing[6],
      paddingBottom: spacing[10],
    },
    headerSection: {
      alignItems: 'center',
      marginTop: spacing[8],
      marginBottom: spacing[6],
    },
    logoContainer: {
      width: 100,
      height: 100,
      borderRadius: borderRadius['2xl'],
      backgroundColor: isDark ? colors.neutral[800] : colors.primary[50],
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[4],
    },
    appName: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    tagline: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: spacing[1],
    },
    titleSection: {
      marginBottom: spacing[6],
    },
    title: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: spacing[2],
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: theme.colors.textSecondary,
    },
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      padding: spacing[4],
      borderRadius: borderRadius.lg,
      marginBottom: spacing[6],
      ...shadows.sm,
    },
    toggleLabel: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.colors.text,
    },
    form: {
      marginBottom: spacing[6],
    },
    inputContainer: {
      marginBottom: spacing[4],
    },
    inputLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.colors.text,
      marginBottom: spacing[2],
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing[4],
      height: 56,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    inputIcon: {
      marginRight: spacing[3],
    },
    input: {
      flex: 1,
      fontSize: typography.fontSize.base,
      color: theme.colors.text,
    },
    eyeButton: {
      padding: spacing[1],
    },
    optionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[6],
    },
    rememberMe: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: borderRadius.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing[2],
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    rememberMeText: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    forgotPasswordText: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: typography.fontWeight.medium,
    },
    loginButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: spacing[4],
      borderRadius: borderRadius.full,
      alignItems: 'center',
      ...shadows.md,
    },
    loginButtonText: {
      color: colors.white,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
    },
    buttonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    biometricButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing[4],
      marginTop: spacing[4],
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: spacing[2],
    },
    biometricButtonText: {
      fontSize: typography.fontSize.base,
      color: theme.colors.primary,
      fontWeight: typography.fontWeight.medium,
    },
    signUpContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 'auto',
    },
    signUpText: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    signUpLink: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: typography.fontWeight.semibold,
    },
  });
