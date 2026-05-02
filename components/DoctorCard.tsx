import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Doctor } from '@/types';
import { useColors } from '@/hooks/useColors';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: () => void;
}

export function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary + '18' }]}>
        <Text style={[styles.avatarText, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
          {doctor.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
          Dr. {doctor.name}
        </Text>
        {doctor.degree ? (
          <Text style={[styles.degree, { color: colors.primary, fontFamily: 'Inter_500Medium' }]} numberOfLines={1}>
            {doctor.degree}
          </Text>
        ) : null}
        {doctor.clinic ? (
          <Text style={[styles.meta, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
            {doctor.clinic}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.arrow, { color: colors.mutedForeground }]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 15 },
  degree: { fontSize: 13 },
  meta: { fontSize: 12 },
  arrow: { fontSize: 24, lineHeight: 28 },
});
