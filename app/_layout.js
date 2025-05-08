import { Stack, usePathname } from 'expo-router';

export default function RootLayout() {
  const pathname = usePathname();

  const semTabs = pathname === '/' || pathname === '/index' || pathname === '/patio-config';

  return (
    <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName={semTabs ? 'index' : undefined}
    />
  );
}
