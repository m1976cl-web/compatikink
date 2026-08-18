/**
 * Node preload for vault verify tests — mocks AsyncStorage + RN/Expo bits.
 */
const Module = require('module');
const path = require('path');
const fs = require('fs');

global.__DEV__ = true;
global.process.env.EXPO_OS = global.process.env.EXPO_OS || 'web';

const memory = new Map();
global.__vaultTestMemory = memory;

const stubsDir = path.join(__dirname, '_stubs');
if (!fs.existsSync(stubsDir)) fs.mkdirSync(stubsDir, { recursive: true });

const asyncStub = path.join(stubsDir, 'async-storage.js');
fs.writeFileSync(
  asyncStub,
  `
const memory = global.__vaultTestMemory;
module.exports = {
  __esModule: true,
  default: {
    setItem: async (k, v) => { memory.set(String(k), String(v)); },
    getItem: async (k) => (memory.has(String(k)) ? memory.get(String(k)) : null),
    removeItem: async (k) => { memory.delete(String(k)); },
    multiRemove: async (keys) => { for (const k of keys) memory.delete(String(k)); },
    getAllKeys: async () => [...memory.keys()],
    clear: async () => memory.clear(),
  },
};
`
);

const secureStub = path.join(stubsDir, 'secure-store.js');
fs.writeFileSync(
  secureStub,
  `
const store = new Map();
module.exports = {
  setItemAsync: async (k, v) => store.set(k, v),
  getItemAsync: async (k) => store.get(k) ?? null,
  deleteItemAsync: async (k) => { store.delete(k); },
};
`
);

const constantsStub = path.join(stubsDir, 'expo-constants.js');
fs.writeFileSync(
  constantsStub,
  `module.exports = { default: { expoConfig: { extra: {} } }, expoConfig: { extra: {} } };`
);

const modulesCoreStub = path.join(stubsDir, 'expo-modules-core.js');
fs.writeFileSync(
  modulesCoreStub,
  `module.exports = { NativeModule: class {}, requireNativeModule: () => ({}) };`
);

const clipboardStub = path.join(stubsDir, 'expo-clipboard.js');
fs.writeFileSync(
  clipboardStub,
  `
module.exports = {
  setStringAsync: async () => true,
  getStringAsync: async () => '',
};
`
);

const safeAreaStub = path.join(stubsDir, 'safe-area-context.js');
fs.writeFileSync(
  safeAreaStub,
  `
const React = require('react');
module.exports = {
  SafeAreaView: ({ children, style }) => children,
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
};
`
);

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (
    request === '@react-native-async-storage/async-storage' ||
    request.includes('@react-native-async-storage/async-storage')
  ) {
    return asyncStub;
  }
  if (request === 'expo-secure-store' || request.endsWith('expo-secure-store')) {
    return secureStub;
  }
  if (request === 'expo-constants' || request.endsWith('expo-constants')) {
    return constantsStub;
  }
  if (request === 'expo-modules-core' || request.endsWith('expo-modules-core')) {
    return modulesCoreStub;
  }
  if (request === 'react-native-safe-area-context') {
    return safeAreaStub;
  }
  if (request === 'expo-clipboard' || request.endsWith('expo-clipboard')) {
    return clipboardStub;
  }
  if (request === 'react-native' || request.startsWith('react-native/')) {
    return originalResolveFilename.call(this, 'react-native-web', parent, isMain, options);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};
