import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '@/constants/theme';
import { ScavengerHunt } from '@/components/leisure/ScavengerHunt';
import { ConsentQuiz } from '@/components/leisure/ConsentQuiz';
import { ScenarioBuilder } from '@/components/leisure/ScenarioBuilder';
import { AftercareTimer } from '@/components/leisure/AftercareTimer';
import { saveGameStep, loadGameProgress } from '@/lib/leisureVault';

export function LeisureGame() {
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const steps = [
    { component: <ScavengerHunt onNext={() => { handleNext(null); }} />, label: 'Scavenger Hunt' },
    { component: <ConsentQuiz onNext={(answers: any) => { handleNext(answers); }} />, label: 'Consent Quiz' },
    { component: <ScenarioBuilder onNext={(scenario: any) => { handleNext(scenario); }} />, label: 'Scenario Builder' },
    { component: <AftercareTimer onNext={() => { handleNext(null); }} />, label: 'Aftercare' },
  ];

  // Load any saved progress on mount
  useEffect(() => {
    (async () => {
      const progress = await loadGameProgress();
      const completedSteps = Object.keys(progress).map((k) => Number(k));
      if (completedSteps.length) {
        const maxCompleted = Math.max(...completedSteps);
        setStep(Math.min(maxCompleted + 1, steps.length - 1));
      }
      setLoaded(true);
    })();
  }, []);

  const handleNext = async (data: any) => {
    await saveGameStep(step, data);
    if (step < steps.length - 1) setStep(step + 1);
  };

  if (!loaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leisure Suite Larry</Text>
      <Text style={styles.subHeader}>Paso {step + 1} de {steps.length}: {steps[step].label}</Text>
      {steps[step].component}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  header: { fontSize: 24, fontFamily: fonts.displaySemi, color: colors.text, marginBottom: 8, textAlign: 'center' },
  subHeader: { fontSize: 16, fontFamily: fonts.body, color: colors.textMuted, marginBottom: 16, textAlign: 'center' },
});
