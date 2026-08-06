import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { exportUserDataJSON, importUserDataJSON } from '@/lib/storage';

/**
 * useBackup.ts
 *
 * Hook para manejar la exportación e importación de backups cifrados con AES-GCM/PBKDF2.
 * Sustituye window.prompt() por un estado controlado para un modal nativo seguro.
 */
export function useBackup(onSuccess?: () => Promise<void>) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'export' | 'import' | null>(null);

  const requestPassphrase = useCallback((action: 'export' | 'import') => {
    setPendingAction(action);
    setPassphrase('');
    setShowPassphraseModal(true);
  }, []);

  const confirmPassphrase = useCallback(async () => {
    if (!passphrase || passphrase.length < 4) {
      Alert.alert('Contraseña inválida', 'Mínimo 4 caracteres.');
      return;
    }

    const currentAction = pendingAction;
    const currentPass = passphrase;

    setShowPassphraseModal(false);
    setPassphrase('');
    setPendingAction(null);

    if (currentAction === 'export') {
      setIsExporting(true);
      try {
        const json = await exportUserDataJSON(currentPass);
        await Clipboard.setStringAsync(json);
        Alert.alert('Backup listo 📦', 'El contenido cifrado ha sido copiado al portapapeles.');
      } catch (e: any) {
        Alert.alert('Error al exportar', e?.message || 'No se pudo exportar el backup.');
      } finally {
        setIsExporting(false);
      }
    } else if (currentAction === 'import') {
      setIsImporting(true);
      try {
        const str = await Clipboard.getStringAsync();
        if (!str) {
          Alert.alert('Portapapeles vacío', 'Copia primero tu backup cifrado.');
          return;
        }
        const count = await importUserDataJSON(str, currentPass);
        Alert.alert('Backup restaurado ✅', `Se restauraron ${count} registros en la bóveda local.`);
        if (onSuccess) await onSuccess();
      } catch (e: any) {
        Alert.alert('Error al importar', e?.message || 'Backup inválido o contraseña incorrecta.');
      } finally {
        setIsImporting(false);
      }
    }
  }, [passphrase, pendingAction, onSuccess]);

  const cancelPassphrase = useCallback(() => {
    setShowPassphraseModal(false);
    setPassphrase('');
    setPendingAction(null);
  }, []);

  return {
    isExporting,
    isImporting,
    passphrase,
    setPassphrase,
    showPassphraseModal,
    pendingAction,
    requestPassphrase,
    confirmPassphrase,
    cancelPassphrase,
  };
}
