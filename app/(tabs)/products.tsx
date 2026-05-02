import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { ProductFormModal } from '@/components/ProductFormModal';
import { SearchBar } from '@/components/SearchBar';
import { CATEGORIES } from '@/constants/seedData';
import { useData } from '@/context/DataContext';
import { useColors } from '@/hooks/useColors';
import { Product } from '@/types';

export default function ProductsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products, addProduct } = useData();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() =>
    products.filter(p => {
      const matchCat = category === 'All' || p.category === category;
      const matchQ = p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.composition.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    }).sort((a, b) => a.name.localeCompare(b.name)),
    [products, query, category]
  );

  const webTop = Platform.OS === 'web' ? 67 : 0;

  async function handleAdd(data: Omit<Product, 'id' | 'userId' | 'isSeeded'>) {
    await addProduct(data);
    setShowForm(false);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => router.push(`/product/${item.id}` as any)} />
        )}
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: insets.top + webTop + 16 }]}>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Search products..." />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cats} contentContainerStyle={styles.catsContent}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, { backgroundColor: category === cat ? colors.primary : colors.card, borderColor: category === cat ? colors.primary : colors.border }]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catText, { color: category === cat ? '#fff' : colors.foreground, fontFamily: 'Inter_500Medium' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.catalogBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/catalog')}
            >
              <Text style={styles.catalogEmoji}>📖</Text>
              <Text style={[styles.catalogText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>View Full Product Catalog</Text>
              <Text style={[styles.catalogArrow, { color: colors.primary }]}>›</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="📦" title="No products found" subtitle="Try a different search or category" />
        }
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 84 : 100) }]}
        scrollEnabled={!!filtered.length || !!query}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + (Platform.OS === 'web' ? 84 : 80) }]}
        onPress={() => setShowForm(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>

      <ProductFormModal
        visible={showForm}
        onSave={handleAdd}
        onClose={() => setShowForm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 16 },
  header: { paddingBottom: 8 },
  cats: { marginBottom: 10 },
  catsContent: { gap: 8, paddingRight: 4 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  catText: { fontSize: 13 },
  catalogBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  catalogEmoji: { fontSize: 18 },
  catalogText: { flex: 1, fontSize: 14 },
  catalogArrow: { fontSize: 22, lineHeight: 26 },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: { color: '#fff', fontSize: 28, lineHeight: 32, marginTop: -2 },
});
