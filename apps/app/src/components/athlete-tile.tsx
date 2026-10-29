import type { AthleteSummary } from '@touchline/core';
import { Avatar, colors, radius, space, Text } from '@touchline/ui';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { countryName, positionLabelKey } from '@/features/labels';

export function AthleteTile({ athlete }: { athlete: AthleteSummary }) {
  const { t, i18n } = useTranslation();

  return (
    <Link href={{ pathname: '/athletes/[handle]', params: { handle: athlete.handle } }} asChild>
      <Pressable style={({ pressed }) => [styles.tile, pressed && styles.pressed]} accessibilityRole="link">
        <Avatar name={athlete.displayName} size={43} />
        <Text variant="heading" style={styles.name}>
          {athlete.displayName}
        </Text>
        <Text variant="caption" muted>
          {t(positionLabelKey(athlete.position))} · {countryName(athlete.country, i18n.language)}
        </Text>
        {athlete.currentOrganization && (
          <Text variant="caption" muted>
            {athlete.currentOrganization}
          </Text>
        )}
        <Text style={styles.arrow} muted>
          ↗
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 160,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.xs,
  },
  pressed: { opacity: 0.8 },
  name: { marginTop: space.md },
  arrow: { position: 'absolute', top: space.lg, right: space.lg },
});
