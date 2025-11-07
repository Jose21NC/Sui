// Paleta clara inspirada en los mockups: superficie blanca, primario azul, textos oscuros
export const colors = {
  bg: '#F5F7FB',        // fondo general
  card: '#FFFFFF',      // tarjetas
  cardAlt: '#F0F3FA',   // superficies secundarias
  text: '#0F172A',      // texto principal (gris azulado oscuro)
  textDim: '#6B7280',   // texto secundario
  primary: '#4C8DF5',   // azul principal
  primaryAlt: '#74A9FF',
  success: '#22C55E',
  warn: '#F59E0B',
  danger: '#EF4444',
  border: '#E5E7EB'     // bordes sutiles
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
};

export type Theme = typeof colors & { spacing: typeof spacing };

export const theme: Theme = Object.assign({}, colors, { spacing });
