import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SelecaoPatio() {
  const [patios, setPatios] = useState([]);
  const [patioSelecionado, setPatioSelecionado] = useState(null);
  const router = useRouter();

  useEffect(() => {
    carregarPatios();
  }, []);

  const carregarPatios = async () => {
    const dados = await AsyncStorage.getItem('@lista_patios');
    if (dados) setPatios(JSON.parse(dados));
  };

  const selecionar = async (patio) => {
    await AsyncStorage.setItem('@patio_selecionado', JSON.stringify(patio));
    setPatioSelecionado(patio);
  };

  const deletar = (id) => {
    Alert.alert('Excluir Pátio', 'Tem certeza que deseja excluir este pátio?', [
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
    <View style={styles.card}>
      <TouchableOpacity style={styles.touch} onPress={() => selecionar(item)}>
        <Text
          style={[
            styles.cardText,
            patioSelecionado?.id === item.id && { fontWeight: 'bold', color: colors.primary },
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
    <View style={styles.container}>
      <Text style={styles.title}>Selecione um Pátio</Text>

      <FlatList
        data={patios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum pátio cadastrado.</Text>}
        contentContainerStyle={{ flexGrow: 0 }}
        style={{ maxHeight: 300 }}
      />

      {/* Mini mapa inline */}
      {patioSelecionado && (
        <View style={styles.miniMapa}>
          <Text style={styles.miniMapaTitle}>Mapa do Pátio: {patioSelecionado.nome}</Text>
          {/* Placeholder do mapa */}
          <View style={styles.mapaPlaceholder}>
            <Text style={{ color: colors.textSecondary }}>Mini mapa aqui...</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.botao}
        onPress={() => router.push('/conectar-patio')}
      >
        <Text style={styles.botaoTexto}>+ Conectar Novo Pátio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 70 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  card: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  touch: { flex: 1 },
  cardText: { color: colors.text, fontSize: 16 },
  empty: {
    color: colors.secondary,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  botao: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  botaoTexto: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginLeft: 16,
  },
  miniMapa: {
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  miniMapaTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: colors.primary,
  },
  mapaPlaceholder: {
    height: 150,
    backgroundColor: '#e1e1e1',
    borderRadius: 6,

    justifyContent: 'center',
    alignItems: 'center',
  },
});
