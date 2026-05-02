import { Feather } from '@expo/vector-icons';
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
import { getUnit } from '@/constants/seedData';
import { useData } from '@/context/DataContext';
import { useColors } from '@/hooks/useColors';
import { OrderItem } from '@/types';

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
      ? products.filter(p =>
          !items.find(i => i.productId === p.id) &&
          (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
           p.composition.toLowerCase().includes(productSearch.toLowerCase()))
        ).slice(0, 8)
      : [],
    [products, productSearch, items]
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

  function handleQtyText(productId: string, text: string) {
    if (text === '' || text === '0') {
      // Keep field temporarily empty while typing; don't remove the item yet
      setItems(items.map(i => i.productId === productId ? { ...i, quantity: 0 } : i));
      return;
    }
    const num = parseInt(text, 10);
    if (!isNaN(num) && num > 0) {
      setItems(items.map(i => i.productId === productId ? { ...i, quantity: num } : i));
    }
  }

  function handleQtyBlur(productId: string, qty: number) {
    // Remove item if quantity left as 0 when field loses focus
    if (qty <= 0) {
      setItems(items.filter(i => i.productId !== productId));
    }
  }

  async function handleSave() {
    const validItems = items.filter(i => i.quantity > 0);
    const doctor = doctors.find(d => d.id === selectedDoctorId);
    if (!doctor) { Alert.alert('Required', 'Please select a doctor.'); return; }
    if (validItems.length === 0) { Alert.alert('Required', 'Add at least one product with quantity > 0.'); return; }
    setSaving(true);
    await addOrder({ doctorId: doctor.id, doctorName: doctor.name, items: validItems });
    setSaving(false);
    router.back();
  }

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Doctor */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Doctor</Text>
        {selectedDoctorId && selectedDoctor ? (
          <View style={[styles.selectedCard, { backgroundColor: colors.primary + '12', borderColor: colors.primary }]}>
            <Feather name="user" size={16} color={colors.primary} />
            <Text style={[styles.selectedCardText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
              Dr. {selectedDoctor.name}
            </Text>
            {selectedDoctor.clinic ? (
              <Text style={[styles.selectedCardSub, { color: colors.primary, fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
                {selectedDoctor.clinic}
              </Text>
            ) : null}
            <TouchableOpacity onPress={() => { setSelectedDoctorId(''); setDoctorSearch(''); }} style={styles.clearBtn}>
              <Feather name="x" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
              value={doctorSearch}
              onChangeText={setDoctorSearch}
              placeholder="Search doctor name..."
              placeholderTextColor={colors.mutedForeground}
            />
            {filteredDoctors.map(d => (
              <TouchableOpacity
                key={d.id}
                style={[styles.suggestion, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => { setSelectedDoctorId(d.id); setDoctorSearch(d.name); }}
              >
                <Feather name="user" size={14} color={colors.mutedForeground} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.suggestionText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Dr. {d.name}</Text>
                  {d.clinic ? <Text style={[styles.suggestionSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{d.clinic}</Text> : null}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Products */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold', marginTop: 8 }]}>Add Products</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
          value={productSearch}
          onChangeText={setProductSearch}
          placeholder="Search by name or composition..."
          placeholderTextColor={colors.mutedForeground}
        />
        {filteredProducts.map(p => (
          <TouchableOpacity
            key={p.id}
            style={[styles.suggestion, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => addItem(p.id, p.name, p.category)}
          >
            <Feather name="plus-circle" size={16} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.suggestionText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{p.name}</Text>
              <Text style={[styles.suggestionSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{p.category} · {p.composition}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Order Items */}
        {items.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold', marginTop: 8 }]}>
              Order Items ({items.length})
            </Text>
            {items.map(item => (
              <View key={item.productId} style={[styles.itemRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <Text style={[styles.itemUnit, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    {item.unit}
                  </Text>
                </View>
                <View style={styles.qtyControls}>
                  {/* Minus */}
                  <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: item.quantity <= 1 ? '#fee2e2' : colors.muted }]}
                    onPress={() => updateQty(item.productId, item.quantity - 1)}
                  >
                    <Feather name={item.quantity <= 1 ? 'trash-2' : 'minus'} size={14} color={item.quantity <= 1 ? '#ef4444' : colors.foreground} />
                  </TouchableOpacity>

                  {/* Editable quantity */}
                  <TextInput
                    style={[styles.qtyInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_700Bold' }]}
                    value={item.quantity === 0 ? '' : String(item.quantity)}
                    onChangeText={text => handleQtyText(item.productId, text)}
                    onBlur={() => handleQtyBlur(item.productId, item.quantity)}
                    keyboardType="number-pad"
                    selectTextOnFocus
                    maxLength={4}
                    textAlign="center"
                  />

                  {/* Plus */}
                  <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                    onPress={() => updateQty(item.productId, item.quantity + 1)}
                  >
                    <Feather name="plus" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) }]}>
        <View>
          <Text style={[styles.footerLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Total items</Text>
          <Text style={[styles.footerCount, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {items.filter(i => i.quantity > 0).length} product{items.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: saving ? colors.primaryDark : colors.accent, opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Feather name="check" size={16} color="#fff" />
          <Text style={[styles.saveBtnText, { fontFamily: 'Inter_600SemiBold' }]}>{saving ? 'Saving…' : 'Place Order'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 10 },
  sectionTitle: { fontSize: 17, marginBottom: 2 },

  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 10, fontSize: 15 },

  selectedCard: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1 },
  selectedCardText: { flex: 1, fontSize: 15 },
  selectedCardSub: { fontSize: 12 },
  clearBtn: { padding: 2 },

  suggestion: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  suggestionText: { fontSize: 14 },
  suggestionSub: { fontSize: 11, marginTop: 1 },

  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, gap: 10 },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 14 },
  itemUnit: { fontSize: 11 },

  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  qtyInput: {
    width: 52, height: 34, borderRadius: 10, borderWidth: 1,
    fontSize: 16, textAlign: 'center',
  },

  footer: { padding: 16, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerLabel: { fontSize: 11 },
  footerCount: { fontSize: 16 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  saveBtnText: { fontSize: 15, color: '#fff' },
});
