import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Import sin extensión: en web resolverá a VictoryWrapper.web (victory) y en nativo a VictoryWrapper.native (victory-native)
import { VictoryArea, VictoryChart, VictoryAxis } from './VictoryWrapper';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  data: number[];
  label: string;
  height?: number;
  hideTitle?: boolean;
  embedded?: boolean; // sin fondo/borde/márgenes cuando está dentro de otra tarjeta
}

export const TrendChart: React.FC<Props> = ({ data, label, height = 160, hideTitle, embedded }) => {
  const t = useTheme();
  const series = data.slice(-20).map((v, i) => ({ x: i + 1, y: v }));
  return (
    <View style={[
      styles.container,
      embedded
        ? { backgroundColor: 'transparent', borderWidth: 0, marginVertical: 0, padding: 0, elevation: 0, shadowOpacity: 0 }
        : { backgroundColor: t.card, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3, borderWidth: 1, borderColor: t.border }
    ]}>      
      {!hideTitle && <Text style={[styles.title, { color: t.text }]}>{label}</Text>}
      {/* Evitamos usar VictoryTheme.material porque puede ser undefined en web con victory-native */}
      <VictoryChart height={height} padding={{ top: embedded ? 4 : 10, bottom: embedded ? 20 : 30, left: 40, right: 10 }}>
        <VictoryAxis style={{ axis: { stroke: t.border }, tickLabels: { fill: t.textDim, fontSize: 10 } }} />
        <VictoryAxis dependentAxis style={{ axis: { stroke: t.border }, tickLabels: { fill: t.textDim, fontSize: 10 } }} />
        <VictoryArea
          interpolation="monotoneX"
          style={{ data: { fill: t.primary + '55', stroke: t.primary, strokeWidth: 2 } }}
          data={series}
        />
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, borderRadius: 16, marginVertical: 12 },
  title: { marginBottom: 8, fontFamily: 'Inter_600SemiBold' },
});

export default TrendChart;
