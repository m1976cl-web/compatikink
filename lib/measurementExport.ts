/**
 * Local plaintext/markdown export helpers.
 * The user copies or downloads; CompatKink never posts measurements to a shop API.
 */
import { Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export { MEASUREMENT_EXPORT_DISCLAIMER } from '@/lib/measurementDisclaimer';

export async function copyPlainText(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadPlainText(filename: string, text: string, mime = 'text/plain;charset=utf-8'): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof document === 'undefined') {
    void Clipboard.setStringAsync(text);
    return false;
  }
  try {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    void Clipboard.setStringAsync(text);
    return false;
  }
}
