import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DoctorCard } from '@/components/DoctorCard';
import { EmptyState } from '@/components/EmptyState';
import { SearchBar } from '@/components/SearchBar';
import { useData } from '@/context/DataContext';
import { useColors } from '@/hooks/useColors';

export default function DoctorsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { doctors } = useData();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() =>
    doctors.filter(d =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.specialty.toLowerCase().includes(query.toLowerCase()) ||
      d.clinic.toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name)),
    [doctors, query]
  );

  const webTop = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={filtered}
        keyExtractor={d => d.id}
        renderItem={({ item }) => (
          <DoctorCard doctor={item} onPress={() => router.push(`/doctor/${item.id}` as any)} />
        )}
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: insets.top + webTop + 16 }]}>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Search doctors..." />
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="👥" title="No doctors yet" subtitle="Add your first doctor to get started" />
        }
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 84 : 100) }]}
        scrollEnabled={!!filtered.length || !!query}
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + (Platform.OS === 'web' ? 84 : 96) }]}
        onPress={() => router.push('/doctor/new')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 16 },
  header: { paddingBottom: 4 },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 34 },
});
