// CommonJS config para Expo: sólo inserta la clave GEMINI si existe.
let GEMINI_KEY;
try {
  const local = require('./local.secrets.json');
  GEMINI_KEY = local.GEMINI_API_KEY;
} catch (e) {}

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra || {}),
    GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || GEMINI_KEY || (config.extra && config.extra.GEMINI_API_KEY)
  }
});
