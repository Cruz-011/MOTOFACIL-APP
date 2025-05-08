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
import { useRouter } from 'expo-router';
import colors from '../../src/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function SelecaoPatio() {
  const [patios, setPatios] = useState([]);
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
    router.replace('/mapa');
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
        },
        style: 'destructive',
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity style={styles.touch} onPress={() => selecionar(item)}>
        <Text style={styles.cardText}>{item.nome}</Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => deletar(item.id)}>
          <Ionicons name="trash-outline" size={22} color="red" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push({ pathname: '/editar-patio', params: { id: item.id } })}>
          <Ionicons name="create-outline" size={22} color={colors.primary} />
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
        contentContainerStyle={{ flexGrow: 1 }}
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={() => router.push('/patio-config')}
      >
        <Text style={styles.botaoTexto}>+ Cadastrar Novo Pátio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20,paddingTop: 70 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
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
});
