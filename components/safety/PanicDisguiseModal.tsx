import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import {
  subscribePanicDisguise,
  dismissPanicDisguise,
  isPanicDisguiseActive,
  getPanicSettings,
  PanicDisguiseSettings,
} from '@/lib/panicDisguise';
import { triggerLightHaptic, triggerSelectionHaptic } from '@/lib/haptics';

export function PanicDisguiseModal() {
  const [isActive, setIsActive] = useState<boolean>(() => isPanicDisguiseActive());
  const [settings, setSettings] = useState<PanicDisguiseSettings | null>(null);

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [calcPrev, setCalcPrev] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcClearNext, setCalcClearNext] = useState<boolean>(false);
  const [secretEntryBuffer, setSecretEntryBuffer] = useState<string>('');
  const [titleTapCount, setTitleTapCount] = useState<number>(0);

  // Notes State
  const [notesList, setNotesList] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: '1', text: 'Comprar café y leche descremada', done: true },
    { id: '2', text: 'Revisar reporte financiero trimestral', done: false },
    { id: '3', text: 'Confirmar reunión de las 16:00 hrs', done: false },
    { id: '4', text: 'Renovar suscripción de servicios', done: false },
  ]);
  const [newNoteInput, setNewNoteInput] = useState('');

  useEffect(() => {
    getPanicSettings().then(setSettings);
    const unsubscribe = subscribePanicDisguise((active) => {
      setIsActive(active);
      if (active) {
        setCalcDisplay('0');
        setCalcPrev(null);
        setCalcOp(null);
        setSecretEntryBuffer('');
        setTitleTapCount(0);
      }
    });
    return unsubscribe;
  }, []);

  // --- Calculator Handlers ---
  const handleDigit = (digit: string) => {
    triggerSelectionHaptic();
    setSecretEntryBuffer((prev) => (prev + digit).slice(-10));

    if (calcDisplay === '0' || calcClearNext) {
      setCalcDisplay(digit);
      setCalcClearNext(false);
    } else {
      setCalcDisplay(calcDisplay + digit);
    }
  };

  const handleOperator = (op: string) => {
    triggerLightHaptic();
    const current = parseFloat(calcDisplay);
    if (calcPrev !== null && calcOp) {
      const result = evaluateCalc(calcPrev, current, calcOp);
      setCalcDisplay(String(result));
      setCalcPrev(result);
    } else {
      setCalcPrev(current);
    }
    setCalcOp(op);
    setCalcClearNext(true);
  };

  const evaluateCalc = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    triggerLightHaptic();
    const targetCode = settings?.secretCode || '1976';

    // Check secret PIN match
    if (calcDisplay === targetCode || secretEntryBuffer.includes(targetCode)) {
      dismissPanicDisguise();
      return;
    }

    if (calcPrev !== null && calcOp) {
      const current = parseFloat(calcDisplay);
      const result = evaluateCalc(calcPrev, current, calcOp);
      setCalcDisplay(String(result));
      setCalcPrev(null);
      setCalcOp(null);
      setCalcClearNext(true);
    }
  };

  const handleClear = () => {
    triggerLightHaptic();
    setCalcDisplay('0');
    setCalcPrev(null);
    setCalcOp(null);
    setCalcClearNext(false);
    setSecretEntryBuffer('');
  };

  const handleTitleTap = () => {
    const nextCount = titleTapCount + 1;
    setTitleTapCount(nextCount);
    if (nextCount >= 3) {
      dismissPanicDisguise();
    }
  };

  if (!isActive) return null;

  return (
    <Modal visible={isActive} transparent={false} animationType="none" onRequestClose={() => {}}>
      <View style={styles.fullscreenContainer}>
        {settings?.disguiseMode === 'notes' ? (
          /* ───────────── NOTES DISGUISE ───────────── */
          <View style={styles.notesContainer}>
            <View style={styles.notesHeader}>
              <TouchableOpacity onPress={handleTitleTap} activeOpacity={0.9}>
                <Text style={styles.notesTitle}>📝 Mis Notas & Tareas</Text>
              </TouchableOpacity>
              <Text style={styles.notesSubtitle}>Sincronizado localmente</Text>
            </View>

            <View style={styles.addNoteRow}>
              <TextInput
                style={styles.addNoteInput}
                placeholder="Escribir nueva nota rápida..."
                placeholderTextColor="#71717a"
                value={newNoteInput}
                onChangeText={setNewNoteInput}
              />
              <TouchableOpacity
                style={styles.addNoteBtn}
                onPress={() => {
                  if (!newNoteInput.trim()) return;
                  if (newNoteInput.trim() === (settings?.secretCode || '1976')) {
                    dismissPanicDisguise();
                    return;
                  }
                  setNotesList([
                    ...notesList,
                    { id: String(Date.now()), text: newNoteInput.trim(), done: false },
                  ]);
                  setNewNoteInput('');
                }}
              >
                <Text style={styles.addNoteBtnText}>+ Agregar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.notesList}>
              {notesList.map((n) => (
                <TouchableOpacity
                  key={n.id}
                  style={styles.noteItem}
                  onPress={() =>
                    setNotesList((prev) =>
                      prev.map((item) => (item.id === n.id ? { ...item, done: !item.done } : item))
                    )
                  }
                >
                  <Text style={styles.noteCheck}>{n.done ? '☑️' : '⬜'}</Text>
                  <Text style={[styles.noteText, n.done && styles.noteTextDone]}>{n.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.notesFooter}>
              <Text style={styles.notesFooterText}>Última edición: Hoy, 11:24 AM</Text>
            </View>
          </View>
        ) : (
          /* ───────────── CALCULATOR DISGUISE ───────────── */
          <View style={styles.calcContainer}>
            {/* Top Bar with Discrete Title */}
            <TouchableOpacity style={styles.calcHeader} onPress={handleTitleTap} activeOpacity={0.8}>
              <Text style={styles.calcTitle}>Calculadora</Text>
            </TouchableOpacity>

            {/* Display */}
            <View style={styles.displayArea}>
              <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
                {calcDisplay}
              </Text>
            </View>

            {/* Keypad Grid */}
            <View style={styles.keypad}>
              <View style={styles.calcRow}>
                <TouchableOpacity style={[styles.calcKey, styles.calcKeyFunc]} onPress={handleClear}>
                  <Text style={styles.calcKeyFuncText}>AC</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcKey, styles.calcKeyFunc]}
                  onPress={() => setCalcDisplay(String(-parseFloat(calcDisplay)))}
                >
                  <Text style={styles.calcKeyFuncText}>+/-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcKey, styles.calcKeyFunc]}
                  onPress={() => setCalcDisplay(String(parseFloat(calcDisplay) / 100))}
                >
                  <Text style={styles.calcKeyFuncText}>%</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.calcKey, styles.calcKeyOp]} onPress={() => handleOperator('÷')}>
                  <Text style={styles.calcKeyOpText}>÷</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.calcRow}>
                <TouchableOpacity style={styles.calcKey} onPress={() => handleDigit('7')}>
                  <Text style={styles.calcKeyText}>7</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.calcKey} onPress={() => handleDigit('8')}>
                  <Text style={styles.calcKeyText}>8</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.calcKey} onPress={() => handleDigit('9')}>
                  <Text style={styles.calcKeyText}>9</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.calcKey, styles.calcKeyOp]} onPress={() => handleOperator('×')}>
                  <Text style={styles.calcKeyOpText}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.calcRow}>
                <TouchableOpacity style={styles.calcKey} onPress={() => handleDigit('4')}>
                  <Text style={styles.calcKeyText}>4</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.calcKey} onPress={() => handleDigit('5')}>
                  <Text style={styles.calcKeyText}>5</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.calcKey} onPress={() => handleDigit('6')}>
                  <Text style={styles.calcKeyText}>6</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.calcKey, styles.calcKeyOp]} onPress={() => handleOperator('-')}>
                  <Text style={styles.calcKeyOpText}>−</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.calcRow}>
                <TouchableOpacity style={styles.calcKey} onPress={() => handleDigit('1')}>
                  <Text style={styles.calcKeyText}>1</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.calcKey} onPress={() => handleDigit('2')}>
                  <Text style={styles.calcKeyText}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.calcKey} onPress={() => handleDigit('3')}>
                  <Text style={styles.calcKeyText}>3</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.calcKey, styles.calcKeyOp]} onPress={() => handleOperator('+')}>
                  <Text style={styles.calcKeyOpText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.calcRow}>
                <TouchableOpacity style={[styles.calcKey, styles.calcKeyZero]} onPress={() => handleDigit('0')}>
                  <Text style={styles.calcKeyText}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.calcKey} onPress={() => handleDigit('.')}>
                  <Text style={styles.calcKeyText}>.</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.calcKey, styles.calcKeyOp]} onPress={handleEquals}>
                  <Text style={styles.calcKeyOpText}>=</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    zIndex: 99999,
  },
  // Calculator Styles
  calcContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  calcHeader: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  calcTitle: {
    color: '#3f3f46',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  displayArea: {
    minHeight: 110,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  displayText: {
    color: '#ffffff',
    fontSize: 64,
    fontWeight: '300',
  },
  keypad: {
    gap: 12,
  },
  calcRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  calcKey: {
    flex: 1,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcKeyZero: {
    flex: 2.1,
    alignItems: 'flex-start',
    paddingLeft: 28,
  },
  calcKeyText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '400',
  },
  calcKeyFunc: {
    backgroundColor: '#52525b',
  },
  calcKeyFuncText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '500',
  },
  calcKeyOp: {
    backgroundColor: '#f97316',
  },
  calcKeyOpText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '500',
  },

  // Notes Styles
  notesContainer: {
    flex: 1,
    backgroundColor: '#18181b',
    paddingTop: Platform.OS === 'ios' ? 50 : 28,
    paddingHorizontal: 20,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  notesHeader: {
    marginBottom: 16,
  },
  notesTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  notesSubtitle: {
    color: '#71717a',
    fontSize: 12,
    marginTop: 2,
  },
  addNoteRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  addNoteInput: {
    flex: 1,
    backgroundColor: '#27272a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
  },
  addNoteBtn: {
    backgroundColor: '#3f3f46',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  addNoteBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  notesList: {
    gap: 10,
    paddingBottom: 40,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  noteCheck: {
    fontSize: 16,
  },
  noteText: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
  },
  noteTextDone: {
    color: '#71717a',
    textDecorationLine: 'line-through',
  },
  notesFooter: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    alignItems: 'center',
  },
  notesFooterText: {
    color: '#52525b',
    fontSize: 11,
  },
});
