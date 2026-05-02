import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationBanner } from "@/components/NotificationBanner";
import { DataProvider } from "@/context/DataContext";
import { setupNotificationHandler } from "@/utils/notifications";

setupNotificationHandler();

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const LOCAL_USER_ID = "local_user";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Feather: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <DataProvider userId={LOCAL_USER_ID}>
                <NotificationBanner />
                <Stack
                  screenOptions={{
                    headerBackTitle: "Back",
                    headerStyle: { backgroundColor: "#ffffff" },
                    headerTintColor: "#0ea5e9",
                    headerTitleStyle: {
                      fontFamily: "Inter_600SemiBold",
                      color: "#0c4a6e",
                    },
                  }}
                >
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="doctor/new" options={{ title: "Add Doctor" }} />
                  <Stack.Screen name="doctor/[id]" options={{ title: "Doctor" }} />
                  <Stack.Screen name="doctor/edit/[id]" options={{ title: "Edit Doctor" }} />
                  <Stack.Screen name="product/[id]" options={{ title: "Product Details" }} />
                  <Stack.Screen
                    name="catalog"
                    options={{
                      title: "Product Catalog",
                      headerStyle: { backgroundColor: "#000" },
                      headerTintColor: "#fff",
                      headerTitleStyle: {
                        fontFamily: "Inter_600SemiBold",
                        color: "#fff",
                      },
                    }}
                  />
                  <Stack.Screen name="orders" options={{ title: "Orders" }} />
                  <Stack.Screen name="order/new" options={{ title: "New Order" }} />
                </Stack>
              </DataProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
