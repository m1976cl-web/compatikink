import { Platform } from 'react-native';

export interface QIUIDevice {
  id: string;
  name: string;
  rssi: number;
  connected: boolean;
  locked: boolean;
  batteryLevel?: number;
}

export type QIUIEventType = 'deviceFound' | 'connected' | 'disconnected' | 'statusUpdate' | 'error';

export interface QIUIManager {
  isSupported(): boolean;
  requestPermissions(): Promise<boolean>;
  startScan(onDevice: (device: QIUIDevice) => void): Promise<void>;
  stopScan(): void;
  connect(deviceId: string): Promise<QIUIDevice>;
  disconnect(deviceId: string): Promise<void>;
  lock(deviceId: string): Promise<boolean>;
  unlock(deviceId: string): Promise<boolean>;
  getStatus(deviceId: string): Promise<QIUIDevice>;
  addEventListener(type: QIUIEventType, callback: (data: any) => void): () => void;
}

const QIUI_SERVICE_UUID = '0000fee9-0000-1000-8000-00805f9b34fb';
const QIUI_WRITE_CHAR = 'd44bc439-abfd-45a2-b575-925416129600';
const QIUI_NOTIFY_CHAR = 'd44bc439-abfd-45a2-b575-925416129601';

class MockQIUIManager implements QIUIManager {
  private listeners: Record<string, ((data: any) => void)[]> = {};
  private scanning = false;
  private scanTimeout: any;
  private connectedDevice: QIUIDevice | null = null;
  
  private mockDevices: QIUIDevice[] = [
    { id: 'mock-1', name: 'QIUI-CB6000S', rssi: -45, connected: false, locked: true, batteryLevel: 85 },
    { id: 'mock-2', name: 'QIUI-Cellmate2', rssi: -60, connected: false, locked: false, batteryLevel: 42 },
    { id: 'mock-3', name: 'QIUI-Nub4', rssi: -75, connected: false, locked: true, batteryLevel: 15 },
  ];

  private emit(event: QIUIEventType, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(data));
    }
  }

  isSupported(): boolean {
    return true;
  }

  async requestPermissions(): Promise<boolean> {
    return true;
  }

  async startScan(onDevice: (device: QIUIDevice) => void): Promise<void> {
    this.scanning = true;
    let index = 0;
    
    const scanNext = () => {
      if (!this.scanning) return;
      if (index < this.mockDevices.length) {
        const dev = this.mockDevices[index++];
        onDevice(dev);
        this.emit('deviceFound', dev);
        this.scanTimeout = setTimeout(scanNext, 1000 + Math.random() * 1000);
      }
    };
    
    this.scanTimeout = setTimeout(scanNext, 500);
  }

  stopScan(): void {
    this.scanning = false;
    if (this.scanTimeout) clearTimeout(this.scanTimeout);
  }

  async connect(deviceId: string): Promise<QIUIDevice> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const dev = this.mockDevices.find((d) => d.id === deviceId);
        if (!dev) return reject(new Error('Device not found'));
        
        dev.connected = true;
        this.connectedDevice = { ...dev };
        this.emit('connected', this.connectedDevice);
        resolve(this.connectedDevice);
      }, 1500);
    });
  }

  async disconnect(deviceId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const dev = this.mockDevices.find((d) => d.id === deviceId);
        if (dev) {
          dev.connected = false;
        }
        if (this.connectedDevice?.id === deviceId) {
          this.connectedDevice = null;
          this.emit('disconnected', { id: deviceId });
        }
        resolve();
      }, 500);
    });
  }

  async lock(deviceId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.connectedDevice?.id === deviceId) {
          this.connectedDevice.locked = true;
          this.emit('statusUpdate', this.connectedDevice);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  }

  async unlock(deviceId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.connectedDevice?.id === deviceId) {
          this.connectedDevice.locked = false;
          this.emit('statusUpdate', this.connectedDevice);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  }

  async getStatus(deviceId: string): Promise<QIUIDevice> {
    if (this.connectedDevice?.id === deviceId) {
      return { ...this.connectedDevice };
    }
    const dev = this.mockDevices.find((d) => d.id === deviceId);
    if (!dev) throw new Error('Device not found');
    return { ...dev };
  }

  addEventListener(type: QIUIEventType, callback: (data: any) => void): () => void {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(callback);
    return () => {
      this.listeners[type] = this.listeners[type].filter((cb) => cb !== callback);
    };
  }
}

class WebQIUIManager extends MockQIUIManager {
  // Uses mock by default, but you could implement real navigator.bluetooth here if needed
  // For now we'll stick with Mock to make development easier as requested.
}

export function createQIUIManager(): QIUIManager {
  return new MockQIUIManager();
}
