import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { elev } from '../../theme/shadow';
import RichText from '../../components/ui/RichText';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatBubbleProps {
  role: ChatRole;
  text: string;
  compact?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ role, text, compact }) => {
  const t = useTheme();
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';
  const bg = isUser ? t.primary : t.cardAlt;
  const color = isUser ? '#FFFFFF' : t.text;
  const align: 'flex-start' | 'flex-end' = isUser ? 'flex-end' : 'flex-start';

  return (
    <View style={[styles.row, { justifyContent: align }]}>      
      <View style={[
        styles.bubble,
        {
          backgroundColor: bg,
          borderColor: isUser ? t.primaryAlt : t.border,
          maxWidth: '92%',
          marginVertical: compact ? 4 : 8,
          // Más cerca del borde derecho para mensajes de usuario
          marginRight: isUser ? -8 : 0,
          marginLeft: isUser ? 0 : 4,
        },
        isUser ? styles.bubbleRight : styles.bubbleLeft,
        elev(2) as any,
      ]}>
        <RichText text={text} color={color} style={styles.text} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { width: '100%', flexDirection: 'row' },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  bubbleLeft: {
    borderTopLeftRadius: 4,
  },
  bubbleRight: {
    borderTopRightRadius: 4,
    marginRight: 0,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
});

export default ChatBubble;
