import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, Animated } from 'react-native';
import { useMetrics } from '../context/MetricsContext';
import { buildMetricsContext } from '../services/promptContext';
import { useGoals } from '../context/GoalsContext';
import { useTheme } from '../theme/ThemeContext';
import ChatBubble, { ChatRole } from '../components/chat/ChatBubble';
import { generateAssistantReply } from '../services/gemini';
import { elev } from '../theme/shadow';
import TopBar from '../components/ui/TopBar';
import { useAuth } from '../context/AuthContext';
import SimpleMenu from '../components/ui/SimpleMenu';
import { useFadeIn } from '../hooks/useFadeIn';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const AssistantScreen: React.FC = () => {
  const { suggestions, current } = useMetrics();
  const { tasks, completeToday } = useGoals();
  const t = useTheme();
  const { user, logout } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; role: ChatRole; text: string }>>([
    { id: 'welcome', role: 'assistant', text: 'Hola, soy tu asistente. Puedo ayudarte a cumplir tus metas. ¿En qué te gustaría enfocarte hoy?' },
  ]);
  const [typing, setTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const opacity = useFadeIn();
  const isFocused = useIsFocused();
  const focusAnim = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(focusAnim, { toValue: isFocused ? 1 : 0, duration: isFocused ? 260 : 140, useNativeDriver: true }).start();
  }, [isFocused]);
  const navigation = useNavigation<any>();
  useEffect(() => {
    if (user?.name) {
      setMessages(prev => prev.map(m => m.id === 'welcome' ? { ...m, text: `Hola ${user.name}, soy tu asistente. Puedo ayudarte a cumplir tus metas. ¿En qué te gustaría enfocarte hoy?` } : m));
    }
  }, [user?.name]);

  const today = new Date().toISOString().slice(0,10);
  const todayTask = useMemo(() => tasks.find(tk => tk.date === today), [tasks, today]);

  // Cronómetro hasta la próxima tarea (6AM del día siguiente) cuando está completada
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    let timer: any;
    const nextSixAM = () => {
      const n = new Date();
      const next = new Date(n);
      next.setDate(n.getDate() + 1);
      next.setHours(6,0,0,0);
      return next;
    };
    if (todayTask?.completed) {
      const tick = () => {
        const now = Date.now();
        const target = nextSixAM().getTime();
        const diff = Math.max(0, target - now);
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setCountdown(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
      };
      tick();
      timer = setInterval(tick, 1000);
    } else setCountdown('');
    return () => timer && clearInterval(timer);
  }, [todayTask?.completed]);

  const explainToday = async () => {
    if (!todayTask) return;
  const namePart = user?.name ? `Mi nombre es ${user.name}. ` : '';
  const metricsCtx = buildMetricsContext(current);
  const prompt = `${namePart}Reglas de respuesta: Tono cálido, empático y alentador; muy conciso (máx. 3-4 oraciones). Responde sólo lo solicitado, sin resúmenes ni información no pedida. Usa mis métricas del día sólo si aportan a la explicación.
Contexto privado (no mostrar literalmente): ${metricsCtx}.
Pregunta: Explícame esta tarea con pasos claros y breves: ${todayTask.description}`;
    setMessages(prev => [...prev, { id: `${Date.now()}-u2`, role: 'user', text: `¿Qué significa esta tarea? ${todayTask.description}` }]);
    setTyping(true);
    const res = await generateAssistantReply(prompt);
    setMessages(prev => [...prev, { id: `${Date.now()}-a2`, role: 'assistant', text: res.text }]);
    setTyping(false);
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const userMsg = { id: `${Date.now()}-u`, role: 'user' as ChatRole, text };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    // Prompt simple: comienza integración con Gemini; si falla, caerá a demo.
  const namePart = user?.name ? `Mi nombre es ${user.name}. ` : '';
  const metricsCtx = buildMetricsContext(current);
  const prompt = `${namePart}Reglas de respuesta: Tono cálido, empático y alentador; muy conciso (máx. 2-4 oraciones). Responde sólo lo que pedí, sin resúmenes. Usa mis métricas del día solo si son pertinentes a la pregunta.
Contexto privado (no mostrar literalmente): ${metricsCtx}.
Pregunta del usuario: ${text}`;
    const result = await generateAssistantReply(prompt);

    let replyText = result.text;
    if (result.from === 'fallback') {
      // Intenta enriquecer con sugerencias locales si existen
      const local = suggestions?.[0];
      if (local) replyText += `\n\nSugerencia: ${local}`;
    }

    const aiMsg = { id: `${Date.now()}-a`, role: 'assistant' as ChatRole, text: replyText };
    setMessages(prev => [...prev, aiMsg]);
    setTyping(false);
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: t.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
  <Animated.View style={{ flex: 1, transform: [{ scale: focusAnim.interpolate({ inputRange: [0,1], outputRange: [0.97,1] }) }], opacity: Animated.multiply(opacity, focusAnim) }}>
  <TopBar title={user?.name ? `Asistente · ${user.name}` : 'Asistente'} onMenuPress={() => setMenuOpen(true)} />
      {todayTask && (
        <View style={[styles.taskCard, { backgroundColor: t.card, borderWidth: 1, borderColor: t.border }, elev(3) as any]}> 
          <Text style={[styles.taskTitle, { color: t.text }]}>Tarea de hoy</Text>
          <Text style={{ color: t.textDim, marginBottom: 10 }}>{todayTask.description}</Text>
          {!todayTask.completed ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={completeToday} style={[styles.taskBtn, { backgroundColor: t.primary }]}> 
                <Text style={styles.btnText}>Marcar como hecha</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={explainToday} style={[styles.taskBtn, { backgroundColor: t.card, borderWidth: 1, borderColor: t.border }]}>
                <Text style={{ color: t.text, fontWeight: '600' }}>¿Cómo lo hago?</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ padding: 12, borderRadius: 12, backgroundColor: t.card, borderWidth: 1, borderColor: t.border }}>
              <Text style={{ color: t.text, fontWeight: '700' }}>¡Vuelve mañana a las 6:00!</Text>
              <Text style={{ color: t.textDim, marginTop: 4 }}>Próxima tarea en {countdown}</Text>
            </View>
          )}
        </View>
      )}
  <View style={[styles.chatBox, { backgroundColor: t.card, borderWidth: 1, borderColor: t.border }, elev(3) as any]}>        
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble role={item.role} text={item.text} />
          )}
          ListFooterComponent={typing ? (
            <ChatBubble role="assistant" text="Escribiendo…" compact />
          ) : null}
          contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 8 }}
        />
      </View>
      <View style={styles.row}>
        <TextInput style={[styles.input, { backgroundColor: t.card, color: t.text, borderColor: t.border, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }]} value={input} onChangeText={setInput} placeholder="Escribe un mensaje" placeholderTextColor={t.textDim} />
        <TouchableOpacity style={[styles.btn, { backgroundColor: t.primary, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }]} onPress={send}><Text style={styles.btnText}>Enviar</Text></TouchableOpacity>
      </View>
      <SimpleMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={[
          { label: 'Mi perfil', onPress: () => navigation.navigate('Profile') },
          { label: 'Fuentes de datos', onPress: () => navigation.navigate('DataSources') },
          { label: 'Cerrar sesión', onPress: async () => { await logout(); } },
        ]}
      />
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, fontFamily: 'Inter_800ExtraBold', marginBottom: 12 },
  chatBox: { flex: 1, borderRadius: 12, marginHorizontal: 16, paddingVertical: 8 },
  line: { marginBottom: 6 },
  placeholder: {},
  row: { flexDirection: 'row', marginTop: 12, paddingHorizontal: 16, paddingBottom: 16 },
  input: { flex: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, minHeight: 50 },
  btn: { marginLeft: 8, paddingHorizontal: 18, height: 50, justifyContent: 'center', borderRadius: 16 },
  btnText: { color: '#fff', fontWeight: '600' },
  taskCard: { padding: 16, borderRadius: 16, marginBottom: 12 },
  taskTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  taskBtn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
});

export default AssistantScreen;
