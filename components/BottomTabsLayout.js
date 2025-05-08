// components/BottomTabsLayout.js
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '../src/theme/colors';
import { Platform } from 'react-native';

export default function BottomTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.primary,
          height: Platform.OS === 'ios' ? 90 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 8,
        },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            '../../selecao-patio': 'home',
            'mapa': 'map',
            'relatorios': 'analytics',
            'motos': 'bicycle',
            'configuracoes': 'settings',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="selecao-patio" options={{ title: 'Pátios' }} />
      <Tabs.Screen name="mapa" options={{ title: 'Mapa' }} />
      <Tabs.Screen name="relatorios" options={{ title: 'Relatórios' }} />
      <Tabs.Screen name="motos" options={{ title: 'Motos' }} />
      <Tabs.Screen name="configuracoes" options={{ title: 'Configurações' }} />
    </Tabs>
  );
}
