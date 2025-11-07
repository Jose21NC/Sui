// Simplificado: usar app.json para configuración principal.
// Este archivo sólo agrega dinámicamente la clave si existe.
let GEMINI_KEY = undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const local = require('./local.secrets.json');
  GEMINI_KEY = local.GEMINI_API_KEY;
} catch (e) { /* opcional */ }

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || GEMINI_KEY || config.extra?.GEMINI_API_KEY,
  }
});
