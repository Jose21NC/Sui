import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeContext';

type Props = {
  title: string;
  onMenuPress?: () => void;
  right?: React.ReactNode;
  onBackPress?: () => void;
  left?: React.ReactNode;
};

const TopBar: React.FC<Props> = ({ title, onMenuPress, right, onBackPress, left }) => {
  const t = useTheme();
  return (
    <View style={[styles.container]}>      
      {onBackPress ? (
        <TouchableOpacity onPress={onBackPress} hitSlop={{ top: 8, left: 8, bottom: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={26} color={t.text} />
        </TouchableOpacity>
      ) : left ? (
        <View>{left}</View>
      ) : (
        <View style={{ width: 26 }} />
      )}
      <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>{title}</Text>
      {onMenuPress ? (
        <TouchableOpacity onPress={onMenuPress} hitSlop={{ top: 8, left: 8, bottom: 8, right: 8 }}>
          <Ionicons name="menu-outline" size={26} color={t.text} />
        </TouchableOpacity>
      ) : right ? (
        <View>{right}</View>
      ) : (
        <View style={{ width: 26 }} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_800ExtraBold',
    flex: 1,
    textAlign: 'center',
  },
});

export default TopBar;
