import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { haptics } from '@/utils/haptics';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#667EEA',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#FFFFFF',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarBackground: () => 
          Platform.OS === 'ios' ? (
            <BlurView
              tint="light"
              intensity={95}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          ) : (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#FFFFFF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 10,
              }}
            />
          ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
      screenListeners={{
        tabPress: () => {
          // Haptic feedback on tab press
          haptics.impact('light');
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={size} 
                color={color} 
              />
              {focused && (
                <View style={{
                  position: 'absolute',
                  top: -8,
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: '#667EEA',
                }} />
              )}
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons 
                name={focused ? "images" : "images-outline"} 
                size={size} 
                color={color} 
              />
              {focused && (
                <View style={{
                  position: 'absolute',
                  top: -8,
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: '#667EEA',
                }} />
              )}
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: focused ? '#667EEA' : '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              shadowColor: focused ? '#667EEA' : '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: focused ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}>
              <Ionicons 
                name="add" 
                size={32} 
                color={focused ? '#FFFFFF' : '#6B7280'} 
              />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Contracts',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons 
                name={focused ? "document-text" : "document-text-outline"} 
                size={size} 
                color={color} 
              />
              {focused && (
                <View style={{
                  position: 'absolute',
                  top: -8,
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: '#667EEA',
                }} />
              )}
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons 
                name={focused ? "person" : "person-outline"} 
                size={size} 
                color={color} 
              />
              {focused && (
                <View style={{
                  position: 'absolute',
                  top: -8,
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: '#667EEA',
                }} />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
