import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { exportEncryptedBackup, importEncryptedBackup, downloadBackupAsFile } from '@/lib/backupManager';
import { VaultLockGate } from '@/components/VaultLockGate';

export default function BackupScreen() {
  const [exportPassphrase, setExportPassphrase] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  const [exporting, setExporting] = useState(false);
  const [backupString, setBackupString] = useState('');

  const [importPassphrase, setImportPassphrase] = useState('');
  const [importInput, setImportInput] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    if (!exportPassphrase) {
      setExportStatus('Ingresa una contraseña para cifrar el backup.');
      return;
    }
    setExporting(true);
    setExportStatus('Generando backup...');
    try {
      const backup = await exportEncryptedBackup(exportPassphrase);
      setBackupString(backup);
      setExportStatus('Backup generado exitosamente.');
      downloadBackupAsFile(backup);
    } catch (error: any) {
      setExportStatus('Error: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importPassphrase) {
      setImportStatus('Ingresa la contraseña para descifrar.');
      return;
    }
    if (!importInput) {
      setImportStatus('Ingresa la cadena del backup.');
      return;
    }
    
    setImporting(true);
    setImportStatus('Restaurando backup...');
    try {
      const result = await importEncryptedBackup(importInput.trim(), importPassphrase);
      setImportStatus(`Backup restaurado: ${result.restored} claves restauradas, ${result.skipped} omitidas.`);
      if (Platform.OS === 'web') {
        window.alert(`Restauración completa.\nRestaurados: ${result.restored}`);
      } else {
        Alert.alert('Éxito', `Backup restaurado: ${result.restored} claves restauradas.`);
      }
    } catch (error: any) {
      setImportStatus('Error: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <VaultLockGate>
      <ScreenContainer title="Backup Cifrado" subtitle="Exporta e importa tu bóveda completa (Zero-Knowledge)">
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.warningBanner}>
            <Text style={styles.warningTitle}>⚠️ Advertencia</Text>
            <Text style={styles.warningText}>
              Mantén tu backup y tu contraseña seguros. Si pierdes la contraseña, tus datos serán irrecuperables. 
              Restaurar un backup sobrescribirá cualquier dato actual con el mismo nombre.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exportar Bóveda</Text>
            <Text style={styles.description}>Cifra todos tus datos locales con una contraseña maestra.</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Contraseña del backup..."
              placeholderTextColor={colors.textDim}
              secureTextEntry
              value={exportPassphrase}
              onChangeText={setExportPassphrase}
            />
            
            <Button 
              title={exporting ? "Exportando..." : "Exportar Backup Cifrado"} 
              onPress={handleExport} 
              disabled={exporting} 
            />
            
            {exportStatus ? <Text style={styles.statusText}>{exportStatus}</Text> : null}

            {backupString ? (
              <View style={styles.backupResult}>
                <Text style={styles.backupLabel}>Cadena de Backup (se descargó como archivo si estás en Web):</Text>
                <TextInput 
                  style={styles.backupTextArea} 
                  multiline 
                  editable={false} 
                  value={backupString} 
                />
              </View>
            ) : null}
          </View>

          <View style={styles.separator} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Importar Bóveda</Text>
            <Text style={styles.description}>Pega la cadena de texto de tu backup para restaurar los datos.</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Contraseña del backup..."
              placeholderTextColor={colors.textDim}
              secureTextEntry
              value={importPassphrase}
              onChangeText={setImportPassphrase}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Pega la cadena del backup aquí (ckbak1:...)"
              placeholderTextColor={colors.textDim}
              multiline
              value={importInput}
              onChangeText={setImportInput}
            />
            
            <Button 
              title={importing ? "Restaurando..." : "Restaurar Backup"} 
              onPress={handleImport} 
              disabled={importing}
              variant="danger"
            />
            
            {importStatus ? <Text style={styles.statusText}>{importStatus}</Text> : null}
          </View>

        </ScrollView>
      </ScreenContainer>
    </VaultLockGate>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  warningBanner: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  warningTitle: {
    color: colors.danger,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  warningText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.lg,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textDim,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  backupResult: {
    marginTop: spacing.md,
  },
  backupLabel: {
    color: colors.textDim,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  backupTextArea: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    height: 100,
    textAlignVertical: 'top',
  },
  statusText: {
    marginTop: spacing.sm,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  separator: {
    height: spacing.xl,
  }
});
