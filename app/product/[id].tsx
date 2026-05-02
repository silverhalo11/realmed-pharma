import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORY_COLORS } from '@/components/ProductCard';
import { getCatalogUrl, getUnit } from '@/constants/seedData';
import { useData } from '@/context/DataContext';
import { useColors } from '@/hooks/useColors';

export default function ProductDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products } = useData();

  const product = useMemo(() => products.find(p => p.id === id), [products, id]);

  if (!product) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Product not found</Text>
      </View>
    );
  }

  const catColor = CATEGORY_COLORS[product.category] ?? colors.primary;
  const catalogUrl = getCatalogUrl(product.catalogSlide);
  const unit = getUnit(product.category);

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 24) }]}>

      {catalogUrl ? (
        <TouchableOpacity onPress={() => router.push({ pathname: '/catalog', params: { slide: product.catalogSlide } })}>
          <Image
            source={{ uri: catalogUrl }}
            style={styles.catalogImage}
            contentFit="contain"
            placeholder={{ color: catColor + '18' }}
            transition={300}
          />
          <View style={[styles.viewCatalog, { backgroundColor: catColor + '18' }]}>
            <Feather name="book-open" size={14} color={catColor} />
            <Text style={[styles.viewCatalogText, { color: catColor, fontFamily: 'Inter_500Medium' }]}>View in Catalog (Slide {product.catalogSlide})</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      <View style={[styles.header, { backgroundColor: catColor + '10' }]}>
        <View style={[styles.badge, { backgroundColor: catColor + '18' }]}>
          <Text style={[styles.category, { color: catColor, fontFamily: 'Inter_600SemiBold' }]}>{product.category}</Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{product.name}</Text>
        <Text style={[styles.unit, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Unit: {unit}</Text>
      </View>

      <View style={styles.section}>
        <InfoBlock label="Composition" value={product.composition} colors={colors} />
        <InfoBlock label="Description" value={product.description} colors={colors} />
      </View>
    </ScrollView>
  );
}

function InfoBlock({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={[styles.infoBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 16 },
  content: { gap: 12 },
  catalogImage: { width: '100%', height: 220, backgroundColor: '#f0f9ff' },
  viewCatalog: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, justifyContent: 'center' },
  viewCatalogText: { fontSize: 13 },
  header: { padding: 20, gap: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  category: { fontSize: 13 },
  name: { fontSize: 22 },
  unit: { fontSize: 14 },
  section: { paddingHorizontal: 16, gap: 10 },
  infoBlock: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 6 },
  infoLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, lineHeight: 22 },
});
