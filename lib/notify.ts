import { Alert, Platform } from 'react-native';

/** Cross-platform alert — RN Web ignores Alert button callbacks and often drops plain alerts. */
export function notify(title: string, message: string): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
