// CommonJS para compatibilidad con Expo CLI en Vercel
// Cargar secretos locales opcionales (no versionados) de forma segura
let LOCAL_SECRETS = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LOCAL_SECRETS = require('./local.secrets.json');
} catch (e) {
  // archivo opcional
}

module.exports = {
  name: "Sui",
  slug: "sui-health",
  version: "0.1.0",
  orientation: "portrait",
  scheme: "sui",
  userInterfaceStyle: "automatic",
  platforms: ["android", "web"],
  plugins: [
    'expo-font'
  ],
  android: {
    package: "com.sui.health",
    permissions: []
  },
  web: {
    bundler: "metro",
    output: "single"
  },
  extra: {
    enableHealthConnect: false,
    // Prioridad: variable de entorno pública de Expo > archivo local.secrets.json (no versionado)
    GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || LOCAL_SECRETS.GEMINI_API_KEY
  }
};
