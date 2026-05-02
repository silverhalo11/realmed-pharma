import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCatalogUrl } from '@/constants/seedData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_SLIDES = 90;

export default function CatalogScreen() {
  const insets = useSafeAreaInsets();
  const { slide } = useLocalSearchParams<{ slide?: string }>();
  const initialSlide = slide ? Math.max(1, Math.min(parseInt(slide, 10), TOTAL_SLIDES)) : 1;
  const [current, setCurrent] = useState(initialSlide);
  const flatRef = useRef<FlatList>(null);

  const slides = Array.from({ length: TOTAL_SLIDES }, (_, i) => i + 1);

  function goTo(n: number) {
    const next = Math.max(1, Math.min(n, TOTAL_SLIDES));
    setCurrent(next);
    flatRef.current?.scrollToIndex({ index: next - 1, animated: true });
  }

  return (
    <View style={[styles.root, { backgroundColor: '#000' }]}>
      <FlatList
        ref={flatRef}
        data={slides}
        keyExtractor={s => s.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialSlide - 1}
        getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrent(idx + 1);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={{ uri: getCatalogUrl(item) }}
              style={styles.slideImage}
              contentFit="contain"
              placeholder={{ color: '#1e3a5f' }}
              transition={200}
              cachePolicy="memory-disk"
            />
          </View>
        )}
      />

      <View style={[styles.controls, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 8) }]}>
        <TouchableOpacity
          onPress={() => goTo(current - 1)}
          disabled={current <= 1}
          style={[styles.navBtn, { opacity: current <= 1 ? 0.3 : 1 }]}
        >
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.pageText, { fontFamily: 'Inter_500Medium' }]}>
          {current} / {TOTAL_SLIDES}
        </Text>
        <TouchableOpacity
          onPress={() => goTo(current + 1)}
          disabled={current >= TOTAL_SLIDES}
          style={[styles.navBtn, { opacity: current >= TOTAL_SLIDES ? 0.3 : 1 }]}
        >
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  slide: { width: SCREEN_WIDTH, flex: 1, alignItems: 'center', justifyContent: 'center' },
  slideImage: { width: SCREEN_WIDTH, height: '100%' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  navBtn: { padding: 8 },
  navText: { fontSize: 40, color: '#fff', lineHeight: 48 },
  pageText: { color: '#fff', fontSize: 16 },
});
