const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable async imports (code splitting) for Web and Native
config.transformer.asyncRequireModulePath = require.resolve('metro-runtime/src/modules/asyncRequire');

module.exports = config;
