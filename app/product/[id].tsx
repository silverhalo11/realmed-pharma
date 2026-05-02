import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORY_COLORS } from '@/components/ProductCard';
import { ProductFormModal } from '@/components/ProductFormModal';
import { getCatalogUrl, getUnit } from '@/constants/seedData';
import { useData } from '@/context/DataContext';
import { useColors } from '@/hooks/useColors';
import { Product } from '@/types';

export default function ProductDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, updateProduct, deleteProduct } = useData();
  const [showEdit, setShowEdit] = useState(false);

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
  const displayImageUri = product.imageUri ?? catalogUrl;

  async function handleUpdate(data: Omit<Product, 'id' | 'userId' | 'isSeeded'>) {
    await updateProduct(product.id, data);
    setShowEdit(false);
  }

  function confirmDelete() {
    Alert.alert(
      'Delete Product',
      `Remove "${product.name}" from your product list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(product.id);
            router.back();
          },
        },
      ]
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.root, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 24) }]}
      >
        {/* Image — custom upload takes priority over catalog slide */}
        {displayImageUri ? (
          <TouchableOpacity
            activeOpacity={product.imageUri ? 1 : 0.85}
            onPress={() => {
              if (!product.imageUri && product.catalogSlide) {
                router.push({ pathname: '/catalog', params: { slide: product.catalogSlide } });
              }
            }}
          >
            <Image
              source={{ uri: displayImageUri }}
              style={styles.catalogImage}
              contentFit={product.imageUri ? 'cover' : 'contain'}
              placeholder={{ color: catColor + '18' }}
              transition={300}
            />
            {!product.imageUri && product.catalogSlide ? (
              <View style={[styles.viewCatalog, { backgroundColor: catColor + '18' }]}>
                <Feather name="book-open" size={14} color={catColor} />
                <Text style={[styles.viewCatalogText, { color: catColor, fontFamily: 'Inter_500Medium' }]}>
                  View in Catalog (Slide {product.catalogSlide})
                </Text>
              </View>
            ) : null}
            {product.imageUri ? (
              <View style={[styles.uploadedBadge, { backgroundColor: catColor + 'dd' }]}>
                <Feather name="image" size={12} color="#fff" />
                <Text style={[styles.uploadedBadgeText, { fontFamily: 'Inter_500Medium' }]}>Custom Image</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ) : null}

        <View style={[styles.header, { backgroundColor: catColor + '10' }]}>
          <View style={styles.headerRow}>
            <View style={[styles.badge, { backgroundColor: catColor + '18' }]}>
              <Text style={[styles.category, { color: catColor, fontFamily: 'Inter_600SemiBold' }]}>{product.category}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setShowEdit(true)}
              >
                <Feather name="edit-2" size={15} color={colors.primary} />
                <Text style={[styles.actionBtnText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}
                onPress={confirmDelete}
              >
                <Feather name="trash-2" size={15} color="#ef4444" />
                <Text style={[styles.actionBtnText, { color: '#ef4444', fontFamily: 'Inter_500Medium' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{product.name}</Text>
          <Text style={[styles.unit, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Unit: {unit}</Text>
        </View>

        <View style={styles.section}>
          <InfoBlock label="Composition" value={product.composition} colors={colors} />
          {product.description ? <InfoBlock label="Description" value={product.description} colors={colors} /> : null}
        </View>
      </ScrollView>

      <ProductFormModal
        visible={showEdit}
        product={product}
        onSave={handleUpdate}
        onClose={() => setShowEdit(false)}
      />
    </>
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
  uploadedBadge: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  uploadedBadgeText: { color: '#fff', fontSize: 11 },
  header: { padding: 20, gap: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  headerActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  actionBtnText: { fontSize: 13 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  category: { fontSize: 13 },
  name: { fontSize: 22 },
  unit: { fontSize: 14 },
  section: { paddingHorizontal: 16, gap: 10 },
  infoBlock: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 6 },
  infoLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, lineHeight: 22 },
});
