import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  const MenuItem = ({ icon, title, onPress, isLast = false }: any) => (
    <Pressable 
      style={[styles.menuItem, isLast && styles.menuItemLast]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={24} color="#667EEA" />
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            <MenuItem icon="person-outline" title="Edit Profile" />
            <MenuItem icon="lock-closed-outline" title="Change Password" />
            <MenuItem icon="notifications-outline" title="Notifications" isLast />
          </View>
        </View>

        {user?.role === 'studio' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Studio</Text>
            <View style={styles.menuContainer}>
              <MenuItem 
                icon="people-outline" 
                title="Clients" 
                onPress={() => router.push('/clients')}
              />
              <MenuItem icon="analytics-outline" title="Analytics" />
              <MenuItem icon="color-palette-outline" title="Branding" isLast />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuContainer}>
            <MenuItem icon="moon-outline" title="Appearance" />
            <MenuItem icon="language-outline" title="Language" />
            <MenuItem icon="download-outline" title="Downloads" isLast />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuContainer}>
            <MenuItem icon="help-circle-outline" title="Help Center" />
            <MenuItem icon="document-text-outline" title="Terms & Privacy" />
            <MenuItem icon="information-circle-outline" title="About" isLast />
          </View>
        </View>

        {/* Logout Button */}
        <Pressable 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667EEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 24,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuContainer: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    borderRadius: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 100,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
