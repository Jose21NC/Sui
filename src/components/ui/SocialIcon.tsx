import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

export type SocialKind = 'google' | 'facebook';

interface Props {
  kind: SocialKind;
  size?: number;
}

// Íconos simplificados estilo brand (no oficiales exactos, versión vector mínima)
const SocialIcon: React.FC<Props> = ({ kind, size = 28 }) => {
  if (kind === 'facebook') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.35C0 23.407.593 24 1.325 24h11.495v-9.294H9.847V11.01h2.973V8.414c0-2.944 1.796-4.553 4.417-4.553 1.255 0 2.337.093 2.651.135v3.07h-1.82c-1.428 0-1.705.678-1.705 1.676v2.268h3.41l-.444 3.696h-2.966V24h5.815C23.407 24 24 23.407 24 22.675V1.325C24 .593 23.407 0 22.675 0z" fill="#1877F2" />
        <Path d="M16.671 24v-9.294h2.966l.444-3.696h-3.41V8.742c0-.998.277-1.676 1.705-1.676h1.82v-3.07c-.314-.042-1.396-.135-2.651-.135-2.621 0-4.417 1.609-4.417 4.553v2.596h-2.973v3.696h2.973V24h3.543z" fill="#fff" />
      </Svg>
    );
  }
  // Google icon minimal multicolor 'G'
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G transform="scale(1 1)">
        <Path fill="#EA4335" d="M12 10.2V14h6.8c-.3 1.8-2.04 5.2-6.8 5.2-4.08 0-7.4-3.36-7.4-7.5S7.92 4.2 12 4.2c2.32 0 3.88.96 4.76 1.78l3.34-3.26C18.24 1.24 15.44 0 12 0 5.36 0 0 5.18 0 11.6S5.36 23.2 12 23.2c6.92 0 11.48-4.84 11.48-11.66 0-.78-.08-1.38-.18-2.02H12z"/>
        <Path fill="#34A853" d="M2.76 6.92A11.42 11.42 0 0112 4.2c2.32 0 3.88.96 4.76 1.78l3.34-3.26C18.24 1.24 15.44 0 12 0 7.6 0 3.72 2.22 1.48 5.6l1.28 1.32z"/>
        <Path fill="#FBBC05" d="M12 23.2c4.76 0 6.5-3.4 6.8-5.2H12v-3.8h11.3c.1.64.18 1.24.18 2.02 0 6.82-4.56 11.66-11.48 11.66-6.64 0-12-5.18-12-11.6 0-1.8.48-3.5 1.48-4.98L4.6 13c-.4 1.18-.62 2.54-.62 3.6 0 4.14 3.32 7.5 8.02 7.5z"/>
        <Path fill="#4285F4" d="M23.3 11.6c0-.7-.08-1.4-.18-2.02H12v4h6.8c-.3 1.8-2.04 5.2-6.8 5.2-4.7 0-8.02-3.36-8.02-7.5 0-1.06.22-2.42.62-3.6L1.48 5.6C.48 7.1 0 8.8 0 10.6c0 6.42 5.36 11.6 12 11.6 6.92 0 11.48-4.84 11.48-11.6z" opacity="0" />
      </G>
    </Svg>
  );
};

export default SocialIcon;
