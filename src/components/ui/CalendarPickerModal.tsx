import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (isoDate: string) => void; // YYYY-MM-DD
  maxDays?: number; // límite hacia atrás
}

// Calendario mínimo sin dependencias externas: muestra mes actual y permite navegar atrás
// Limita navegación a que no exceda maxDays hacia atrás.
const CalendarPickerModal: React.FC<Props> = ({ visible, onClose, onSelect, maxDays = 90 }) => {
  const t = useTheme();
  const today = new Date();
  const [cursor, setCursor] = React.useState(new Date()); // mes mostrado

  // Generar días del mes
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay(); // 0 Domingo ... 6 Sabado
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Calcular máximo de fecha hacia atrás
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - maxDays);
  const isBeforeLimit = (d: Date) => d.getTime() < new Date(limitDate.toDateString()).getTime();

  const cells: Array<{ date?: Date; disabled?: boolean }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({});
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const disabled = d > today || isBeforeLimit(d);
    cells.push({ date: d, disabled });
  }

  const goPrev = () => {
    const prev = new Date(year, month - 1, 1);
    // impedir mostrar mes totalmente fuera del límite
    const lastDayPrev = new Date(prev.getFullYear(), prev.getMonth() + 1, 0);
    if (isBeforeLimit(lastDayPrev)) return; // demasiado atrás
    setCursor(prev);
  };
  const goNext = () => {
    const next = new Date(year, month + 1, 1);
    if (next > today) return; // no ir a meses futuros
    setCursor(next);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: t.card, borderColor: t.border }]}> 
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <TouchableOpacity onPress={goPrev} style={[styles.navBtn, { borderColor: t.border }]}><Text style={{ color: t.text }}>◀</Text></TouchableOpacity>
            <Text style={{ color: t.text, fontFamily:'Inter_600SemiBold', fontSize:16 }}>{cursor.toLocaleDateString('es-ES', { month:'long', year:'numeric' })}</Text>
            <TouchableOpacity onPress={goNext} style={[styles.navBtn, { borderColor: t.border }]}><Text style={{ color: t.text }}>▶</Text></TouchableOpacity>
          </View>
          <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:4 }}>
            {['D','L','M','X','J','V','S'].map(d => <Text key={d} style={{ width:32, textAlign:'center', color: t.textDim }}>{d}</Text>)}
          </View>
          <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
            {cells.map((c,i) => {
              if (!c.date) return <View key={i} style={{ width:32, height:36 }} />;
              const iso = c.date.toISOString().slice(0,10);
              const isToday = iso === today.toISOString().slice(0,10);
              return (
                <TouchableOpacity
                  key={iso}
                  disabled={c.disabled}
                  onPress={() => { onSelect(iso); onClose(); }}
                  style={{ width:32, height:36, alignItems:'center', justifyContent:'center', marginVertical:2, borderRadius:8, backgroundColor: isToday ? t.primary : 'transparent', opacity: c.disabled ? 0.3 : 1 }}>
                  <Text style={{ color: isToday ? '#fff' : t.text }}>{c.date.getDate()}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ flexDirection:'row', justifyContent:'flex-end', marginTop:12 }}>
            <TouchableOpacity onPress={onClose} style={{ paddingHorizontal:14, paddingVertical:8, borderWidth:1, borderColor:t.border, borderRadius:8 }}>
              <Text style={{ color: t.text }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.3)', justifyContent:'center', alignItems:'center', padding:16 },
  sheet: { width:'100%', maxWidth:380, borderRadius:16, borderWidth:1, padding:16 },
  navBtn: { paddingHorizontal:10, paddingVertical:6, borderWidth:1, borderRadius:8 },
});

export default CalendarPickerModal;
