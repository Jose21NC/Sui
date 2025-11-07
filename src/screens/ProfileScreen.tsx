import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import TopBar from '../components/ui/TopBar';
import TextField from '../components/ui/TextField';
import { useAuth } from '../context/AuthContext';
import { PREDEFINED_OBJECTIVES, Objective, useGoals } from '../context/GoalsContext';
import { useNavigation } from '@react-navigation/native';

const DURATIONS = [14, 30, 60, 90];

const ProfileScreen: React.FC = () => {
  const t = useTheme();
  const navigation = useNavigation<any>();
  const { user, updateProfile, logout } = useAuth();
  const { selected, durationDays, chooseObjective } = useGoals();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [height, setHeight] = useState(user?.heightCm ? String(user.heightCm) : '');
  // Mostrar el peso en libras (lb) en UI
  const kgToLb = (kg?: number) => (kg == null ? '' : (kg * 2.20462).toFixed(1));
  const lbToKg = (lb?: string) => (lb && !isNaN(Number(lb)) ? Number(lb) * 0.453592 : undefined);
  const [weight, setWeight] = useState(user?.weightKg ? kgToLb(user.weightKg) : '');
  const [editing, setEditing] = useState(false);

  // Único campo opcional: género (Masculino/Femenino)
  const [gender, setGender] = useState(user?.gender === 'Masculino' || user?.gender === 'Femenino' ? user!.gender : '');
  const [genderOpen, setGenderOpen] = useState(false);

  // Animaciones de entrada y cambio de sección
  const appear = useRef(new Animated.Value(0)).current;
  const sectionAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(appear, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);
  useEffect(() => {
    sectionAnim.setValue(0);
    Animated.timing(sectionAnim, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [editing]);

  const [objective, setObjective] = useState<Objective | undefined>(selected);
  const [duration, setDuration] = useState<number>(durationDays || 30);

  const onSave = async () => {
    try {
      await updateProfile({
        name: name.trim(),
        age: age ? Number(age) : undefined,
        heightCm: height ? Number(height) : undefined,
        weightKg: lbToKg(weight),
        gender: gender || undefined,
      });
      if (objective) {
        await chooseObjective(objective, duration);
      }
      Alert.alert('Perfil', 'Cambios guardados correctamente.');
    } catch (e: any) {
      Alert.alert('Perfil', e?.message || 'No se pudo guardar');
    }
  };

  // Animación de salida al volver
  const exitAnim = useRef(new Animated.Value(1)).current;
  const handleBack = () => {
    Animated.timing(exitAnim, { toValue: 0, duration: 180, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => {
      navigation.goBack();
    });
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: t.bg, opacity: exitAnim, transform: [{ translateY: exitAnim.interpolate({ inputRange: [0,1], outputRange: [12,0] }) }] }]}> 
      <TopBar title="Mi perfil" onBackPress={handleBack} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {!editing ? (
          <>
            <Animated.View style={[styles.summaryCard, { backgroundColor: t.card, borderColor: t.border, opacity: appear, transform: [{ translateY: appear.interpolate({ inputRange: [0,1], outputRange: [12,0] }) }] }]}> 
              <View style={[styles.avatar, { backgroundColor: t.bg }]}>
                <Text style={{ fontSize: 28 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>{name || user?.name || 'Tu nombre'}</Text>
                <Text style={{ color: t.textDim, marginTop: 4 }}>{age ? `${age} años` : (user?.age ? `${user.age} años` : 'Edad no especificada')}</Text>
              </View>
            </Animated.View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, justifyContent: 'center' }}>
              <TouchableOpacity onPress={() => setEditing(true)} style={[styles.btnSmall, { backgroundColor: t.card, borderColor: t.border, minWidth: 150, alignItems: 'center' }]}> 
                <Text style={{ color: t.text }}>Modificar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => { await logout(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); }} style={[styles.btnSmall, { backgroundColor: '#DC2626', borderColor: '#DC2626', minWidth: 150, alignItems: 'center' }]}> 
                <Text style={{ color: '#fff' }}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Animated.View style={{ opacity: sectionAnim, transform: [{ translateY: sectionAnim.interpolate({ inputRange: [0,1], outputRange: [10,0] }) }] }}>
              <Text style={[styles.section, { color: t.text }]}>Datos personales</Text>
              <TextField label="Correo" value={user?.email || ''} editable={false} />
              <TextField label="Nombre" value={name} onChangeText={setName} editable={true} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextField label="Edad" value={age} onChangeText={setAge} keyboardType="number-pad" style={{ flex: 1 }} editable={true} />
                <TextField label="Altura (cm)" value={height} onChangeText={setHeight} keyboardType="number-pad" style={{ flex: 1 }} editable={true} />
              </View>
              <TextField label="Peso (lb)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" editable={true} />
              <Text style={{ color: t.textDim, marginTop: 12, marginBottom: 4 }}>Género (opcional)</Text>
              <TouchableOpacity onPress={() => setGenderOpen(o => !o)} style={[styles.dropdown, { borderColor: t.border, backgroundColor: t.card }]}> 
                <Text style={{ color: gender ? t.text : t.textDim }}>{gender || 'Seleccionar'}</Text>
                <Text style={{ color: t.textDim }}>{genderOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {genderOpen && (
                <Animated.View style={{ overflow: 'hidden' }}>
                  {['Masculino','Femenino',''].map(opt => (
                    <TouchableOpacity key={opt || 'none'} onPress={() => { setGender(opt); setGenderOpen(false); }} style={[styles.dropdownItem, { backgroundColor: opt && gender === opt ? t.primary : t.bg }]}> 
                      <Text style={{ color: opt && gender === opt ? '#fff' : t.text }}>{opt || 'Ninguno'}</Text>
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}
            </Animated.View>

            <Text style={[styles.section, { color: t.text }]}>Objetivo</Text>
            {PREDEFINED_OBJECTIVES.map((obj) => {
              const active = objective?.id === obj.id;
              return (
                <TouchableOpacity key={obj.id} style={[styles.card, { backgroundColor: active ? t.primary : t.card, borderColor: active ? t.primaryAlt : t.border }]} onPress={() => setObjective(obj)}>
                  <Text style={{ color: active ? '#fff' : t.text, fontFamily: 'Inter_600SemiBold' }}>{obj.title}</Text>
                  <Text style={{ color: active ? '#F0F4FF' : t.textDim }}>{obj.description}</Text>
                </TouchableOpacity>
              );
            })}

            <Text style={[styles.section, { color: t.text }]}>Duración</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {DURATIONS.map(d => {
                const act = duration === d;
                return (
                  <TouchableOpacity key={d} style={[styles.pill, { backgroundColor: act ? t.primary : t.card, borderColor: act ? t.primaryAlt : t.border }]} onPress={() => setDuration(d)}>
                    <Text style={{ color: act ? '#fff' : t.text }}>{d} días</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, justifyContent: 'center' }}>
              <TouchableOpacity onPress={() => { onSave(); setEditing(false); }} style={[styles.btnFlex, { backgroundColor: t.primary, maxWidth: 180 }]}> 
                <Text style={{ color: '#fff', fontWeight: '700' }}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditing(false); setName(user?.name||''); setAge(user?.age?String(user.age):''); setHeight(user?.heightCm?String(user.heightCm):''); setWeight(kgToLb(user?.weightKg)); setGender(user?.gender==='Masculino'||user?.gender==='Femenino'?user!.gender:'' ); setGenderOpen(false); }} style={[styles.btnFlex, { backgroundColor: t.card, borderColor: t.border, borderWidth: 1, maxWidth: 180 }]}> 
                <Text style={{ color: t.text }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { fontSize: 18, marginBottom: 10, marginTop: 14, fontFamily: 'Inter_600SemiBold' },
  card: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  btn: { marginTop: 18, padding: 14, borderRadius: 12, alignItems: 'center' },
  btnSmall: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
  btnFlex: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12 },
});

export default ProfileScreen;
