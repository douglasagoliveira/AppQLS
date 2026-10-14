import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  useFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
} from '@expo-google-fonts/urbanist';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { flushRfqOutbox } from '../services/supabaseService';
import { useProjectStore } from '../store/useProjectStore';
import '../../global.css';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
  });

  const { markRfqSent } = useProjectStore();

  useEffect(() => {
    // Flush any pending RFQ submissions in the outbox on launch
    flushRfqOutbox()
      .then((sentCodes: string[]) => {
        if (sentCodes && sentCodes.length > 0) {
          sentCodes.forEach((code) => markRfqSent(code));
        }
      })
      .catch(() => {});
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0e0e0e', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#d9b277" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0e0e0e" />
      {/* Golden QLS Accent Line (3px) at Top */}
      <LinearGradient
        colors={['#c9a84c', '#e8b86a', '#a8843a', '#c9a84c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 3, width: '100%', zIndex: 999 }}
      />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0e0e0e',
          },
          headerTintColor: '#f4f2ee',
          headerTitleStyle: {
            fontFamily: 'Urbanist_600SemiBold',
            fontSize: 17,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#0e0e0e',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="project/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="room/new"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="room/recommendation" options={{ headerShown: false }} />
        <Stack.Screen name="catalog/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
