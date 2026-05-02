import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Order } from '@/types';
import { useColors } from '@/hooks/useColors';

interface OrderCardProps {
  order: Order;
  onDelete: () => void;
  onShare?: () => void;
}

export function OrderCard({ order, onDelete, onShare }: OrderCardProps) {
  const colors = useColors();
  const total = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const date = new Date(order.date);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accent + '18' }]}>
          <Text style={styles.headerEmoji}>🛍️</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.doctor, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
            Dr. {order.doctorName}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {total} item{total !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.actions}>
          {onShare && (
            <TouchableOpacity onPress={onShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.action}>
              <Text style={styles.actionEmoji}>📤</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.action}>
            <Text style={styles.actionEmoji}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      {order.items.slice(0, 3).map((item, i) => (
        <View key={i} style={styles.item}>
          <Text style={[styles.itemName, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
            {item.productName}
          </Text>
          <Text style={[styles.itemQty, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
            {item.quantity} {item.unit}
          </Text>
        </View>
      ))}
      {order.items.length > 3 && (
        <Text style={[styles.more, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          +{order.items.length - 3} more
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerEmoji: { fontSize: 20 },
  headerInfo: { flex: 1 },
  doctor: { fontSize: 15 },
  meta: { fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  action: { padding: 4 },
  actionEmoji: { fontSize: 20 },
  divider: { height: 1, marginBottom: 8 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  itemName: { flex: 1, fontSize: 13 },
  itemQty: { fontSize: 13 },
  more: { fontSize: 12, marginTop: 4 },
});
