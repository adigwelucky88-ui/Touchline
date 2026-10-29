import { colors, fontSize, radius, space, Text, useLayoutClass, type LayoutClass } from '@touchline/ui';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import type { ComponentProps, ComponentRef, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * One navigator, three shells: bottom tabs on phones, an icon rail on tablets,
 * and the prototype's full sidebar on wide screens.
 */

const DESTINATIONS = [
  { name: 'index', href: '/', icon: '◈', labelKey: 'discover' },
  { name: 'athletes', href: '/athletes', icon: '♙', labelKey: 'players' },
  { name: 'saved', href: '/saved', icon: '▱', labelKey: 'saved' },
  { name: 'career', href: '/career', icon: '▣', labelKey: 'career' },
] as const satisfies readonly { name: string; href: ComponentProps<typeof TabTrigger>['href']; icon: string; labelKey: string }[];

type NavButtonProps = TabTriggerSlotProps & {
  icon: string;
  label: string;
  layout: LayoutClass;
  ref?: Ref<ComponentRef<typeof Pressable>>;
};

function NavButton({ icon, label, layout, isFocused, ref, ...props }: NavButtonProps) {
  return (
    <Pressable
      ref={ref}
      {...props}
      accessibilityLabel={label}
      style={[styles.navButton, styles[`${layout}Button`], isFocused && layout !== 'compact' && styles.navButtonActive]}>
      <Text style={[styles.navIcon, isFocused && styles.navFocused]}>{icon}</Text>
      {layout !== 'medium' && (
        <Text style={[layout === 'compact' ? styles.tabLabel : styles.sideLabel, isFocused && styles.navFocused]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function Brand({ showName }: { showName: boolean }) {
  return (
    <View style={styles.brand}>
      <View style={styles.brandmark}>
        <Text style={styles.brandmarkText}>t</Text>
      </View>
      {showName && <Text style={styles.brandName}>touchline</Text>}
    </View>
  );
}

export function AppShell() {
  const layout = useLayoutClass();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const isCompact = layout === 'compact';

  return (
    <Tabs style={[styles.root, { flexDirection: isCompact ? 'column' : 'row' }]}>
      {!isCompact && (
        <View style={[styles.side, layout === 'expanded' ? styles.sidebar : styles.rail, { paddingTop: insets.top + space.xl }]}>
          <Brand showName={layout === 'expanded'} />
          {layout === 'expanded' && (
            <Text variant="eyebrow" muted style={styles.navLabel}>
              {t('world')}
            </Text>
          )}
        </View>
      )}
      <TabSlot style={styles.slot} />
      <TabList
        style={[
          isCompact ? styles.bottomBar : [styles.sideNav, layout === 'expanded' ? styles.sideNavExpanded : styles.sideNavRail],
          isCompact ? { paddingBottom: Math.max(insets.bottom, space.sm) } : { top: insets.top + (layout === 'expanded' ? 150 : 90) },
        ]}>
        {DESTINATIONS.map((destination) => (
          <TabTrigger key={destination.name} name={destination.name} href={destination.href} asChild>
            <NavButton icon={destination.icon} label={t(destination.labelKey)} layout={layout} />
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}

const SIDEBAR_WIDTH = 238;
const RAIL_WIDTH = 80;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  slot: { flex: 1 },
  side: { backgroundColor: colors.canvas, borderRightWidth: 1, borderColor: colors.border, paddingHorizontal: space.lg },
  sidebar: { width: SIDEBAR_WIDTH },
  rail: { width: RAIL_WIDTH, alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  brandmark: {
    width: 33,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.selected,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandmarkText: { color: colors.accent, fontSize: 30, fontStyle: 'italic', lineHeight: 34 },
  brandName: { fontSize: 24, fontWeight: '700', letterSpacing: -1 },
  navLabel: { marginTop: 47 },
  // TabList renders after the slot (so screens own focus order); the side variants are positioned over the side column.
  sideNav: { position: 'absolute', left: 0, flexDirection: 'column', gap: space.sm },
  sideNavExpanded: { width: SIDEBAR_WIDTH, paddingHorizontal: space.lg },
  sideNavRail: { width: RAIL_WIDTH, alignItems: 'center' },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(0,0,0,0.96)',
    paddingTop: space.sm,
  },
  navButton: { borderRadius: radius.md, alignItems: 'center' },
  compactButton: { flex: 1, gap: 3, paddingVertical: space.xs },
  mediumButton: { width: 52, height: 52, justifyContent: 'center' },
  expandedButton: { flexDirection: 'row', gap: space.md, paddingVertical: 13, paddingHorizontal: 14 },
  navButtonActive: { backgroundColor: colors.selected },
  navIcon: { fontSize: 20, color: colors.textMuted },
  navFocused: { color: colors.selectedText },
  tabLabel: { fontSize: 10, color: colors.textMuted },
  sideLabel: { fontSize: fontSize.sm + 1, fontWeight: '500', color: colors.textMuted },
});
