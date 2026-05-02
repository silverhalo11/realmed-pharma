import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '@/context/DataContext';
import { useColors } from '@/hooks/useColors';
import { Product } from '@/types';

export default function DoctorDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { doctors, products, orders, visits, deleteDoctor } = useData();

  const doctor = useMemo(() => doctors.find(d => d.id === id), [doctors, id]);
  const doctorOrders = useMemo(() => orders.filter(o => o.doctorId === id), [orders, id]);
  const doctorVisits = useMemo(() => visits.filter(v => v.doctorId === id), [visits, id]);
  const prescribedProducts = useMemo(() =>
    (doctor?.prescribedProducts ?? [])
      .map(pid => products.find(p => p.id === pid))
      .filter(Boolean) as Product[],
    [doctor, products]
  );

  const [tab, setTab] = useState<'info' | 'orders' | 'visits'>('info');

  if (!doctor) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Doctor not found</Text>
      </View>
    );
  }

  function handleDelete() {
    Alert.alert('Delete Doctor', `Remove Dr. ${doctor!.name}? This cannot be undone.`, [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          deleteDoctor(doctor!.id);
          router.back();
        }
      },
    ]);
  }

  const infoRows = [
    { emoji: '🎓', label: 'Degree', value: doctor.degree },
    { emoji: '🏥', label: 'Clinic', value: doctor.clinic },
    { emoji: '📞', label: 'Phone', value: doctor.phone },
    { emoji: '🗺️', label: 'Address', value: doctor.address },
    { emoji: '💊', label: 'Specialty', value: doctor.specialty },
    { emoji: '🏪', label: 'Medical Store', value: doctor.medicalStore },
    { emoji: '📅', label: 'Date of Birth', value: doctor.dob },
    { emoji: '📝', label: 'Notes', value: doctor.notes },
  ].filter(r => r.value);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 24) }]}>
        <View style={[styles.hero, { backgroundColor: colors.primary + '10' }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
              {doctor.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Dr. {doctor.name}</Text>
          {doctor.degree ? <Text style={[styles.degree, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>{doctor.degree}</Text> : null}
          {doctor.specialty ? <Text style={[styles.specialty, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{doctor.specialty}</Text> : null}

          <View style={styles.heroActions}>
            <TouchableOpacity style={[styles.heroBtn, { backgroundColor: colors.primary }]} onPress={() => router.push(`/doctor/edit/${id}` as any)}>
              <Text style={styles.heroBtnEmoji}>✏️</Text>
              <Text style={[styles.heroBtnText, { fontFamily: 'Inter_500Medium' }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.heroBtn, { backgroundColor: colors.accent }]} onPress={() => router.push({ pathname: '/order/new', params: { doctorId: id, doctorName: doctor.name } })}>
              <Text style={styles.heroBtnEmoji}>🛒</Text>
              <Text style={[styles.heroBtnText, { fontFamily: 'Inter_500Medium' }]}>Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.heroBtn, { backgroundColor: colors.destructive }]} onPress={handleDelete}>
              <Text style={styles.heroBtnEmoji}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
          {(['info', 'orders', 'visits'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && { backgroundColor: colors.card }]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground, fontFamily: tab === t ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'info' && (
          <View style={styles.section}>
            {infoRows.map(({ emoji, label, value }) => (
              <View key={label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primary + '12' }]}>
                  <Text style={styles.infoEmoji}>{emoji}</Text>
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{label}</Text>
                  <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{value}</Text>
                </View>
              </View>
            ))}
            {prescribedProducts.length > 0 && (
              <View style={[styles.infoRow, { borderBottomColor: colors.border, alignItems: 'flex-start' }]}>
                <View style={[styles.infoIcon, { backgroundColor: colors.accent + '18' }]}>
                  <Text style={styles.infoEmoji}>📦</Text>
                </View>
                <View style={[styles.infoContent, { gap: 6 }]}>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Prescribed Products</Text>
                  {prescribedProducts.map(p => (
                    <View key={p.id} style={[styles.prescribedRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.prescribedName, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{p.name}</Text>
                        <Text style={[styles.prescribedCat, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{p.category}</Text>
                      </View>
                      {p.catalogSlide > 0 && (
                        <TouchableOpacity
                          style={[styles.catalogBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' }]}
                          onPress={() => router.push({ pathname: '/catalog', params: { slide: p.catalogSlide.toString() } })}
                        >
                          <Text style={[styles.catalogBtnText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>📖 Catalogue</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {tab === 'orders' && (
          <View style={styles.section}>
            {doctorOrders.length === 0 ? (
              <Text style={[styles.empty, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>No orders for this doctor</Text>
            ) : doctorOrders.map(order => (
              <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.orderDate, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  📅 {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
                {order.items.map((item, i) => (
                  <Text key={i} style={[styles.orderItem, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
                    • {item.productName} — {item.quantity} {item.unit}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {tab === 'visits' && (
          <View style={styles.section}>
            {doctorVisits.length === 0 ? (
              <Text style={[styles.empty, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>No visits for this doctor</Text>
            ) : doctorVisits.map(visit => (
              <View key={visit.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: visit.completed ? colors.success + '40' : colors.border }]}>
                <Text style={[styles.orderDate, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  📅 {new Date(visit.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
                <Text style={[styles.visitStatus, { color: visit.completed ? colors.success : colors.accent, fontFamily: 'Inter_500Medium' }]}>
                  {visit.completed ? '✅ Completed' : '🕐 Scheduled'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 16 },
  content: { gap: 16 },
  hero: { padding: 24, alignItems: 'center', gap: 6 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarText: { fontSize: 32 },
  name: { fontSize: 22 },
  degree: { fontSize: 15 },
  specialty: { fontSize: 14 },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  heroBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  heroBtnEmoji: { fontSize: 16 },
  heroBtnText: { fontSize: 14, color: '#fff' },
  tabs: { flexDirection: 'row', borderRadius: 12, padding: 4, marginHorizontal: 16 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabText: { fontSize: 14 },
  section: { paddingHorizontal: 16, gap: 8 },
  infoRow: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: 1, alignItems: 'flex-start' },
  infoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoEmoji: { fontSize: 18 },
  infoContent: { flex: 1, gap: 2 },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 14 },
  empty: { fontSize: 14, textAlign: 'center', paddingVertical: 24 },
  orderCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  orderDate: { fontSize: 12 },
  orderItem: { fontSize: 13 },
  visitStatus: { fontSize: 13 },
  prescribedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, padding: 8 },
  prescribedName: { fontSize: 13 },
  prescribedCat: { fontSize: 11 },
  catalogBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  catalogBtnText: { fontSize: 11 },
});
