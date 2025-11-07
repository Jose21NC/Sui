import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const SimpleMenu: React.FC<{ visible: boolean; onClose: ()=>void; items: Array<{ label: string; onPress: ()=>void }> }>
= ({ visible, onClose, items }) => {
  const t = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={[styles.sheet, { backgroundColor: t.card, borderColor: t.border }]}>
          {items.map((it, idx) => (
            <TouchableOpacity key={idx} style={styles.item} onPress={() => { onClose(); setTimeout(it.onPress, 10); }}>
              <Text style={{ color: t.text }}>{it.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'flex-start', alignItems: 'flex-end' },
  sheet: { marginTop: 60, marginRight: 12, borderRadius: 12, borderWidth: 1, paddingVertical: 8, minWidth: 180 },
  item: { paddingHorizontal: 14, paddingVertical: 12 },
});

export default SimpleMenu;
