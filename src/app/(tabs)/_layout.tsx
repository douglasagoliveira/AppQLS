import React from 'react';
import { Tabs } from 'expo-router';
import { BottomNavBar } from '../../components/BottomNavBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNavBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#0e0e0e' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Projects' }} />
      <Tabs.Screen name="consultant" options={{ title: 'AI Consultant' }} />
      <Tabs.Screen name="catalog" options={{ title: 'Catalogue' }} />
      <Tabs.Screen name="profile" options={{ title: 'My Account' }} />
    </Tabs>
  );
}
