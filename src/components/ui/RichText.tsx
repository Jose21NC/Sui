import React from 'react';
import { Text, TextStyle } from 'react-native';

function parseBold(text: string): Array<{ text: string; bold?: boolean }> {
  const parts: Array<{ text: string; bold?: boolean }> = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, m.index) });
    }
    parts.push({ text: m[1], bold: true });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex) });
  }
  return parts;
}

const RichText: React.FC<{ text: string; color?: string; style?: TextStyle }> = ({ text, color, style }) => {
  const segments = parseBold(text);
  return (
    <Text style={[style, color ? { color } : null]}>
      {segments.map((s, i) => (
        <Text key={i} style={s.bold ? [{ fontWeight: '700' }, color ? { color } : null] : color ? { color } : null}>
          {s.text}
        </Text>
      ))}
    </Text>
  );
};

export default RichText;
