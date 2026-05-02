import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { VisitCard } from '@/components/VisitCard';
import { useData } from '@/context/DataContext';
import { useColors } from '@/hooks/useColors';

function formatTime(date: Date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function toHHMM(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function VisitsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { visits, doctors, products, addVisit, toggleVisit, deleteVisit, toggleAcceptedProduct } = useData();

  const [tab, setTab] = useState<'today' | 'all'>('today');
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeDate, setTimeDate] = useState(new Date());
  const [timeSet, setTimeSet] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const today = new Date().toDateString();

  const displayed = useMemo(() => {
    if (tab === 'today') return visits.filter(v => new Date(v.date).toDateString() === today);
    return visits;
  }, [visits, tab, today]);

  const filteredDoctors = useMemo(() =>
    doctors.filter(d => d.name.toLowerCase().includes(doctorSearch.toLowerCase())),
    [doctors, doctorSearch]
  );

  const filteredProducts = useMemo(() =>
    productSearch.trim()
      ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 8)
      : [],
    [products, productSearch]
  );

  function toggleProduct(id: string) {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function resetModal() {
    setModalVisible(false);
    setSelectedDoctor('');
    setDoctorSearch('');
    setProductSearch('');
    setSelectedProducts([]);
    setTimeDate(new Date());
    setTimeSet(false);
    setShowTimePicker(false);
    setDate(new Date().toISOString().split('T')[0]);
  }

  function onTimeChange(event: DateTimePickerEvent, selected?: Date) {
    // On Android the picker closes itself after selection
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (event.type === 'set' && selected) {
      setTimeDate(selected);
      setTimeSet(true);
    }
  }

  async function handleAdd() {
    const doctor = doctors.find(d => d.id === selectedDoctor);
    if (!doctor) { Alert.alert('Required', 'Select a doctor'); return; }
    await addVisit({
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorClinic: doctor.clinic,
      date,
      time: timeSet ? toHHMM(timeDate) : '',
      showProducts: selectedProducts,
    });
    resetModal();
  }

  const webTop = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={displayed}
        keyExtractor={v => v.id}
        renderItem={({ item }) => (
          <VisitCard
            visit={item}
            products={products}
            onToggle={() => toggleVisit(item.id)}
            onDelete={() => Alert.alert('Delete Visit', 'Remove this visit?', [
              { text: 'Cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteVisit(item.id) },
            ])}
            onAcceptProduct={(productId) => toggleAcceptedProduct(item.id, productId)}
          />
        )}
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: insets.top + webTop + 16 }]}>
            <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
              {(['today', 'all'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tabBtn, tab === t && { backgroundColor: colors.card, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }]}
                  onPress={() => setTab(t)}
                >
                  <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground, fontFamily: tab === t ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                    {t === 'today' ? "Today's Plan" : 'All Visits'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="📅" title={tab === 'today' ? 'No visits today' : 'No visits scheduled'} subtitle="Tap + to schedule a doctor visit" />
        }
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 84 : 100) }]}
        scrollEnabled={!!displayed.length}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + (Platform.OS === 'web' ? 84 : 96) }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={resetModal}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Schedule Visit</Text>
              <TouchableOpacity onPress={resetModal}>
                <Text style={[styles.closeBtn, { color: colors.mutedForeground }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ maxHeight: '90%' }}>

              {/* Date */}
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>Date</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.mutedForeground}
              />

              {/* Time */}
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium', marginTop: 10 }]}>Visit Time</Text>
              <TouchableOpacity
                style={[styles.timePicker, { backgroundColor: colors.background, borderColor: timeSet ? colors.primary : colors.border }]}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.75}
              >
                <Text style={styles.timeEmoji}>⏰</Text>
                <Text style={[styles.timePickerText, { color: timeSet ? colors.primary : colors.mutedForeground, fontFamily: timeSet ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                  {timeSet ? formatTime(timeDate) : 'Tap to set visit time'}
                </Text>
                {timeSet && (
                  <TouchableOpacity onPress={() => { setTimeSet(false); setTimeDate(new Date()); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>✕</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {/* Native time picker — inline on iOS, dialog on Android */}
              {showTimePicker && Platform.OS !== 'web' && (
                <View style={[styles.iosPickerWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <DateTimePicker
                    value={timeDate}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onTimeChange}
                    style={Platform.OS === 'ios' ? styles.iosPicker : undefined}
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      style={[styles.iosDoneBtn, { backgroundColor: colors.primary }]}
                      onPress={() => { setShowTimePicker(false); setTimeSet(true); }}
                    >
                      <Text style={[styles.iosDoneBtnText, { fontFamily: 'Inter_600SemiBold' }]}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Web fallback */}
              {showTimePicker && Platform.OS === 'web' && (
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular', marginTop: 4 }]}
                  placeholder="HH:MM (e.g. 14:30)"
                  placeholderTextColor={colors.mutedForeground}
                  onChangeText={val => {
                    const [h, m] = val.split(':').map(Number);
                    if (!isNaN(h) && !isNaN(m)) {
                      const d = new Date(); d.setHours(h, m);
                      setTimeDate(d); setTimeSet(true);
                    }
                  }}
                />
              )}

              {/* Doctor picker */}
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium', marginTop: 14 }]}>Doctor</Text>
              {selectedDoctor ? (
                <View style={[styles.selectedRow, { backgroundColor: colors.primary + '12', borderColor: colors.primary }]}>
                  <Text style={[styles.selectedText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                    👤 Dr. {doctors.find(d => d.id === selectedDoctor)?.name}
                  </Text>
                  <TouchableOpacity onPress={() => { setSelectedDoctor(''); setDoctorSearch(''); }}>
                    <Text style={{ color: colors.primary, fontSize: 18 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
                    value={doctorSearch}
                    onChangeText={setDoctorSearch}
                    placeholder="Search doctor..."
                    placeholderTextColor={colors.mutedForeground}
                  />
                  {filteredDoctors.slice(0, 5).map(d => (
                    <TouchableOpacity
                      key={d.id}
                      style={[styles.option, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => { setSelectedDoctor(d.id); setDoctorSearch(d.name); }}
                    >
                      <Text style={[styles.optionText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Dr. {d.name}</Text>
                      {d.clinic ? <Text style={[styles.optionSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{d.clinic}</Text> : null}
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Products to show */}
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium', marginTop: 14 }]}>
                💊 Products to show this doctor
              </Text>
              <Text style={[styles.fieldSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                Search and add the products you'll demo during this visit
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular', marginTop: 6 }]}
                value={productSearch}
                onChangeText={setProductSearch}
                placeholder="🔍  Search products..."
                placeholderTextColor={colors.mutedForeground}
              />

              {filteredProducts.map(p => {
                const sel = selectedProducts.includes(p.id);
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.productOption, { backgroundColor: sel ? colors.primary + '12' : colors.background, borderColor: sel ? colors.primary : colors.border }]}
                    onPress={() => toggleProduct(p.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{p.name}</Text>
                      <Text style={[styles.optionSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{p.category}</Text>
                    </View>
                    <Text style={{ fontSize: 20 }}>{sel ? '✅' : '⬜'}</Text>
                  </TouchableOpacity>
                );
              })}

              {selectedProducts.length > 0 && (
                <View style={[styles.selectedBox, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '30' }]}>
                  <Text style={[styles.selectedBoxTitle, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                    📦 {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                  </Text>
                  <View style={styles.chipRow}>
                    {selectedProducts.map(id => {
                      const p = products.find(x => x.id === id);
                      if (!p) return null;
                      return (
                        <TouchableOpacity key={id} style={[styles.chip, { backgroundColor: colors.primary }]} onPress={() => toggleProduct(id)}>
                          <Text style={[styles.chipText, { fontFamily: 'Inter_500Medium' }]}>{p.name}  ✕</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary, marginTop: 16 }]} onPress={handleAdd}>
                <Text style={[styles.addBtnText, { fontFamily: 'Inter_600SemiBold' }]}>Schedule Visit</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 16 },
  header: { paddingBottom: 12 },
  tabs: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabText: { fontSize: 14 },
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 34 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 8, maxHeight: '92%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sheetTitle: { fontSize: 20 },
  closeBtn: { fontSize: 20, padding: 4 },
  fieldLabel: { fontSize: 13, marginBottom: 4 },
  fieldSub: { fontSize: 12, marginBottom: 2 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 15, marginBottom: 6 },
  timePicker: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 6 },
  timeEmoji: { fontSize: 18 },
  timePickerText: { flex: 1, fontSize: 15 },
  iosPickerWrap: { borderWidth: 1, borderRadius: 14, marginBottom: 8, overflow: 'hidden' },
  iosPicker: { height: 160 },
  iosDoneBtn: { marginHorizontal: 16, marginBottom: 12, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  iosDoneBtnText: { color: '#fff', fontSize: 15 },
  option: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  productOption: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  optionText: { fontSize: 14 },
  optionSub: { fontSize: 12 },
  selectedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 6 },
  selectedText: { fontSize: 14 },
  selectedBox: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 8, marginBottom: 6 },
  selectedBoxTitle: { fontSize: 13 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  chipText: { fontSize: 12, color: '#fff' },
  addBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  addBtnText: { fontSize: 16, color: '#fff' },
});
