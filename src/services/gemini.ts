import Constants from 'expo-constants';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function getApiKey(): string | undefined {
  // Prefer public env vars for Expo (safe for client exposure if intended)
  const envKey = (typeof process !== 'undefined' && (process as any).env && (process as any).env.EXPO_PUBLIC_GEMINI_API_KEY) as string | undefined;
  const extraKey = (Constants?.expoConfig as any)?.extra?.GEMINI_API_KEY
    || (Constants as any)?.manifest2?.extra?.GEMINI_API_KEY
    || (Constants as any)?.manifest?.extra?.GEMINI_API_KEY;
  return envKey || extraKey;
}

export type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> }
  }>;
  promptFeedback?: any;
  error?: { message?: string };
};

export async function generateAssistantReply(prompt: string): Promise<{ text: string; from: 'gemini' | 'fallback'; error?: string }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { text: 'Modo demo: no hay API key configurada para Gemini. Ve a app.config.js (extra) o exporta EXPO_PUBLIC_GEMINI_API_KEY para habilitar IA.', from: 'fallback' };
  }

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [ { text: prompt } ],
          },
        ],
      }),
    });

    const data: GeminiResponse = await res.json();
    if (!res.ok) {
      const errMsg = data?.error?.message || `HTTP ${res.status}`;
      return { text: `Modo demo: error al llamar Gemini (${errMsg}). Usaré sugerencias locales por ahora.`, from: 'fallback', error: errMsg };
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      return { text: 'Modo demo: la respuesta de Gemini no incluyó texto. Intentaré de nuevo más tarde.', from: 'fallback' };
    }
    return { text, from: 'gemini' };
  } catch (e: any) {
    const errMsg = e?.message || 'unknown error';
    return { text: `Modo demo: no se pudo contactar a Gemini (${errMsg}).`, from: 'fallback', error: errMsg };
  }
}
