import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
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
import { CATEGORIES, getCatalogUrl } from '@/constants/seedData';
import { useColors } from '@/hooks/useColors';
import { Product } from '@/types';

const PRODUCT_CATEGORIES = CATEGORIES.filter(c => c !== 'All');
const TOTAL_SLIDES = 90;

interface Props {
  visible: boolean;
  product?: Product;
  onSave: (data: Omit<Product, 'id' | 'userId' | 'isSeeded'>) => void;
  onClose: () => void;
}

export function ProductFormModal({ visible, product, onSave, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [composition, setComposition] = useState('');
  const [description, setDescription] = useState('');
  const [catalogSlide, setCatalogSlide] = useState('0');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [initialCatalogSlide, setInitialCatalogSlide] = useState(0);

  useEffect(() => {
    if (visible) {
      setName(product?.name ?? '');
      setCategory(product?.category ?? PRODUCT_CATEGORIES[0]);
      setComposition(product?.composition ?? '');
      setDescription(product?.description ?? '');
      setInitialCatalogSlide(product?.catalogSlide ?? 0);
      setCatalogSlide(product?.catalogSlide ? String(product.catalogSlide) : '0');
      setImageUri(product?.imageUri);
    }
  }, [visible, product]);

  async function pickFromLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow photo library access to upload an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  }

  function showImageOptions() {
    Alert.alert('Change Product Image', 'Choose source', [
      { text: '📷  Take Photo', onPress: takePhoto },
      { text: '🖼️  Photo Library', onPress: pickFromLibrary },
      ...(imageUri ? [{ text: '🗑️  Remove Custom Image', style: 'destructive' as const, onPress: () => setImageUri(undefined) }] : []),
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handleSave() {
    if (!name.trim()) { Alert.alert('Required', 'Product name is required.'); return; }
    if (!composition.trim()) { Alert.alert('Required', 'Composition is required.'); return; }
    const slide = parseInt(catalogSlide, 10);
    const validSlide = isNaN(slide) || slide < 1 || slide > TOTAL_SLIDES
      ? initialCatalogSlide
      : slide;
    setSaving(true);
    onSave({ name: name.trim(), category, composition: composition.trim(), description: description.trim(), catalogSlide: validSlide, imageUri });
    setSaving(false);
  }

  const slideNum = parseInt(catalogSlide, 10);
  const previewSlide = !isNaN(slideNum) && slideNum >= 1 && slideNum <= TOTAL_SLIDES ? slideNum : 0;
  const catalogPreviewUrl = previewSlide ? getCatalogUrl(previewSlide) : null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.topBar, { borderBottomColor: colors.border, paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
            {product ? 'Edit Product' : 'New Product'}
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.saveBtnText, { fontFamily: 'Inter_600SemiBold' }]}>{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">

          {/* ── IMAGE SECTION ── */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>PRODUCT IMAGE</Text>

            <View style={styles.imageRow}>
              {/* Custom photo upload */}
              <View style={styles.imageHalf}>
                <Text style={[styles.imageSubLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Custom Photo</Text>
                <TouchableOpacity
                  style={[styles.imageBox, { borderColor: imageUri ? colors.primary : colors.border, backgroundColor: colors.card }]}
                  onPress={showImageOptions}
                  activeOpacity={0.8}
                >
                  {imageUri ? (
                    <>
                      <Image source={{ uri: imageUri }} style={styles.imageBoxFill} contentFit="cover" />
                      <View style={styles.imageBoxOverlay}>
                        <Feather name="camera" size={16} color="#fff" />
                        <Text style={[styles.imageBoxOverlayText, { fontFamily: 'Inter_500Medium' }]}>Change</Text>
                      </View>
                    </>
                  ) : (
                    <View style={styles.imageBoxEmpty}>
                      <Feather name="camera" size={26} color={colors.mutedForeground} />
                      <Text style={[styles.imageBoxEmptyText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                        Upload{'\n'}Photo
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {imageUri && (
                  <TouchableOpacity onPress={() => setImageUri(undefined)} style={styles.removeBtn}>
                    <Text style={[styles.removeBtnText, { color: '#ef4444', fontFamily: 'Inter_400Regular' }]}>✕ Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Catalog slide preview */}
              <View style={styles.imageHalf}>
                <Text style={[styles.imageSubLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Catalog Slide</Text>
                <View style={[styles.imageBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
                  {catalogPreviewUrl ? (
                    <Image source={{ uri: catalogPreviewUrl }} style={styles.imageBoxFill} contentFit="contain" transition={200} />
                  ) : (
                    <View style={styles.imageBoxEmpty}>
                      <Feather name="book-open" size={26} color={colors.mutedForeground} />
                      <Text style={[styles.imageBoxEmptyText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                        No Slide
                      </Text>
                    </View>
                  )}
                </View>
                <TextInput
                  style={[styles.slideInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
                  value={catalogSlide}
                  onChangeText={setCatalogSlide}
                  placeholder="1–90 (0 = none)"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  textAlign="center"
                />
              </View>
            </View>

            {imageUri && catalogPreviewUrl && (
              <View style={[styles.infoBanner, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
                <Feather name="info" size={13} color={colors.primary} />
                <Text style={[styles.infoBannerText, { color: colors.primary, fontFamily: 'Inter_400Regular' }]}>
                  Custom photo is shown on the product. Catalog slide is still linked for the catalog viewer.
                </Text>
              </View>
            )}
          </View>

          {/* ── NAME ── */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>PRODUCT NAME *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Beporiz"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          {/* ── CATEGORY ── */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {PRODUCT_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, { backgroundColor: category === cat ? colors.primary : colors.card, borderColor: category === cat ? colors.primary : colors.border }]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, { color: category === cat ? '#fff' : colors.foreground, fontFamily: 'Inter_500Medium' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ── COMPOSITION ── */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>COMPOSITION *</Text>
            <TextInput
              style={[styles.input, styles.multiline, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
              value={composition}
              onChangeText={setComposition}
              placeholder="e.g. Bepotastine Besilate 1.5%"
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* ── DESCRIPTION ── */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.multiline, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Brief product description"
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  closeBtn: { padding: 4, width: 44 },
  title: { fontSize: 17 },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontSize: 14 },
  scroll: { flex: 1 },
  form: { padding: 16, gap: 20 },
  section: { gap: 8 },
  label: { fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  chips: { gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13 },

  imageRow: { flexDirection: 'row', gap: 12 },
  imageHalf: { flex: 1, gap: 6 },
  imageSubLabel: { fontSize: 12, textAlign: 'center' },
  imageBox: { height: 130, borderWidth: 1.5, borderRadius: 14, overflow: 'hidden', borderStyle: 'dashed' },
  imageBoxFill: { width: '100%', height: '100%' },
  imageBoxOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 6 },
  imageBoxOverlayText: { color: '#fff', fontSize: 12 },
  imageBoxEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  imageBoxEmptyText: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
  removeBtn: { alignItems: 'center' },
  removeBtnText: { fontSize: 12 },
  slideInput: { borderWidth: 1, borderRadius: 10, paddingVertical: 8, fontSize: 13 },
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1 },
  infoBannerText: { flex: 1, fontSize: 12, lineHeight: 17 },
});
