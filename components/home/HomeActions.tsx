import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { Section } from '@/components/Section';
import { spacing } from '@/constants/theme';
import { Session } from '@/types';

interface HomeActionsProps {
  sessions: Session[];
  onOpenPolyComparator: () => void;
  onOpenTrendsModal: () => void;
  onLogout: () => void;
  onPanicWipe: () => void;
}

export function HomeActions({
  sessions,
  onOpenPolyComparator,
  onOpenTrendsModal,
  onLogout,
  onPanicWipe,
}: HomeActionsProps) {
  return (
    <Section title="Cuenta">
      <View style={styles.interactivePanel}>
        {sessions.filter((s) => s.status === 'complete').length >= 2 ? (
          <Button
            title="Comparar parejas"
            variant="secondary"
            onPress={onOpenPolyComparator}
          />
        ) : null}
        <Button
          title="Tendencias de comunidad"
          variant="secondary"
          onPress={onOpenTrendsModal}
        />
        <Button title="Cerrar sesión" variant="ghost" onPress={onLogout} />
        <Button title="Borrado de pánico" variant="danger" onPress={onPanicWipe} />
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  interactivePanel: { gap: spacing.md },
});
