import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCatalogUrl } from '@/constants/seedData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TOTAL_SLIDES = 90;
const MAX_ZOOM = 5;

interface ZoomableSlideProps {
  uri: string;
  onZoomChange: (zoomed: boolean) => void;
}

function ZoomableSlide({ uri, onZoomChange }: ZoomableSlideProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTX = useSharedValue(0);
  const savedTY = useSharedValue(0);

  function resetZoom() {
    'worklet';
    scale.value = withSpring(1, { damping: 15 });
    savedScale.value = 1;
    translateX.value = withSpring(0, { damping: 15 });
    translateY.value = withSpring(0, { damping: 15 });
    savedTX.value = 0;
    savedTY.value = 0;
    runOnJS(onZoomChange)(false);
  }

  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      scale.value = Math.min(MAX_ZOOM, Math.max(1, savedScale.value * e.scale));
    })
    .onEnd(() => {
      if (scale.value <= 1.05) {
        resetZoom();
      } else {
        savedScale.value = scale.value;
        runOnJS(onZoomChange)(true);
      }
    });

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onUpdate(e => {
      if (savedScale.value > 1) {
        const maxX = (SCREEN_WIDTH * (savedScale.value - 1)) / 2;
        const maxY = (SCREEN_HEIGHT * (savedScale.value - 1)) / 2;
        translateX.value = Math.min(maxX, Math.max(-maxX, savedTX.value + e.translationX));
        translateY.value = Math.min(maxY, Math.max(-maxY, savedTY.value + e.translationY));
      }
    })
    .onEnd(() => {
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(250)
    .onEnd((_e, success) => {
      if (success) resetZoom();
    });

  const composed = Gesture.Simultaneous(
    Gesture.Race(doubleTap, Gesture.Tap().numberOfTaps(1)),
    pinch,
    pan
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.slide, animStyle]}>
        <Image
          source={{ uri }}
          style={styles.slideImage}
          contentFit="contain"
          placeholder={{ color: '#1e3a5f' }}
          transition={200}
          cachePolicy="memory-disk"
        />
      </Animated.View>
    </GestureDetector>
  );
}

export default function CatalogScreen() {
  const insets = useSafeAreaInsets();
  const { slide } = useLocalSearchParams<{ slide?: string }>();
  const initialSlide = slide ? Math.max(1, Math.min(parseInt(slide, 10), TOTAL_SLIDES)) : 1;
  const [current, setCurrent] = useState(initialSlide);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const flatRef = useRef<FlatList>(null);

  const slides = Array.from({ length: TOTAL_SLIDES }, (_, i) => i + 1);

  function goTo(n: number) {
    const next = Math.max(1, Math.min(n, TOTAL_SLIDES));
    setCurrent(next);
    flatRef.current?.scrollToIndex({ index: next - 1, animated: true });
  }

  return (
    <View style={styles.root}>
      <FlatList
        ref={flatRef}
        data={slides}
        keyExtractor={s => s.toString()}
        horizontal
        pagingEnabled
        scrollEnabled={scrollEnabled}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialSlide - 1}
        getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrent(idx + 1);
        }}
        renderItem={({ item }) => (
          <View style={styles.slideContainer}>
            <ZoomableSlide
              uri={getCatalogUrl(item)}
              onZoomChange={zoomed => setScrollEnabled(!zoomed)}
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
        <View style={styles.pageInfo}>
          <Text style={[styles.pageText, { fontFamily: 'Inter_500Medium' }]}>
            {current} / {TOTAL_SLIDES}
          </Text>
          {!scrollEnabled && (
            <Text style={styles.zoomHint}>Double-tap to reset zoom</Text>
          )}
        </View>
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
  root: { flex: 1, backgroundColor: '#000' },
  slideContainer: { width: SCREEN_WIDTH, flex: 1 },
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
  pageInfo: { alignItems: 'center' },
  pageText: { color: '#fff', fontSize: 16 },
  zoomHint: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 },
});
