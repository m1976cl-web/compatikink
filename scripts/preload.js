const Module = require('module');
const React = require('react');

// Define global __DEV__ for Expo / React Native environment
global.__DEV__ = true;
global.routerCalls = [];

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'react-native' || request.startsWith('react-native/')) {
    return originalResolveFilename.call(this, 'react-native-web', parent, isMain, options);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

// Mock react-native-safe-area-context for Node environment
try {
  const safeAreaPath = require.resolve('react-native-safe-area-context');
  require.cache[safeAreaPath] = {
    id: safeAreaPath,
    filename: safeAreaPath,
    loaded: true,
    exports: {
      SafeAreaView: (props) => {
        const { View } = require('react-native-web');
        return React.createElement(View, props);
      },
      SafeAreaProvider: (props) => {
        const { View } = require('react-native-web');
        return React.createElement(View, props);
      },
      useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    },
  };
} catch (e) {
  // Ignore if resolve fails
}

// Mock expo-router for Node environment
try {
  const routerPath = require.resolve('expo-router');
  require.cache[routerPath] = {
    id: routerPath,
    filename: routerPath,
    loaded: true,
    exports: {
      useRouter: () => ({
        push: (path) => { global.routerCalls.push({ action: 'push', path }); },
        replace: (path) => { global.routerCalls.push({ action: 'replace', path }); },
        back: () => { global.routerCalls.push({ action: 'back' }); },
      }),
      usePathname: () => '/compass',
      Link: (props) => React.createElement('a', props),
    },
  };
} catch (e) {
  // Ignore if resolve fails
}

// Mock expo-secure-store for Node environment
try {
  const secureStorePath = require.resolve('expo-secure-store');
  const store = new Map();
  require.cache[secureStorePath] = {
    id: secureStorePath,
    filename: secureStorePath,
    loaded: true,
    exports: {
      setItemAsync: async (k, v) => store.set(k, v),
      getItemAsync: async (k) => store.get(k) ?? null,
      deleteItemAsync: async (k) => store.delete(k),
    },
  };
} catch (e) {
  // Ignore
}
