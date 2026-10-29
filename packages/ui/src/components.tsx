import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps as RNTextProps,
  type ViewStyle,
} from 'react-native';

import { colors, fontSize, radius, space } from './tokens';

type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'caption' | 'eyebrow';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  muted?: boolean;
  accent?: boolean;
}

export function Text({ variant = 'body', muted, accent, style, ...props }: TextProps) {
  return (
    <RNText
      {...props}
      style={[textStyles.base, textStyles[variant], muted && textStyles.muted, accent && textStyles.accent, style]}
    />
  );
}

const textStyles = StyleSheet.create({
  base: { color: colors.text, fontSize: fontSize.md },
  display: { fontSize: fontSize.display, fontWeight: '800', textTransform: 'uppercase', lineHeight: fontSize.display * 1.05 },
  title: { fontSize: fontSize.xxl, fontWeight: '700', textTransform: 'uppercase' },
  heading: { fontSize: fontSize.lg, fontWeight: '700' },
  body: { fontSize: fontSize.md, lineHeight: fontSize.md * 1.5 },
  caption: { fontSize: fontSize.sm, lineHeight: fontSize.sm * 1.5 },
  eyebrow: { fontSize: fontSize.xs, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase' },
  muted: { color: colors.textMuted },
  accent: { color: colors.accent },
});

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, variant = 'primary', style, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      style={({ pressed }) => [buttonStyles.base, buttonStyles[variant], pressed && buttonStyles.pressed, style]}>
      <RNText style={[buttonStyles.label, variant === 'primary' ? buttonStyles.primaryLabel : buttonStyles.otherLabel]}>
        {label}
      </RNText>
    </Pressable>
  );
}

const buttonStyles = StyleSheet.create({
  base: { paddingVertical: space.md, paddingHorizontal: space.lg, borderRadius: radius.sm, alignSelf: 'flex-start' },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.borderStrong },
  ghost: { backgroundColor: 'transparent' },
  pressed: { opacity: 0.8 },
  label: { fontSize: fontSize.sm, fontWeight: '700' },
  primaryLabel: { color: colors.accentInk },
  otherLabel: { color: colors.text },
});

export interface ChipProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  selected?: boolean;
}

export function Chip({ label, selected, ...props }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      {...props}
      style={[chipStyles.base, selected && chipStyles.selected]}>
      <RNText style={[chipStyles.label, selected && chipStyles.selectedLabel]}>{label}</RNText>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  base: {
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
  },
  selected: { backgroundColor: colors.selected, borderColor: colors.selectedBorder },
  label: { color: colors.textMuted, fontSize: fontSize.sm },
  selectedLabel: { color: colors.selectedText },
});

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[avatarStyles.base, { width: size, height: size, borderRadius: size / 2 }]}>
      <RNText style={[avatarStyles.label, { fontSize: size * 0.34 }]}>{initials(name)}</RNText>
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  base: { backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.accentInk, fontWeight: '700' },
});

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[cardStyles.base, style]}>{children}</View>;
}

const cardStyles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg,
  },
});

export function Badge({ label }: { label: string }) {
  return (
    <View style={badgeStyles.base}>
      <RNText style={badgeStyles.label}>{label}</RNText>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  base: { backgroundColor: colors.badge, paddingVertical: space.xs + 2, paddingHorizontal: space.md, borderRadius: radius.sm },
  label: { color: colors.selectedText, fontSize: fontSize.xs },
});
