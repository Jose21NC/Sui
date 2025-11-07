# Configuración de clave Gemini

Para usar la IA real (Gemini) tienes dos opciones:

1. Variable de entorno (recomendada en builds):

  export EXPO_PUBLIC_GEMINI_API_KEY="tu_clave"

2. Archivo local no versionado:

  - Copia `local.secrets.sample.json` a `local.secrets.json`.
  - Rellena el valor de `GEMINI_API_KEY`.
  - El archivo está en `.gitignore` y se cargará automáticamente en `app.config.js`.

Prioridad: si existe `EXPO_PUBLIC_GEMINI_API_KEY`, se usa sobre el archivo local.

# Sui Health (Expo / React Native)

Aplicación de métricas de salud (similar a Samsung Health) con un asistente de IA (stub inicial) para ayudarte a cumplir metas y hábitos. Datos reales se integrarán más adelante vía **Google Health Connect**; por ahora se simulan.

## Características iniciales
 - Simulación de métricas: pasos, ritmo cardíaco, horas de sueño, calorías, agua.
 - Actualización periódica + persistencia local (AsyncStorage) de metas e historial.
 - Navegación básica (Dashboard, Metas, Asistente). Detalle métrica listo para ampliar.
 - Asistente IA (heurísticas categorizadas) con filtrado de sugerencias por categoría.
 - Preparado para Android y vista Web (Expo) para ver cambios en tiempo real en el navegador.

## Requisitos previos
- Node.js LTS
- `npm` o `yarn`
- Android Studio (para emulador) O dispositivo físico con Expo Go.

## Instalación
```bash
npm install
npm run start
```
Luego:
- Presiona "a" para abrir Android.
- Presiona "w" para modo Web y ajustar viewport a tamaño móvil (DevTools > Toggle device toolbar).

## Estructura
```
App.tsx
src/
  context/        Contextos React (métricas, metas)
  services/       Simulación y lógica IA
  screens/        Pantallas principales
  components/     UI reutilizable (cards, gráficos)
  navigation/     Configuración de navegación
```

## Health Connect (Futuro)
- Activar flag `extra.enableHealthConnect`.
- Añadir permisos Android específicos y módulo nativo/SDK.

## Siguientes pasos sugeridos
1. Integrar un modelo LLM externo (API) para recomendaciones avanzadas (reemplazar heurísticas).
2. Implementar gráficos reales (Victory Native ya instalado) con datasets semanales/mensuales.
3. Sincronización con Health Connect (lectura de datos reales).
4. Añadir tests (Jest + React Native Testing Library) para lógica de sugerencias.
5. Internacionalización (i18n) y temas claros/oscuro.

## Licencia
Uso interno por ahora.
