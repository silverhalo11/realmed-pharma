import { router } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { OrderCard } from '@/components/OrderCard';
import { useData } from '@/context/DataContext';
import { useColors } from '@/hooks/useColors';

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { orders, doctors, deleteOrder } = useData();

  function shareViaWhatsApp(orderId: string) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const doctor = doctors.find(d => d.id === order.doctorId);

    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const lines: string[] = [];
    lines.push('*RealMed Pharma — Order Details*');
    lines.push('');
    lines.push(`*Doctor:* Dr. ${order.doctorName}`);
    if (doctor?.medicalStore) lines.push(`*Medical Store:* ${doctor.medicalStore}`);
    if (doctor?.address)      lines.push(`*Delivery Address:* ${doctor.address}`);
    if (doctor?.phone)        lines.push(`*Phone:* ${doctor.phone}`);
    lines.push(`*Date:* ${today}`);
    lines.push('');
    lines.push('*Order Items:*');
    order.items.forEach(i => lines.push(`  • ${i.productName}: ${i.quantity} ${i.unit}`));
    lines.push('');
    lines.push('_Sent via RealMed Pharma App_');

    const url = `whatsapp://send?text=${encodeURIComponent(lines.join('\n'))}`;
    Linking.openURL(url).catch(() => Alert.alert('WhatsApp not available'));
  }

  const webTop = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onDelete={() => Alert.alert('Delete Order', 'Remove this order?', [
              { text: 'Cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteOrder(item.id) },
            ])}
            onShare={() => shareViaWhatsApp(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="🛍️" title="No orders yet" subtitle="Create an order from a doctor's profile" />
        }
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 24), paddingTop: insets.top + webTop + 16 }]}
        scrollEnabled={!!orders.length}
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent, bottom: insets.bottom + (Platform.OS === 'web' ? 34 : 24) }]}
        onPress={() => router.push('/order/new')}
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
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 34 },
});
