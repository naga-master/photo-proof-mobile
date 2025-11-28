/**
 * Register Screen
 * Studio registration flow
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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { apiClient } from '@/services/api/client';
import { useTheme } from '@/theme/ThemeProvider';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';

export default function RegisterScreen() {
  const { theme, isDark } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studioName, setStudioName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!name.trim() || !email.trim() || !studioName.trim() || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill in all fields',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match',
      });
      return;
    }

    if (password.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 8 characters',
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/api/auth/studio/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        studio_name: studioName.trim(),
        password,
      });

      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Please login with your credentials',
      });

      router.replace('/(auth)/login');
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: err.detail || 'Could not create account',
      });
    } finally {
      setIsLoading(false);
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
            {/* Header */}
            <Animated.View entering={FadeIn} style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
              </Pressable>
            </Animated.View>

            {/* Title */}
            <Animated.View entering={FadeInDown.delay(100)} style={styles.titleSection}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Register your photography studio</Text>
            </Animated.View>

            {/* Form */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>
              {/* Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={colors.neutral[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your full name"
                    placeholderTextColor={colors.neutral[400]}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
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

              {/* Studio Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Studio Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="camera-outline" size={20} color={colors.neutral[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your studio name"
                    placeholderTextColor={colors.neutral[400]}
                    value={studioName}
                    onChangeText={setStudioName}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.neutral[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Minimum 8 characters"
                    placeholderTextColor={colors.neutral[400]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={colors.neutral[400]}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.neutral[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.neutral[400]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Register Button */}
              <Pressable
                onPress={handleRegister}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.registerButton,
                  pressed && styles.buttonPressed,
                  isLoading && styles.buttonDisabled,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </Pressable>
            </Animated.View>

            {/* Login Link */}
            <Animated.View entering={FadeInDown.delay(300)} style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text style={styles.loginLink}>Sign In</Text>
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
    registerButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: spacing[4],
      borderRadius: borderRadius.full,
      alignItems: 'center',
      marginTop: spacing[4],
      ...shadows.md,
    },
    registerButtonText: {
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
    loginContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 'auto',
    },
    loginText: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    loginLink: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: typography.fontWeight.semibold,
    },
  });
