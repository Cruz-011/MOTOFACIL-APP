import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemeContext } from '../../src/context/ThemeContext';

export default function SelecaoPatio() {
  const { temaEscuro, idioma } = useContext(ThemeContext);
  const tema = temaEscuro
    ? { fundo: '#1f2937', texto: '#fff', card: '#374151', primary: '#3b82f6', secundario: '#9ca3af' }
    : { fundo: '#f5f5f5', texto: '#000', card: '#fff', primary: '#3b82f6', secundario: '#6b7280' };

  const t = {
    selecionarPatio: idioma === 'pt' ? 'Selecione um Pátio' : idioma === 'es' ? 'Seleccione un Patio' : 'Select a Yard',
    nenhumPatio: idioma === 'pt' ? 'Nenhum pátio cadastrado.' : idioma === 'es' ? 'Ningún patio registrado.' : 'No yard registered.',
    conectarNovo: idioma === 'pt' ? '+ Conectar Novo Pátio' : idioma === 'es' ? '+ Conectar Nuevo Patio' : '+ Connect New Yard',
    miniMapa: idioma === 'pt' ? 'Mapa do Pátio' : idioma === 'es' ? 'Mapa del Patio' : 'Yard Map',
    miniMapaPlaceholder: idioma === 'pt' ? 'Mini mapa aqui...' : idioma === 'es' ? 'Mini mapa aquí...' : 'Mini map here...'
  };

  const [patios, setPatios] = useState([]);
  const [patioSelecionado, setPatioSelecionado] = useState(null);
  const router = useRouter();

  useEffect(() => { carregarPatios(); }, []);

  const carregarPatios = async () => {
    const dados = await AsyncStorage.getItem('@lista_patios');
    if (dados) setPatios(JSON.parse(dados));
  };

  const selecionar = async (patio) => {
    await AsyncStorage.setItem('@patio_selecionado', JSON.stringify(patio));
    setPatioSelecionado(patio);
  };

  const deletar = (id) => {
    Alert.alert(t.selecionarPatio, 'Tem certeza que deseja excluir este pátio?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        onPress: async () => {
          const novos = patios.filter((p) => p.id !== id);
          setPatios(novos);
          await AsyncStorage.setItem('@lista_patios', JSON.stringify(novos));
          if (patioSelecionado?.id === id) {
            setPatioSelecionado(null);
            await AsyncStorage.removeItem('@patio_selecionado');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: tema.card, borderColor: tema.primary }]}>
      <TouchableOpacity style={styles.touch} onPress={() => selecionar(item)}>
        <Text
          style={[
            styles.cardText,
            { color: tema.texto },
            patioSelecionado?.id === item.id && { fontWeight: 'bold', color: tema.primary },
          ]}
        >
          {item.nome}
        </Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => deletar(item.id)}>
          <Ionicons name="trash-outline" size={22} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: tema.fundo }]}>
      <Text style={[styles.title, { color: tema.primary }]}>{t.selecionarPatio}</Text>

      <FlatList
        data={patios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={[styles.empty, { color: tema.secundario }]}>{t.nenhumPatio}</Text>}
        contentContainerStyle={{ flexGrow: 0 }}
        style={{ maxHeight: 300 }}
      />

      {patioSelecionado && (
        <View style={[styles.miniMapa, { backgroundColor: tema.card, borderColor: tema.primary }]}>
          <Text style={[styles.miniMapaTitle, { color: tema.primary }]}>{t.miniMapa}: {patioSelecionado.nome}</Text>
          <View style={styles.mapaPlaceholder}>
            <Text style={{ color: tema.secundario }}>{t.miniMapaPlaceholder}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: tema.primary }]}
        onPress={() => router.push('/conectar-patio')}
      >
        <Text style={[styles.botaoTexto, { color: tema.texto }]}>{t.conectarNovo}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 70 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', borderWidth: 1, padding: 5, borderRadius: 8 },
  card: { padding: 14, borderRadius: 8, marginBottom: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  touch: { flex: 1 },
  cardText: { fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  botao: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  botaoTexto: { fontWeight: 'bold', fontSize: 16 },
  actions: { flexDirection: 'row', gap: 16, marginLeft: 16 },
  miniMapa: { marginTop: 20, padding: 12, borderRadius: 8, borderWidth: 1 },
  miniMapaTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  mapaPlaceholder: { height: 150, backgroundColor: '#e1e1e1', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
});
