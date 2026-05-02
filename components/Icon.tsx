import React from 'react';
import { Text, TextStyle } from 'react-native';

const ICONS: Record<string, string> = {
  'search': '🔍',
  'users': '👥',
  'user': '👤',
  'user-plus': '👤',
  'package': '📦',
  'shopping-bag': '🛍️',
  'shopping-cart': '🛒',
  'map-pin': '📍',
  'map': '🗺️',
  'bell': '🔔',
  'calendar': '📅',
  'book-open': '📖',
  'clock': '⏰',
  'phone': '📞',
  'award': '🎓',
  'activity': '💊',
  'file-text': '📝',
  'home': '🏠',
  'log-out': '🚪',
  'share-2': '📤',
  'edit-2': '✏️',
  'trash-2': '🗑️',
  'plus': '+',
  'minus': '−',
  'check': '✓',
  'x': '✕',
  'chevron-right': '›',
  'chevron-left': '‹',
  'chevron-up': '⌃',
  'chevron-down': '⌄',
  'star': '⭐',
  'info': 'ℹ️',
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export function Icon({ name, size = 20, color, style }: IconProps) {
  const emoji = ICONS[name] ?? '●';
  return (
    <Text style={[{ fontSize: size * 0.85, color, lineHeight: size * 1.2, textAlign: 'center' }, style]}>
      {emoji}
    </Text>
  );
}
