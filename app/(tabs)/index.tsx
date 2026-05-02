import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatCard } from '@/components/StatCard';
import { useData } from '@/context/DataContext';
import { useColors } from '@/hooks/useColors';

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { doctors, products, orders, visits, reminders } = useData();

  const todayVisits = visits.filter(v => {
    const d = new Date(v.date);
    return d.toDateString() === new Date().toDateString();
  });
  const pendingReminders = reminders.filter(r => !r.done);

  const stats = [
    { label: 'Doctors', value: doctors.length, emoji: '👥', color: '#0ea5e9', route: '/(tabs)/doctors' },
    { label: 'Products', value: products.length, emoji: '📦', color: '#8b5cf6', route: '/(tabs)/products' },
    { label: 'Orders', value: orders.length, emoji: '🛍️', color: '#f59e0b', route: '/orders' },
    { label: "Today's Visits", value: todayVisits.length, emoji: '📍', color: '#22c55e', route: '/(tabs)/visits' },
    { label: 'Reminders', value: pendingReminders.length, emoji: '🔔', color: '#ef4444', route: '/(tabs)/reminders' },
  ];

  const webTop = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={['#0ea5e9', '#0284c7']} style={[styles.topBar, { paddingTop: insets.top + webTop + 16 }]}>
        <Text style={[styles.greeting, { fontFamily: 'Inter_400Regular' }]}>Good {getGreeting()}</Text>
        <Text style={[styles.appName, { fontFamily: 'Inter_700Bold' }]}>RealMed Pharma</Text>
        <Text style={[styles.tagline, { fontFamily: 'Inter_400Regular' }]}>Serving & Preserving Eye Health</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 84 : 100) }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Overview</Text>
        <View style={styles.statsGrid}>
          {stats.map(stat => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              color={stat.color}
              emoji={stat.emoji}
              onPress={() => router.push(stat.route as any)}
            />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold', marginTop: 8 }]}>Quick Actions</Text>
        <View style={styles.actions}>
          {[
            { label: 'Add Doctor', emoji: '👤', route: '/doctor/new', color: '#0ea5e9' },
            { label: 'New Order', emoji: '🛒', route: '/order/new', color: '#f59e0b' },
            { label: 'Add Visit', emoji: '📅', route: '/(tabs)/visits', color: '#22c55e' },
            { label: 'Product Catalog', emoji: '📖', route: '/catalog', color: '#8b5cf6' },
          ].map(action => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
              </View>
              <Text style={[styles.actionLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingBottom: 24 },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  appName: { fontSize: 26, color: '#fff', marginTop: 2 },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  content: { padding: 20, gap: 14 },
  sectionTitle: { fontSize: 18 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: { borderWidth: 1, borderRadius: 14, padding: 16, alignItems: 'center', gap: 8, flex: 1, minWidth: 140 },
  actionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionEmoji: { fontSize: 24 },
  actionLabel: { fontSize: 14, textAlign: 'center' },
});
