/**
 * Forgot Password Screen
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { apiClient } from '@/services/api/client';
import { useTheme } from '@/theme/ThemeProvider';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';

export default function ForgotPasswordScreen() {
  const { theme, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Email Required',
        text2: 'Please enter your email address',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/api/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      setEmailSent(true);
      Toast.show({
        type: 'success',
        text1: 'Email Sent',
        text2: 'Check your inbox for reset instructions',
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Request Failed',
        text2: err.detail || 'Could not send reset email',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const styles = createStyles(theme, isDark);

  if (emailSent) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <SafeAreaView style={styles.container}>
          <View style={styles.successContainer}>
            <Animated.View entering={FadeIn} style={styles.successIcon}>
              <Ionicons name="mail-outline" size={64} color={theme.colors.primary} />
            </Animated.View>
            <Animated.Text entering={FadeInDown.delay(200)} style={styles.successTitle}>
              Check Your Email
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(300)} style={styles.successText}>
              We've sent password reset instructions to {email}
            </Animated.Text>
            <Animated.View entering={FadeInDown.delay(400)}>
              <Pressable
                onPress={() => router.replace('/(auth)/login')}
                style={({ pressed }) => [styles.backToLoginButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </Pressable>
            </Animated.View>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Header */}
            <Animated.View entering={FadeIn} style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
              </Pressable>
            </Animated.View>

            {/* Title */}
            <Animated.View entering={FadeInDown.delay(100)} style={styles.titleSection}>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you instructions to reset your password.
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={colors.neutral[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={colors.neutral[400]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <Pressable
                onPress={handleResetPassword}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.resetButton,
                  pressed && styles.buttonPressed,
                  isLoading && styles.buttonDisabled,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.resetButtonText}>Send Reset Link</Text>
                )}
              </Pressable>
            </Animated.View>
          </View>
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
    content: {
      flex: 1,
      paddingHorizontal: spacing[6],
    },
    header: {
      paddingVertical: spacing[4],
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleSection: {
      marginTop: spacing[4],
      marginBottom: spacing[8],
    },
    title: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: spacing[3],
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },
    form: {},
    inputContainer: {
      marginBottom: spacing[6],
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
    resetButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: spacing[4],
      borderRadius: borderRadius.full,
      alignItems: 'center',
      ...shadows.md,
    },
    resetButtonText: {
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
    // Success state
    successContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing[6],
    },
    successIcon: {
      width: 120,
      height: 120,
      borderRadius: borderRadius.full,
      backgroundColor: isDark ? colors.neutral[800] : colors.primary[50],
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[6],
    },
    successTitle: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: spacing[3],
      textAlign: 'center',
    },
    successText: {
      fontSize: typography.fontSize.base,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing[8],
      lineHeight: 24,
    },
    backToLoginButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[8],
      borderRadius: borderRadius.full,
      ...shadows.md,
    },
    backToLoginText: {
      color: colors.white,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
    },
  });
