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
import { ReminderCard } from '@/components/ReminderCard';
import { useData } from '@/context/DataContext';
import { useColors } from '@/hooks/useColors';

export default function RemindersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reminders, doctors, addReminder, toggleReminder, deleteReminder } = useData();
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctorSearch, setDoctorSearch] = useState('');

  const displayed = useMemo(() => {
    if (tab === 'pending') return reminders.filter(r => !r.done);
    return reminders;
  }, [reminders, tab]);

  const filteredDoctors = useMemo(() =>
    doctors.filter(d => d.name.toLowerCase().includes(doctorSearch.toLowerCase())),
    [doctors, doctorSearch]
  );

  async function handleAdd() {
    const doctor = doctors.find(d => d.id === selectedDoctor);
    if (!doctor) { Alert.alert('Required', 'Select a doctor'); return; }
    if (!text.trim()) { Alert.alert('Required', 'Enter reminder text'); return; }
    await addReminder({ doctorId: doctor.id, doctorName: doctor.name, text: text.trim(), date });
    setModalVisible(false);
    setSelectedDoctor('');
    setDoctorSearch('');
    setText('');
  }

  const webTop = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={displayed}
        keyExtractor={r => r.id}
        renderItem={({ item }) => (
          <ReminderCard
            reminder={item}
            onToggle={() => toggleReminder(item.id)}
            onDelete={() => Alert.alert('Delete Reminder', 'Remove this reminder?', [
              { text: 'Cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteReminder(item.id) },
            ])}
          />
        )}
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: insets.top + webTop + 16 }]}>
            <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
              {(['pending', 'all'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tabBtn, tab === t && { backgroundColor: colors.card, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }]}
                  onPress={() => setTab(t)}
                >
                  <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground, fontFamily: tab === t ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                    {t === 'pending' ? 'Pending' : 'All'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="🔔" title={tab === 'pending' ? 'All caught up!' : 'No reminders yet'} subtitle="Tap + to add a reminder" />
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

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Add Reminder</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeBtn, { color: colors.mutedForeground }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>Reminder</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
              value={text}
              onChangeText={setText}
              placeholder="What to remind..."
              placeholderTextColor={colors.mutedForeground}
              multiline
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>Date</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>Search Doctor</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
              value={doctorSearch}
              onChangeText={setDoctorSearch}
              placeholder="Type doctor name..."
              placeholderTextColor={colors.mutedForeground}
            />

            <ScrollView style={styles.doctorList} keyboardShouldPersistTaps="handled">
              {filteredDoctors.slice(0, 6).map(d => (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.doctorOption, { backgroundColor: selectedDoctor === d.id ? colors.primary + '18' : colors.background, borderColor: selectedDoctor === d.id ? colors.primary : colors.border }]}
                  onPress={() => { setSelectedDoctor(d.id); setDoctorSearch(d.name); }}
                >
                  <Text style={[styles.doctorOptionText, { color: colors.foreground, fontFamily: selectedDoctor === d.id ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                    Dr. {d.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
              <Text style={[styles.addBtnText, { fontFamily: 'Inter_600SemiBold' }]}>Add Reminder</Text>
            </TouchableOpacity>
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
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 10, maxHeight: '90%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sheetTitle: { fontSize: 20 },
  closeBtn: { fontSize: 20, padding: 4 },
  fieldLabel: { fontSize: 13 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 15 },
  doctorList: { maxHeight: 150 },
  doctorOption: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  doctorOptionText: { fontSize: 14 },
  addBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  addBtnText: { fontSize: 16, color: '#fff' },
});
