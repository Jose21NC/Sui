import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, Animated } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthParamList } from '../../navigation/AuthStack';
import { useTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<AuthParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const t = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const modeAnim = useRef(new Animated.Value(0)).current; // 0 login, 1 register (cuando navegamos)

  const onLogin = async () => {
    try {
      await login(email.trim(), password);
      setTimeout(() => Alert.alert('Bienvenido', 'Sesión iniciada correctamente.'), 200);
    } catch (e: any) {
      Alert.alert('Inicio de sesión', e?.message || 'No se pudo iniciar sesión');
    }
  };

  // Animación de aparición
  React.useEffect(() => {
    Animated.timing(modeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}> 
      <View style={styles.logoFixed}>
        <Image source={require('../../assets/plant/logo.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <Animated.View style={{ alignItems:'center', marginBottom: 8, opacity: modeAnim.interpolate({ inputRange:[0,1], outputRange:[1,0.9] }), transform:[{ scale: modeAnim.interpolate({ inputRange:[0,1], outputRange:[1,0.98] }) }] }}>
        <Text style={[styles.title, { color: t.text }]}>Bienvenido a <Text style={{ color: t.primary }}>Sui</Text></Text>
      </Animated.View>
      <TextInput style={[styles.input, { backgroundColor: t.card, color: t.text }]} placeholder="Correo" placeholderTextColor={t.textDim} autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={[styles.input, { backgroundColor: t.card, color: t.text }]} placeholder="Contraseña" placeholderTextColor={t.textDim} secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={[styles.btn, { backgroundColor: t.primary }]} onPress={onLogin}><Text style={styles.btnText}>Entrar</Text></TouchableOpacity>
      <View style={styles.socialRow}> 
        <TouchableOpacity onPress={() => Alert.alert('Social','Google aún no está disponible.')} style={styles.socialBtn}>
          <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/250px-Google_Favicon_2025.svg.png' }} style={styles.socialIconImg} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Social','Facebook aún no está disponible.')} style={styles.socialBtn}>
          <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/512px-Facebook_f_logo_%282019%29.svg.png' }} style={styles.socialIconImg} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}><Text style={[styles.link, { color: t.textDim }]}>Crear cuenta</Text></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', paddingTop: 240 },
  logoFixed: { position:'absolute', top: 56, left: 0, right: 0, alignItems:'center' },
  logo: { width: 160, height: 160 },
  title: { fontSize: 28, marginBottom: 16, fontFamily: 'Inter_800ExtraBold', textAlign:'center' },
  input: { padding: 12, borderRadius: 10, marginBottom: 10 },
  btn: { padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700' },
  link: { marginTop: 10, textAlign: 'center' },
  socialRow: { flexDirection:'row', justifyContent:'center', gap:16, marginTop:16 },
  socialBtn: { width:48, height:48, borderRadius:24, alignItems:'center', justifyContent:'center', backgroundColor:'#fff', shadowColor:'#000', shadowOpacity:0.05, shadowRadius:6, shadowOffset:{ width:0, height:2 }, elevation:2 },
  socialIconImg: { width:24, height:24, resizeMode:'contain' },
});

export default LoginScreen;
