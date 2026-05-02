import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Product } from '@/types';
import { useColors } from '@/hooks/useColors';

const CATEGORY_COLORS: Record<string, string> = {
  'Eye Drops': '#0ea5e9',
  'Eye Ointment': '#8b5cf6',
  'Eye Gel': '#06b6d4',
  'Tablets': '#f59e0b',
  'Capsules': '#22c55e',
};

const CATEGORY_EMOJI: Record<string, string> = {
  'Eye Drops': '💧',
  'Eye Ointment': '🧴',
  'Eye Gel': '🔵',
  'Tablets': '💊',
  'Capsules': '💊',
};

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const colors = useColors();
  const catColor = CATEGORY_COLORS[product.category] ?? colors.primary;
  const catEmoji = CATEGORY_EMOJI[product.category] ?? '📦';
  const hasSlide = product.catalogSlide > 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Main tap area */}
      <TouchableOpacity style={styles.main} onPress={onPress} activeOpacity={0.75}>
        <View style={[styles.badge, { backgroundColor: catColor + '18' }]}>
          {product.imageUri ? (
            <Image source={{ uri: product.imageUri }} style={styles.thumbnail} contentFit="cover" />
          ) : (
            <Text style={styles.emoji}>{catEmoji}</Text>
          )}
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={[styles.cat, { color: catColor, fontFamily: 'Inter_500Medium' }]}>{product.category}</Text>
          <Text style={[styles.comp, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
            {product.composition}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>

      {/* Catalog button — only if slide exists */}
      {hasSlide && (
        <TouchableOpacity
          style={[styles.catalogBtn, { borderTopColor: colors.border, backgroundColor: catColor + '0c' }]}
          onPress={() => router.push({ pathname: '/catalog', params: { slide: product.catalogSlide } } as any)}
          activeOpacity={0.7}
        >
          <Feather name="book-open" size={13} color={catColor} />
          <Text style={[styles.catalogBtnText, { color: catColor, fontFamily: 'Inter_500Medium' }]}>
            View Catalog — Slide {product.catalogSlide}
          </Text>
          <Feather name="chevron-right" size={13} color={catColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export { CATEGORY_COLORS };

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  badge: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbnail: { width: 46, height: 46, borderRadius: 12 },
  emoji: { fontSize: 22 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 15 },
  cat: { fontSize: 12 },
  comp: { fontSize: 12 },
  catalogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  catalogBtnText: { flex: 1, fontSize: 12 },
});
