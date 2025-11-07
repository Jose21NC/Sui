import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import TopBar from '../components/ui/TopBar';
import { useTheme } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

type Wearable = { name: string; connected: boolean };
type DataSourcesState = {
  healthConnectEnabled: boolean;
  wearables: Wearable[];
};

const STORAGE_KEY = 'sui:dataSources';

async function loadDataSources(): Promise<DataSourcesState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { healthConnectEnabled: false, wearables: [] };
}

async function saveDataSources(state: DataSourcesState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const DataSourcesScreen: React.FC = () => {
  const t = useTheme();
  const nav = useNavigation<any>();
  const [state, setState] = React.useState<DataSourcesState>({ healthConnectEnabled: false, wearables: [] });
  const [searching, setSearching] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [discovered, setDiscovered] = React.useState<Wearable | null>(null);
  const [connecting, setConnecting] = React.useState(false);

  React.useEffect(() => { (async () => {
    const loaded = await loadDataSources();
    // Migración: si wearables eran strings, conviértelos a objetos conectados
    const migrated: DataSourcesState = Array.isArray((loaded as any).wearables) && typeof (loaded as any).wearables[0] === 'string'
      ? { ...loaded, wearables: ((loaded as any).wearables as string[]).map(n => ({ name: n, connected: true })) }
      : loaded;
    setState(migrated);
  })(); }, []);

  const toggleHC = async (v: boolean) => {
    const next = { ...state, healthConnectEnabled: v };
    setState(next);
    await saveDataSources(next);
  };

  const searchWearables = async () => {
    if (searching) return;
    setSearching(true);
    setModalVisible(true);
    setDiscovered(null);
    // Simula descubrimiento tras 2.5s
    setTimeout(() => {
      setDiscovered({ name: 'Samsung Watch', connected: false });
      setSearching(false);
    }, 2500);
  };

  const connectDiscovered = async () => {
    if (!discovered || connecting) return;
    setConnecting(true);
    // Simula conexión en 1.5s
    setTimeout(async () => {
      const existsIdx = state.wearables.findIndex(w => w.name === discovered.name);
      let wearables: Wearable[];
      if (existsIdx >= 0) {
        wearables = state.wearables.map((w,i) => i===existsIdx ? { ...w, connected: true } : w);
      } else {
        wearables = [...state.wearables, { name: discovered.name, connected: true }];
      }
      const next = { ...state, wearables };
      setState(next);
      await saveDataSources(next);
      setConnecting(false);
      setModalVisible(false);
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>      
      <TopBar title="Fuentes de datos" onBackPress={() => nav.goBack()} />

      <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>        
        <View style={styles.titleRow}>
          <Ionicons name="fitness-outline" size={20} color={t.textDim} style={{ marginRight: 8 }} />
          <Text style={[styles.title, { color: t.text }]}>Health Connect</Text>
        </View>
        <View style={styles.row}>          
          <Text style={{ color: t.textDim, flex: 1 }}>{state.healthConnectEnabled ? 'Activado' : 'Desactivado'}</Text>
          <Switch value={state.healthConnectEnabled} onValueChange={toggleHC} />
        </View>
        <Text style={{ color: t.textDim, marginTop: 8 }}>
          Permite leer pasos, ritmo, sueño y más desde el sistema (simulado).
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>        
        <View style={styles.titleRow}>
          <Ionicons name="watch-outline" size={20} color={t.textDim} style={{ marginRight: 8 }} />
          <Text style={[styles.title, { color: t.text }]}>Wearables</Text>
        </View>
        <Text style={{ color: t.textDim, marginBottom: 8 }}>Dispositivos detectados:</Text>
        {state.wearables.filter(w => w.connected).length === 0 && (
          <Text style={{ color: t.textDim, fontStyle: 'italic', marginBottom: 8 }}>Ninguno</Text>
        )}
        {state.wearables.filter(w => w.connected).map((w, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Ionicons name="watch-outline" size={16} color={t.textDim} style={{ marginRight: 6 }} />
            <Text style={{ color: t.text, marginRight: 8 }}>{w.name}</Text>
            <View style={{ backgroundColor: '#10B98122', borderColor: '#10B981', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
              <Text style={{ color: '#10B981', fontSize: 12 }}>Conectado</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 12 }} />
        <TouchableOpacity onPress={searchWearables} disabled={searching} style={[styles.button, { borderColor: t.border }]}>          
          <Ionicons name="search-outline" size={16} color={t.text} style={{ marginRight: 6 }} />
          <Text style={{ color: t.text }}>{searching ? 'Buscando…' : 'Buscar wearables'}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de búsqueda/conexión */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => !connecting && setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={[styles.modalTitle, { color: t.text }]}>Buscar wearables</Text>
            {searching && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator />
                <Text style={{ marginLeft: 8, color: t.textDim }}>Buscando dispositivos…</Text>
              </View>
            )}
            {!searching && !discovered && (
              <Text style={{ color: t.textDim }}>No se encontraron dispositivos.</Text>
            )}
            {!searching && discovered && (
              <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Ionicons name="watch-outline" size={18} color={t.textDim} style={{ marginRight: 8 }} />
                  <Text style={{ color: t.text, fontFamily: 'Inter_600SemiBold' }}>{discovered.name}</Text>
                </View>
                <TouchableOpacity onPress={connectDiscovered} disabled={connecting} style={[styles.button, { borderColor: t.border }]}>          
                  {connecting ? (
                    <>
                      <ActivityIndicator />
                      <Text style={{ marginLeft: 8, color: t.text }}>Conectando…</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="link-outline" size={16} color={t.text} style={{ marginRight: 6 }} />
                      <Text style={{ color: t.text }}>Conectar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
            <View style={{ height: 8 }} />
            <TouchableOpacity onPress={() => !connecting && setModalVisible(false)} style={[styles.closeBtn, { borderColor: t.border }]}>
              <Text style={{ color: t.text }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontFamily: 'Inter_600SemiBold', marginBottom: 8, fontSize: 16 },
  button: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: 320, maxWidth: '90%', padding: 16, borderRadius: 16, borderWidth: 1 },
  modalTitle: { fontFamily: 'Inter_600SemiBold', marginBottom: 8, fontSize: 16 },
  closeBtn: { alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
});

export default DataSourcesScreen;
