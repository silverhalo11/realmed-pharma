import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
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
import { useColors } from '@/hooks/useColors';

const SPECIALTIES = ['Ophthalmologist', 'Optometrist', 'General Physician', 'Neurologist', 'Pediatrician', 'Other'];

export default function EditDoctorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { doctors, updateDoctor, products } = useData();

  const doctor = useMemo(() => doctors.find(d => d.id === id), [doctors, id]);

  const [name, setName] = useState(doctor?.name ?? '');
  const [degree, setDegree] = useState(doctor?.degree ?? '');
  const [dob, setDob] = useState(doctor?.dob ?? '');
  const [clinic, setClinic] = useState(doctor?.clinic ?? '');
  const [phone, setPhone] = useState(doctor?.phone ?? '');
  const [address, setAddress] = useState(doctor?.address ?? '');
  const [specialty, setSpecialty] = useState(doctor?.specialty ?? '');
  const [notes, setNotes] = useState(doctor?.notes ?? '');
  const [medicalStore, setMedicalStore] = useState(doctor?.medicalStore ?? '');
  const [saving, setSaving] = useState(false);

  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>(doctor?.prescribedProducts ?? []);

  const filteredProducts = useMemo(() =>
    productSearch.trim()
      ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 8)
      : [],
    [products, productSearch]
  );

  function toggleProduct(pid: string) {
    setSelectedProducts(prev =>
      prev.includes(pid) ? prev.filter(x => x !== pid) : [...prev, pid]
    );
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Required', 'Doctor name is required'); return; }
    if (!doctor) return;
    setSaving(true);
    await updateDoctor(doctor.id, {
      name: name.trim(), degree: degree.trim(), dob: dob.trim(),
      clinic: clinic.trim(), phone: phone.trim(), address: address.trim(),
      specialty: specialty.trim(), notes: notes.trim(),
      medicalStore: medicalStore.trim(), prescribedProducts: selectedProducts,
    });
    setSaving(false);
    router.back();
  }

  if (!doctor) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>Doctor not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">

        {[
          { label: 'Full Name *', value: name, setter: setName, placeholder: 'Dr. Sharma', keyboard: 'default' as const },
          { label: 'Degree', value: degree, setter: setDegree, placeholder: 'MBBS, MS (Ophth)', keyboard: 'default' as const },
          { label: 'Date of Birth', value: dob, setter: setDob, placeholder: 'DD/MM/YYYY', keyboard: 'default' as const },
          { label: 'Clinic / Hospital', value: clinic, setter: setClinic, placeholder: 'City Eye Hospital', keyboard: 'default' as const },
          { label: 'Phone', value: phone, setter: setPhone, placeholder: '+91 98765 43210', keyboard: 'phone-pad' as const },
          { label: 'Address', value: address, setter: setAddress, placeholder: 'Clinic address', keyboard: 'default' as const },
          { label: 'Medical Store', value: medicalStore, setter: setMedicalStore, placeholder: 'Associated medical store', keyboard: 'default' as const },
        ].map(({ label, value, setter, placeholder, keyboard }) => (
          <View key={label}>
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{label}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
              value={value}
              onChangeText={setter}
              placeholder={placeholder}
              placeholderTextColor={colors.mutedForeground}
              keyboardType={keyboard}
            />
          </View>
        ))}

        <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>Specialty</Text>
        <View style={styles.chips}>
          {SPECIALTIES.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, { backgroundColor: specialty === s ? colors.primary : colors.card, borderColor: specialty === s ? colors.primary : colors.border }]}
              onPress={() => setSpecialty(specialty === s ? '' : s)}
            >
              <Text style={[styles.chipText, { color: specialty === s ? '#fff' : colors.foreground, fontFamily: 'Inter_500Medium' }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {!SPECIALTIES.includes(specialty) && specialty !== '' && (
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
            value={specialty}
            placeholder="Specify specialty"
            placeholderTextColor={colors.mutedForeground}
            onChangeText={setSpecialty}
          />
        )}

        <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={3}
        />

        <Text style={[styles.sectionHeader, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>💊 Prescribed Products</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Search and select the products this doctor prescribes
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
          value={productSearch}
          onChangeText={setProductSearch}
          placeholder="🔍  Search products..."
          placeholderTextColor={colors.mutedForeground}
        />

        {filteredProducts.map(p => {
          const selected = selectedProducts.includes(p.id);
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.productOption, { backgroundColor: selected ? colors.primary + '12' : colors.card, borderColor: selected ? colors.primary : colors.border }]}
              onPress={() => toggleProduct(p.id)}
            >
              <View style={styles.productOptionLeft}>
                <Text style={[styles.productOptionName, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{p.name}</Text>
                <Text style={[styles.productOptionCat, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{p.category}</Text>
              </View>
              <Text style={{ fontSize: 20 }}>{selected ? '✅' : '⬜'}</Text>
            </TouchableOpacity>
          );
        })}

        {selectedProducts.length > 0 && (
          <View style={[styles.selectedBox, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '30' }]}>
            <Text style={[styles.selectedBoxTitle, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
              ✅ {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} prescribed
            </Text>
            <View style={styles.chips}>
              {selectedProducts.map(pid => {
                const p = products.find(x => x.id === pid);
                if (!p) return null;
                return (
                  <TouchableOpacity
                    key={pid}
                    style={[styles.chip, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                    onPress={() => toggleProduct(pid)}
                  >
                    <Text style={[styles.chipText, { color: '#fff', fontFamily: 'Inter_500Medium' }]}>{p.name}  ✕</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: saving ? colors.primaryDark : colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={[styles.saveBtnText, { fontFamily: 'Inter_600SemiBold' }]}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 12 },
  label: { fontSize: 13, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 15 },
  textarea: { height: 80, textAlignVertical: 'top' },
  sectionHeader: { fontSize: 17, marginTop: 8 },
  sectionSub: { fontSize: 13, marginTop: -6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13 },
  productOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, gap: 10 },
  productOptionLeft: { flex: 1 },
  productOptionName: { fontSize: 14 },
  productOptionCat: { fontSize: 12 },
  selectedBox: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  selectedBoxTitle: { fontSize: 14 },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { fontSize: 16, color: '#fff' },
});
