import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';
import { ThemeContext } from '../src/context/ThemeContext';

export default function ConectarPatio() {
  const router = useRouter();
  const { temaEscuro, idioma } = useContext(ThemeContext);

  const tema = temaEscuro
    ? { fundo: '#1f2937', texto: '#fff', card: '#374151', primary: '#3b82f6', secundario: '#9ca3af' }
    : { fundo: '#f5f5f5', texto: '#000', card: '#fff', primary: '#3b82f6', secundario: '#6b7280' };

  const t = {
    conectarESP32: idioma === 'pt' ? 'Conectar ao ESP32' : idioma === 'es' ? 'Conectar al ESP32' : 'Connect to ESP32',
    buscar: idioma === 'pt' ? 'Buscar Dispositivos' : idioma === 'es' ? 'Buscar Dispositivos' : 'Search Devices',
    nomePatio: idioma === 'pt' ? 'Nome do Pátio' : idioma === 'es' ? 'Nombre del Patio' : 'Yard Name',
    conectarCadastrar: idioma === 'pt' ? 'Conectar e Cadastrar' : idioma === 'es' ? 'Conectar y Registrar' : 'Connect & Register',
    cancelar: idioma === 'pt' ? 'Cancelar' : idioma === 'es' ? 'Cancelar' : 'Cancel'
  };

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

  const cancelarCadastro = () => router.replace('/selecao-patio');

  return (
    <View style={[styles.container, { backgroundColor: tema.fundo }]}>
      <Text style={[styles.title, { color: tema.primary }]}>{t.conectarESP32}</Text>

      <TouchableOpacity style={[styles.buscarBtn, { backgroundColor: tema.primary }]} onPress={buscarESP32}>
        <Ionicons name="bluetooth" size={20} color={tema.texto} />
        <Text style={[styles.buscarTexto, { color: tema.texto }]}>{t.buscar}</Text>
      </TouchableOpacity>

      {dispositivos.length > 0 && (
        <FlatList
          data={dispositivos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.dispositivo,
                { backgroundColor: tema.card, borderColor: tema.secundario },
                selecionado?.id === item.id && { borderColor: tema.primary, borderWidth: 2 },
              ]}
              onPress={() => setSelecionado(item)}
            >
              <Text style={[styles.dispositivoTexto, { color: tema.texto }]}>{item.nome}</Text>
            </TouchableOpacity>
          )}
          style={{ marginVertical: 20 }}
        />
      )}

      <TextInput
        placeholder={t.nomePatio}
        value={nome}
        onChangeText={setNome}
        style={[styles.input, { borderColor: tema.secundario, color: tema.texto, backgroundColor: tema.card }]}
        placeholderTextColor={tema.secundario}
      />

      <TouchableOpacity style={[styles.botao, { backgroundColor: tema.primary }]} onPress={cadastrarPatio}>
        <Text style={[styles.botaoTexto, { color: tema.texto }]}>{t.conectarCadastrar}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoCancelar} onPress={cancelarCadastro}>
        <Text style={styles.botaoCancelarTexto}>{t.cancelar}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 70 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  buscarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    justifyContent: 'center',
    gap: 10,
  },
  buscarTexto: { fontWeight: 'bold' },
  dispositivo: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  dispositivoTexto: { fontSize: 16 },
  input: { marginTop: 20, paddingTop: 14, borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 },
  botao: { padding: 14, borderRadius: 8, alignItems: 'center' },
  botaoTexto: { paddingBottom: 2, fontWeight: 'bold', fontSize: 16 },
  botaoCancelar: { marginTop: 12, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#555' },
  botaoCancelarTexto: { color: 'white', fontWeight: 'bold', fontSize: 15 },
});
