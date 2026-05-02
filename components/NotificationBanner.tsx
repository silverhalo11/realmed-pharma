import Constants from 'expo-constants';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

// Skip expo-notifications entirely in Expo Go — it throws on Android SDK 53+
let Notifications: typeof import('expo-notifications') | null = null;
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo && Platform.OS !== 'web') {
  const _err = console.error;
  console.error = () => {};
  try { Notifications = require('expo-notifications'); } catch { Notifications = null; }
  finally { console.error = _err; }
}

interface BannerData { title: string; body: string; }

export function NotificationBanner() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [banner, setBanner] = useState<BannerData | null>(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(translateY, { toValue: -120, duration: 280, useNativeDriver: true })
      .start(() => setBanner(null));
  }, [translateY]);

  const show = useCallback((data: BannerData) => {
    setBanner(data);
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
    timerRef.current = setTimeout(() => dismiss(), 5000);
  }, [translateY, dismiss]);

  useEffect(() => {
    if (!Notifications) return;
    try {
      const sub = Notifications.addNotificationReceivedListener(n => {
        const { title, body } = n.request.content;
        if (title || body) show({ title: title ?? '🏥 Reminder', body: body ?? '' });
      });
      return () => sub.remove();
    } catch { return undefined; }
  }, [show]);

  if (!banner) return null;

  return (
    <Animated.View style={[styles.banner, {
      backgroundColor: colors.card,
      borderColor: colors.primary,
      top: insets.top + 8,
      transform: [{ translateY }],
    }]}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>🔔</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]} numberOfLines={1}>
          {banner.title}
        </Text>
        <Text style={[styles.body, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={2}>
          {banner.body}
        </Text>
      </View>
      <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={[styles.close, { color: colors.mutedForeground }]}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: { position: 'absolute', left: 16, right: 16, zIndex: 9999, borderRadius: 16, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0ea5e920', alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20 },
  content: { flex: 1 },
  title: { fontSize: 14, marginBottom: 2 },
  body: { fontSize: 12, lineHeight: 16 },
  close: { fontSize: 16, padding: 2 },
});
