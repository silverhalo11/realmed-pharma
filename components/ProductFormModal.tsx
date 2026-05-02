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

  useEffect(() => {
    if (visible) {
      setName(product?.name ?? '');
      setCategory(product?.category ?? PRODUCT_CATEGORIES[0]);
      setComposition(product?.composition ?? '');
      setDescription(product?.description ?? '');
      setCatalogSlide(product?.catalogSlide ? String(product.catalogSlide) : '0');
      setImageUri(product?.imageUri);
    }
  }, [visible, product]);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow access to your photo library to upload an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: false,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
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
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  function showImageOptions() {
    Alert.alert('Product Image', 'Choose image source', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickImage },
      { text: 'Remove Image', style: 'destructive', onPress: () => setImageUri(undefined) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handleSave() {
    if (!name.trim()) { Alert.alert('Required', 'Product name is required.'); return; }
    if (!composition.trim()) { Alert.alert('Required', 'Composition is required.'); return; }
    const slide = parseInt(catalogSlide, 10);
    const validSlide = isNaN(slide) || slide < 1 || slide > TOTAL_SLIDES ? 0 : slide;
    setSaving(true);
    onSave({
      name: name.trim(),
      category,
      composition: composition.trim(),
      description: description.trim(),
      catalogSlide: validSlide,
      imageUri,
    });
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
        <View style={[styles.topBar, { borderBottomColor: colors.border, paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
            {product ? 'Edit Product' : 'New Product'}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.saveBtnText, { fontFamily: 'Inter_600SemiBold' }]}>
              {saving ? 'Saving…' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Product Image */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
              PRODUCT IMAGE
            </Text>
            <TouchableOpacity
              style={[styles.imagePicker, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={showImageOptions}
              activeOpacity={0.8}
            >
              {imageUri ? (
                <>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
                  <View style={styles.imageOverlay}>
                    <Feather name="camera" size={18} color="#fff" />
                    <Text style={[styles.imageOverlayText, { fontFamily: 'Inter_500Medium' }]}>Change</Text>
                  </View>
                </>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="image" size={32} color={colors.mutedForeground} />
                  <Text style={[styles.imagePlaceholderText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    Tap to upload image
                  </Text>
                  <Text style={[styles.imagePlaceholderSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    Camera or Photo Library
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Name */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>PRODUCT NAME *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Beporiz"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>CATEGORY</Text>
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

          {/* Composition */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>COMPOSITION *</Text>
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

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>DESCRIPTION</Text>
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

          {/* Catalog Slide */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
              CATALOG SLIDE (1–90, leave 0 for none)
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
              value={catalogSlide}
              onChangeText={setCatalogSlide}
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
            />
            {catalogPreviewUrl && (
              <View style={[styles.slidePreviewBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Image
                  source={{ uri: catalogPreviewUrl }}
                  style={styles.slidePreview}
                  contentFit="contain"
                  transition={200}
                />
                <Text style={[styles.slidePreviewLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  Slide {previewSlide} preview
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  closeBtn: { padding: 4, width: 44 },
  title: { fontSize: 17 },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontSize: 14 },
  scroll: { flex: 1 },
  form: { padding: 16, gap: 20 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  chips: { gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13 },
  imagePicker: { borderWidth: 1, borderRadius: 16, overflow: 'hidden', height: 180 },
  imagePreview: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8,
  },
  imageOverlayText: { color: '#fff', fontSize: 13 },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePlaceholderText: { fontSize: 14 },
  imagePlaceholderSub: { fontSize: 12, opacity: 0.6 },
  slidePreviewBox: { borderWidth: 1, borderRadius: 12, overflow: 'hidden', marginTop: 4 },
  slidePreview: { width: '100%', height: 160 },
  slidePreviewLabel: { textAlign: 'center', fontSize: 12, paddingVertical: 6 },
});
