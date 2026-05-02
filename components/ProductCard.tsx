import { Image } from 'expo-image';
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

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.badge, { backgroundColor: catColor + '18' }]}>
        {product.imageUri ? (
          <Image
            source={{ uri: product.imageUri }}
            style={styles.thumbnail}
            contentFit="cover"
          />
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
      <Text style={[styles.arrow, { color: colors.mutedForeground }]}>›</Text>
    </TouchableOpacity>
  );
}

export { CATEGORY_COLORS };

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  badge: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbnail: { width: 46, height: 46, borderRadius: 12 },
  emoji: { fontSize: 22 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 15 },
  cat: { fontSize: 12 },
  comp: { fontSize: 12 },
  arrow: { fontSize: 24, lineHeight: 28 },
});
