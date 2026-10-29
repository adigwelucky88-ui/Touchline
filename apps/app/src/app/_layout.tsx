import '@/i18n';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { colors } from '@touchline/ui';
import { DarkTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppShell } from '@/components/app-shell';
import { RepositoryProvider } from '@/data/repositories/provider';

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.canvas, card: colors.canvas, primary: colors.accent },
};

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } }));

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider>
          <ThemeProvider value={theme}>
            <StatusBar style="light" />
            <AppShell />
          </ThemeProvider>
        </RepositoryProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
