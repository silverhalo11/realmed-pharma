import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '@/context/DataContext';
import { getUnit } from '@/constants/seedData';
import { OrderItem } from '@/types';
import { useColors } from '@/hooks/useColors';

export default function NewOrderScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ doctorId?: string; doctorName?: string }>();
  const { doctors, products, addOrder } = useData();

  const [selectedDoctorId, setSelectedDoctorId] = useState(params.doctorId ?? '');
  const [doctorSearch, setDoctorSearch] = useState(params.doctorName ?? '');
  const [productSearch, setProductSearch] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [saving, setSaving] = useState(false);

  const filteredDoctors = useMemo(() =>
    doctorSearch && !selectedDoctorId
      ? doctors.filter(d => d.name.toLowerCase().includes(doctorSearch.toLowerCase())).slice(0, 5)
      : [],
    [doctors, doctorSearch, selectedDoctorId]
  );

  const filteredProducts = useMemo(() =>
    productSearch
      ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 8)
      : [],
    [products, productSearch]
  );

  function addItem(productId: string, productName: string, category: string) {
    const existing = items.find(i => i.productId === productId);
    if (existing) {
      setItems(items.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { productId, productName, quantity: 1, unit: getUnit(category) }]);
    }
    setProductSearch('');
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      setItems(items.filter(i => i.productId !== productId));
    } else {
      setItems(items.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
    }
  }

  async function handleSave() {
    const doctor = doctors.find(d => d.id === selectedDoctorId);
    if (!doctor) { Alert.alert('Required', 'Select a doctor'); return; }
    if (items.length === 0) { Alert.alert('Required', 'Add at least one product'); return; }
    setSaving(true);
    await addOrder({ doctorId: doctor.id, doctorName: doctor.name, items });
    setSaving(false);
    router.back();
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]} keyboardShouldPersistTaps="handled">
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Doctor</Text>
        {selectedDoctorId ? (
          <View style={[styles.selectedDoctor, { backgroundColor: colors.primary + '12', borderColor: colors.primary }]}>
            <Text style={[styles.selectedDoctorText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
              👤 Dr. {doctors.find(d => d.id === selectedDoctorId)?.name}
            </Text>
            <TouchableOpacity onPress={() => { setSelectedDoctorId(''); setDoctorSearch(''); }}>
              <Text style={[styles.clearBtn, { color: colors.primary }]}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
              value={doctorSearch}
              onChangeText={setDoctorSearch}
              placeholder="Search doctor..."
              placeholderTextColor={colors.mutedForeground}
            />
            {filteredDoctors.map(d => (
              <TouchableOpacity
                key={d.id}
                style={[styles.option, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => { setSelectedDoctorId(d.id); setDoctorSearch(d.name); }}
              >
                <Text style={[styles.optionText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>Dr. {d.name}</Text>
                {d.clinic ? <Text style={[styles.optionSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{d.clinic}</Text> : null}
              </TouchableOpacity>
            ))}
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold', marginTop: 8 }]}>Add Products</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
          value={productSearch}
          onChangeText={setProductSearch}
          placeholder="Search products..."
          placeholderTextColor={colors.mutedForeground}
        />
        {filteredProducts.map(p => (
          <TouchableOpacity
            key={p.id}
            style={[styles.option, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => addItem(p.id, p.name, p.category)}
          >
            <Text style={[styles.optionText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{p.name}</Text>
            <Text style={[styles.optionSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{p.category}</Text>
          </TouchableOpacity>
        ))}

        {items.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold', marginTop: 8 }]}>Order Items</Text>
            {items.map(item => (
              <View key={item.productId} style={[styles.itemRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.itemName, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]} numberOfLines={1}>{item.productName}</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: colors.muted }]} onPress={() => updateQty(item.productId, item.quantity - 1)}>
                    <Text style={[styles.qtyBtnText, { color: colors.foreground }]}>−</Text>
                  </TouchableOpacity>
                  <Text style={[styles.qty, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{item.quantity}</Text>
                  <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: colors.muted }]} onPress={() => updateQty(item.productId, item.quantity + 1)}>
                    <Text style={[styles.qtyBtnText, { color: colors.foreground }]}>+</Text>
                  </TouchableOpacity>
                  <Text style={[styles.unit, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{item.unit}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) }]}>
        <Text style={[styles.footerInfo, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {items.length} item{items.length !== 1 ? 's' : ''} selected
        </Text>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: saving ? colors.primaryDark : colors.accent }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={[styles.saveBtnText, { fontFamily: 'Inter_600SemiBold' }]}>{saving ? 'Saving...' : 'Place Order'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, gap: 10 },
  sectionTitle: { fontSize: 17 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 15 },
  option: { padding: 14, borderRadius: 12, borderWidth: 1 },
  optionText: { fontSize: 14 },
  optionSub: { fontSize: 12 },
  selectedDoctor: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 12, borderWidth: 1 },
  selectedDoctorText: { fontSize: 15 },
  clearBtn: { fontSize: 18, padding: 4 },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, gap: 12 },
  itemName: { flex: 1, fontSize: 14 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 18, lineHeight: 22 },
  qty: { fontSize: 16, minWidth: 24, textAlign: 'center' },
  unit: { fontSize: 12 },
  footer: { padding: 16, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  footerInfo: { flex: 1, fontSize: 14 },
  saveBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { fontSize: 15, color: '#fff' },
});
