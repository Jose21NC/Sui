import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type Props = { children: React.ReactNode; fallbackText?: string };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <Fallback text={this.props.fallbackText} />;
    }
    return this.props.children as any;
  }
}

const Fallback: React.FC<{ text?: string }> = ({ text }) => {
  const t = useTheme();
  return (
    <View style={{ padding: 12, borderRadius: 12, backgroundColor: t.card }}>
      <Text style={{ color: t.textDim, fontStyle: 'italic' }}>{text ?? 'Ocurrió un error al renderizar este bloque.'}</Text>
    </View>
  );
};

export default ErrorBoundary;
