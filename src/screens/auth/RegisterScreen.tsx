import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Animated, Image, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthParamList } from '../../navigation/AuthStack';
import { useTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<AuthParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuth();
  const t = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const modeAnim = useRef(new Animated.Value(0)).current; // anim de entrada
  useEffect(() => { Animated.timing(modeAnim, { toValue: 1, duration: 420, useNativeDriver: true }).start(); }, []);

  const onRegister = async () => {
    try {
      await register({
        email: email.trim(),
        password,
        name: name.trim(),
        age: age ? Number(age) : undefined,
        heightCm: height ? Number(height) : undefined,
        weightKg: weight ? Number(weight) : undefined,
      });
      setTimeout(() => Alert.alert('Cuenta creada', 'Tu cuenta fue creada con éxito. ¡Bienvenido!'), 200);
    } catch (e: any) {
      Alert.alert('Registro', e?.message || 'No se pudo registrar');
    }
  };

  return (
    <ScrollView style={{ flex:1 }} contentContainerStyle={[styles.container, { backgroundColor: t.bg, minHeight:'100%', paddingBottom:40 }]}> 
      <View style={styles.logoFixed}>
        <Image source={require('../../assets/plant/logo.png')} style={styles.logo} resizeMode='contain' />
      </View>
      <Animated.View style={{ alignItems:'center', marginBottom: 6, opacity: modeAnim, transform:[{ scale: modeAnim.interpolate({ inputRange:[0,1], outputRange:[0.98,1] }) }] }}>
        <Text style={[styles.title, { color: t.text }]}>Bienvenido a <Text style={{ color: t.primary }}>Sui</Text></Text>
        <Text style={{ color: t.textDim, textAlign:'center', marginTop: 6 }}>Crea tu cuenta y configura tu meta.</Text>
      </Animated.View>
      <TextInput style={[styles.input, { backgroundColor: t.card, color: t.text }]} placeholder="Nombre" placeholderTextColor={t.textDim} value={name} onChangeText={setName} />
      <TextInput style={[styles.input, { backgroundColor: t.card, color: t.text }]} placeholder="Correo" placeholderTextColor={t.textDim} autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={[styles.input, { backgroundColor: t.card, color: t.text }]} placeholder="Contraseña" placeholderTextColor={t.textDim} secureTextEntry value={password} onChangeText={setPassword} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TextInput style={[styles.inputHalf, { backgroundColor: t.card, color: t.text }]} placeholder="Edad" placeholderTextColor={t.textDim} keyboardType="number-pad" value={age} onChangeText={setAge} />
        <TextInput style={[styles.inputHalf, { backgroundColor: t.card, color: t.text }]} placeholder="Altura (cm)" placeholderTextColor={t.textDim} keyboardType="number-pad" value={height} onChangeText={setHeight} />
      </View>
      <TextInput style={[styles.input, { backgroundColor: t.card, color: t.text }]} placeholder="Peso (kg)" placeholderTextColor={t.textDim} keyboardType="decimal-pad" value={weight} onChangeText={setWeight} />
      <TouchableOpacity style={[styles.btn, { backgroundColor: t.primary }]} onPress={onRegister}><Text style={styles.btnText}>Registrarme</Text></TouchableOpacity>
      <View style={styles.socialRow}> 
        <TouchableOpacity onPress={() => Alert.alert('Social','Google aún no está disponible.')} style={styles.socialBtn}> 
          <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/250px-Google_Favicon_2025.svg.png' }} style={styles.socialIconImg} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Social','Facebook aún no está disponible.')} style={styles.socialBtn}> 
          <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/512px-Facebook_f_logo_%282019%29.svg.png' }} style={styles.socialIconImg} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={[styles.link, { color: t.textDim }]}>Ya tengo cuenta</Text></TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center', paddingTop: 240 },
  logoFixed: { position:'absolute', top: 56, left:0, right:0, alignItems:'center' },
  logo: { width: 160, height: 160 },
  title: { fontSize: 28, marginBottom: 8, fontFamily: 'Inter_800ExtraBold', textAlign:'center' },
  input: { padding: 12, borderRadius: 10, marginBottom: 10 },
  inputHalf: { flex: 1, padding: 12, borderRadius: 10, marginBottom: 10 },
  btn: { padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700' },
  link: { marginTop: 10, textAlign: 'center' },
  socialRow: { flexDirection:'row', justifyContent:'center', gap:16, marginTop:16 },
  socialBtn: { width:48, height:48, borderRadius:24, alignItems:'center', justifyContent:'center', backgroundColor:'#fff', shadowColor:'#000', shadowOpacity:0.05, shadowRadius:6, shadowOffset:{ width:0, height:2 }, elevation:2 },
  socialIconImg: { width:24, height:24, resizeMode:'contain' },
});

export default RegisterScreen;
