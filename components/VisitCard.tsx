import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Visit, Product } from '@/types';
import { useColors } from '@/hooks/useColors';

interface VisitCardProps {
  visit: Visit;
  products: Product[];
  onToggle: () => void;
  onDelete: () => void;
  onAcceptProduct: (productId: string) => void;
}

function formatTime(time: string) {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function VisitCard({ visit, products, onToggle, onDelete, onAcceptProduct }: VisitCardProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const date = new Date(visit.date);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  const showProducts = (visit.showProducts ?? [])
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as Product[];

  const hasProducts = showProducts.length > 0;
  const timeLabel = formatTime(visit.time ?? '');

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: visit.completed ? colors.success + '40' : colors.border }]}>
      {/* Main row */}
      <View style={styles.mainRow}>
        <TouchableOpacity
          style={[styles.check, { borderColor: visit.completed ? colors.success : colors.border, backgroundColor: visit.completed ? colors.success : 'transparent' }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle(); }}
        >
          {visit.completed && <Text style={styles.checkMark}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.info} onPress={() => hasProducts && setExpanded(e => !e)} activeOpacity={0.75}>
          <Text style={[styles.name, { color: visit.completed ? colors.mutedForeground : colors.foreground, fontFamily: 'Inter_600SemiBold', textDecorationLine: visit.completed ? 'line-through' : 'none' }]} numberOfLines={1}>
            Dr. {visit.doctorName}
          </Text>
          {visit.doctorClinic ? (
            <Text style={[styles.clinic, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>{visit.doctorClinic}</Text>
          ) : null}
          <View style={styles.metaRow}>
            <Text style={[styles.date, { color: isToday ? colors.accent : colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              📅 {isToday ? 'Today' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
            {timeLabel && (
              <Text style={[styles.time, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
                ⏰ {timeLabel}
              </Text>
            )}
          </View>
          {hasProducts && (
            <Text style={[styles.productCount, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
              💊 {showProducts.length} product{showProducts.length !== 1 ? 's' : ''} to show  {expanded ? '▲' : '▼'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Expanded products */}
      {expanded && hasProducts && (
        <View style={[styles.productsSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.productsSectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
            Tap ✅ if the doctor likes/prescribes a product:
          </Text>
          {showProducts.map(product => {
            const accepted = (visit.acceptedProducts ?? []).includes(product.id);
            return (
              <View key={product.id} style={[styles.productRow, { backgroundColor: accepted ? colors.success + '12' : colors.background, borderColor: accepted ? colors.success : colors.border }]}>
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{product.name}</Text>
                  <Text style={[styles.productCat, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{product.category}</Text>
                </View>
                {product.catalogSlide > 0 && (
                  <TouchableOpacity
                    style={[styles.catalogBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' }]}
                    onPress={() => router.push({ pathname: '/catalog', params: { slide: product.catalogSlide.toString() } })}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={[styles.catalogBtnText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>📖 Catalogue</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onAcceptProduct(product.id); }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.productCheck}>{accepted ? '✅' : '⬜'}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
          {(visit.acceptedProducts ?? []).length > 0 && (
            <Text style={[styles.acceptedNote, { color: colors.success, fontFamily: 'Inter_500Medium' }]}>
              ✅ {visit.acceptedProducts.length} product{visit.acceptedProducts.length !== 1 ? 's' : ''} added to doctor's prescribed list
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, marginBottom: 8, overflow: 'hidden' },
  mainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkMark: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 15 },
  clinic: { fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2, flexWrap: 'wrap' },
  date: { fontSize: 12 },
  time: { fontSize: 12 },
  productCount: { fontSize: 12, marginTop: 4 },
  deleteIcon: { fontSize: 20, marginTop: 2 },
  productsSection: { borderTopWidth: 1, padding: 12, gap: 8 },
  productsSectionTitle: { fontSize: 12, marginBottom: 4 },
  productRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1, gap: 8 },
  productInfo: { flex: 1 },
  productName: { fontSize: 13 },
  productCat: { fontSize: 11 },
  catalogBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  catalogBtnText: { fontSize: 11 },
  productCheck: { fontSize: 22 },
  acceptedNote: { fontSize: 12, marginTop: 4 },
});
