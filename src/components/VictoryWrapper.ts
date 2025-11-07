import { Platform } from 'react-native';

// Runtime conditional export to avoid TypeScript resolver issues with .web/.native files
// On web, use 'victory' (SVG). On native, use 'victory-native' (react-native-svg).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lib = Platform.OS === 'web' ? require('victory') : require('victory-native');

export const VictoryArea = lib.VictoryArea;
export const VictoryChart = lib.VictoryChart;
export const VictoryAxis = lib.VictoryAxis;
