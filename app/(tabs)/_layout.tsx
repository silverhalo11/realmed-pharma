import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, View, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  index:     { active: '🏠', inactive: '🏠' },
  doctors:   { active: '👥', inactive: '👥' },
  products:  { active: '📦', inactive: '📦' },
  visits:    { active: '📅', inactive: '📅' },
  reminders: { active: '🔔', inactive: '🔔' },
};

export default function TabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBar }]} />
          ) : null,
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>{TAB_ICONS.index[focused ? 'active' : 'inactive']}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: "Doctors",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>{TAB_ICONS.doctors[focused ? 'active' : 'inactive']}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>{TAB_ICONS.products[focused ? 'active' : 'inactive']}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="visits"
        options={{
          title: "Visits",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>{TAB_ICONS.visits[focused ? 'active' : 'inactive']}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: "Reminders",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>{TAB_ICONS.reminders[focused ? 'active' : 'inactive']}</Text>
          ),
        }}
      />
    </Tabs>
  );
}
