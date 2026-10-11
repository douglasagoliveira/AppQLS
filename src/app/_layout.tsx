import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#09090b" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#09090b',
          },
          headerTintColor: '#f4f4f5',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#09090b',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'QLS Lighting',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="project/[id]"
          options={{
            title: 'Project Overview',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="room/new"
          options={{
            title: 'Add Room & Dimensions',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="room/recommendation"
          options={{
            title: 'Lighting Recommendations',
            headerBackTitle: 'Dimensions',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'My RFQ Account',
            presentation: 'modal',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
