import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useContext } from 'react';
import { ThemeContext } from '../../src/context/ThemeContext';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { temaEscuro, idioma } = useContext(ThemeContext);

  // Definindo cores dinâmicas pelo tema
  const colors = {
    primary: temaEscuro ? '#2563eb' : '#007bff',
    secondary: temaEscuro ? '#aaa' : '#666',
    background: temaEscuro ? '#1f2937' : '#f2f2f2',
  };

  const extraSpace = 10;

  // Traduções simples para exemplo
  const traducoes = {
    pt: { patios: 'Pátios', relatorios: 'Relatórios', motos: 'Motos', configuracoes: 'Configurações' },
    en: { patios: 'Yards', relatorios: 'Reports', motos: 'Bikes', configuracoes: 'Settings' },
    es: { patios: 'Patios', relatorios: 'Informes', motos: 'Motos', configuracoes: 'Configuración' },
  };

  const t = (key) => traducoes[idioma][key] || key;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.primary,
          height: 45 + insets.bottom + extraSpace,
          paddingBottom: insets.bottom + extraSpace,
          paddingTop: 10,
        },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            'selecao-patio': 'home',
            relatorios: 'analytics',
            motos: 'bicycle',
            configuracoes: 'settings',
            mapa: 'map',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="selecao-patio" options={{ title: t('patios') }} />
      <Tabs.Screen name="relatorios" options={{ title: t('relatorios') }} />
      <Tabs.Screen name="motos" options={{ title: t('motos') }} />
      <Tabs.Screen name="configuracoes" options={{ title: t('configuracoes') }} />
    </Tabs>
  );
}
