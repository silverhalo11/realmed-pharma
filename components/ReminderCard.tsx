import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Reminder } from '@/types';
import { useColors } from '@/hooks/useColors';

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: () => void;
  onDelete: () => void;
}

export function ReminderCard({ reminder, onToggle, onDelete }: ReminderCardProps) {
  const colors = useColors();
  const date = new Date(reminder.date);
  const isPast = date < new Date() && !reminder.done;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: reminder.done ? colors.success + '40' : isPast ? colors.destructive + '30' : colors.border }]}>
      <TouchableOpacity
        style={[styles.check, { borderColor: reminder.done ? colors.success : colors.border, backgroundColor: reminder.done ? colors.success : 'transparent' }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle(); }}
      >
        {reminder.done && <Text style={styles.checkMark}>✓</Text>}
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={[styles.text, { color: reminder.done ? colors.mutedForeground : colors.foreground, fontFamily: 'Inter_600SemiBold', textDecorationLine: reminder.done ? 'line-through' : 'none' }]} numberOfLines={2}>
          {reminder.text}
        </Text>
        <Text style={[styles.doctor, { color: colors.primary, fontFamily: 'Inter_500Medium' }]} numberOfLines={1}>
          👤 Dr. {reminder.doctorName}
        </Text>
        <Text style={[styles.date, { color: isPast && !reminder.done ? colors.destructive : colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          ⏰ {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
      </View>
      <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
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
  },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkMark: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
  info: { flex: 1, gap: 2 },
  text: { fontSize: 14 },
  doctor: { fontSize: 13 },
  date: { fontSize: 12 },
  deleteIcon: { fontSize: 20 },
});
