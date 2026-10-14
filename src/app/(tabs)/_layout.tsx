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
      <Tabs.Screen name="index" options={{ title: 'Projetos' }} />
      <Tabs.Screen name="consultant" options={{ title: 'Consultor IA' }} />
      <Tabs.Screen name="catalog" options={{ title: 'Catálogo' }} />
      <Tabs.Screen name="profile" options={{ title: 'Minha Conta' }} />
    </Tabs>
  );
}
