import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import colors from '../src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';

export default function ConectarPatio() {
  const router = useRouter();
  const [dispositivos, setDispositivos] = useState([]);
  const [nome, setNome] = useState('');
  const [selecionado, setSelecionado] = useState(null);

  const buscarESP32 = () => {
    setDispositivos([
      { id: 'esp32_1', nome: 'ESP32-Central-001' },
      { id: 'esp32_2', nome: 'ESP32-Central-002' },
    ]);
  };

  const cadastrarPatio = async () => {
    if (!nome || !selecionado) {
      Alert.alert('Atenção', 'Informe o nome do pátio e selecione o ESP32.');
      return;
    }

    const novoPatio = {
      id: uuid.v4(),
      nome,
      espId: selecionado.id,
      criadoEm: new Date().toISOString(),
    };

    const dados = await AsyncStorage.getItem('@lista_patios');
    const lista = dados ? JSON.parse(dados) : [];

    lista.push(novoPatio);
    await AsyncStorage.setItem('@lista_patios', JSON.stringify(lista));
    await AsyncStorage.setItem('@patio_selecionado', JSON.stringify(novoPatio));

    router.replace('/selecao-patio');
  };

  const cancelarCadastro = () => {
    router.replace('/selecao-patio');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conectar ao ESP32</Text>

      <TouchableOpacity style={styles.buscarBtn} onPress={buscarESP32}>
        <Ionicons name="bluetooth" size={20} color="white" />
        <Text style={styles.buscarTexto}>Buscar Dispositivos</Text>
      </TouchableOpacity>

      {dispositivos.length > 0 && (
        <FlatList
          data={dispositivos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.dispositivo,
                selecionado?.id === item.id && styles.dispositivoSelecionado,
              ]}
              onPress={() => setSelecionado(item)}
            >
              <Text style={styles.dispositivoTexto}>{item.nome}</Text>
            </TouchableOpacity>
          )}
          style={{ marginVertical: 20 }}
        />
      )}

      <TextInput
        placeholder="Nome do Pátio"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.botao} onPress={cadastrarPatio}>
        <Text style={styles.botaoTexto}>Conectar e Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoCancelar} onPress={cancelarCadastro}>
        <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
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
  },
  buscarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    justifyContent: 'center',
    gap: 10,
  },
  buscarTexto: {
    color: 'white',
    fontWeight: 'bold',
  },
  dispositivo: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderColor: colors.secondary,
    borderWidth: 1,
    marginBottom: 10,
  },
  dispositivoSelecionado: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  dispositivoTexto: {
    color: colors.text,
    fontSize: 16,
  },
  input: {
    marginTop: 20,
    paddingTop: 14,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    marginBottom: 20,
  },
  botao: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: {
    paddingBottom: 2,
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  botaoCancelar: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#555',
  },
  botaoCancelarTexto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
