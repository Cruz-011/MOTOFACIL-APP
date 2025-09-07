import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import uuid from 'react-native-uuid';
import { ThemeContext } from '../src/context/ThemeContext';

export default function ConectarPatio() {
  const router = useRouter();
  const { temaEscuro, idioma } = useContext(ThemeContext);

  const tema = temaEscuro
    ? { fundo: '#181818', texto: '#fff', card: '#222', primary: '#3b82f6', secundario: '#9ca3af', ipBg: '#222' }
    : { fundo: '#fff', texto: '#181818', card: '#e9e9e9', primary: '#3b82f6', secundario: '#666', ipBg: '#e9e9e9' };

  const t = {
    conectarESP32: idioma === 'pt' ? 'Conectar ao ESP32 por IP' : idioma === 'es' ? 'Conectar al ESP32 por IP' : 'Connect to ESP32 by IP',
    ip: idioma === 'pt' ? 'Endereço IP do ESP32' : idioma === 'es' ? 'Dirección IP del ESP32' : 'ESP32 IP Address',
    nomePatio: idioma === 'pt' ? 'Nome do Pátio' : idioma === 'es' ? 'Nombre del Patio' : 'Yard Name',
    conectar: idioma === 'pt' ? 'Conectar' : idioma === 'es' ? 'Conectar' : 'Connect',
    cadastrar: idioma === 'pt' ? 'Cadastrar Pátio' : idioma === 'es' ? 'Registrar Patio' : 'Register Yard',
    cancelar: idioma === 'pt' ? 'Cancelar' : idioma === 'es' ? 'Cancelar' : 'Cancel',
    conectando: idioma === 'pt' ? 'Conectando...' : idioma === 'es' ? 'Conectando...' : 'Connecting...',
    sucesso: idioma === 'pt' ? 'Conectado com sucesso ao ESP32!' : idioma === 'es' ? '¡Conectado exitosamente al ESP32!' : 'Connected successfully to ESP32!',
    erro: idioma === 'pt' ? 'Falha ao conectar. Verifique o IP e se o ESP32 está ligado.' : idioma === 'es' ? 'Error al conectar. Verifique la IP y el ESP32.' : 'Failed to connect. Check IP and ESP32.',
    informeCampos: idioma === 'pt' ? 'Informe o nome do pátio e o IP.' : idioma === 'es' ? 'Ingrese el nombre y la IP.' : 'Enter name and IP.',
    buscarRede: idioma === 'pt' ? 'Buscar ESP32 na rede' : idioma === 'es' ? 'Buscar ESP32 en la red' : 'Scan ESP32 on network',
  };

  const [nome, setNome] = useState('');
  const [ip, setIp] = useState('');
  const [conectando, setConectando] = useState(false);
  const [conectado, setConectado] = useState(false);
  const [erroConexao, setErroConexao] = useState('');
  const [ipsEncontrados, setIpsEncontrados] = useState([]);
  const [buscando, setBuscando] = useState(false);

  const conectarPorIp = async () => {
    setErroConexao('');
    if (!nome || !ip) {
      Alert.alert('Atenção', t.informeCampos);
      return;
    }
    setConectando(true);
    setConectado(false);

    setTimeout(() => {
      setConectando(false);
      setConectado(true);
      Alert.alert(t.sucesso);
    }, 1200);
  };

  const cadastrarPatio = async () => {
    if (!nome || !ip || !conectado) {
      Alert.alert('Atenção', t.informeCampos);
      return;
    }
    const novoPatio = {
      id: uuid.v4(),
      nome,
      ip,
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

  const buscarIpsNaRede = async () => {
    setBuscando(true);
    setIpsEncontrados([]);
    setTimeout(() => {
      setIpsEncontrados([
        { ip: '192.168.0.101', nome: 'ESP32-101' },
        { ip: '192.168.0.102', nome: 'ESP32-102' },
        { ip: '192.168.0.103', nome: 'ESP32-103' },
      ]);
      setBuscando(false);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: tema.fundo }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.title, { color: tema.primary }]}>{t.conectarESP32}</Text>

        <TouchableOpacity
          style={[styles.buscarBtn, { backgroundColor: tema.primary }]}
          onPress={buscarIpsNaRede}
          disabled={buscando}
        >
          {buscando ? <ActivityIndicator color={tema.texto} /> : <Text style={[styles.buscarTexto, { color: tema.texto }]}>{t.buscarRede}</Text>}
        </TouchableOpacity>

        <FlatList
          data={ipsEncontrados}
          keyExtractor={(item) => item.ip}
          nestedScrollEnabled
          style={{ marginBottom: 15 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.ipItem, { backgroundColor: tema.ipBg }, ip === item.ip && { borderColor: tema.primary, borderWidth: 2 }]}
              onPress={() => setIp(item.ip)}
            >
              <Text style={{ color: tema.texto, fontWeight: 'bold' }}>{item.nome}</Text>
              <Text style={{ color: tema.texto }}>{item.ip}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={null}
        />

        <TextInput
          placeholder={t.ip}
          value={ip}
          onChangeText={setIp}
          style={[styles.input, { borderColor: tema.secundario, color: tema.texto, backgroundColor: tema.card }]}
          placeholderTextColor={tema.secundario}
          keyboardType="numeric"
          autoCapitalize="none"
        />

        <TextInput
          placeholder={t.nomePatio}
          value={nome}
          onChangeText={setNome}
          style={[styles.input, { borderColor: tema.secundario, color: tema.texto, backgroundColor: tema.card }]}
          placeholderTextColor={tema.secundario}
        />

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: tema.primary }]}
          onPress={conectarPorIp}
          disabled={conectando || conectado}
        >
          {conectando ? <ActivityIndicator color={tema.texto} /> : <Text style={[styles.botaoTexto, { color: tema.texto }]}>{t.conectar}</Text>}
        </TouchableOpacity>

        {conectado && <Text style={{ color: tema.primary, textAlign: 'center', marginTop: 10 }}>{t.sucesso}</Text>}
        {erroConexao !== '' && <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{erroConexao}</Text>}

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: conectado ? tema.primary : tema.secundario, marginTop: 10 }]}
          onPress={cadastrarPatio}
          disabled={!conectado}
        >
          <Text style={[styles.botaoTexto, { color: tema.texto }]}>{t.cadastrar}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botaoCancelar, { backgroundColor: tema.secundario }]} onPress={cancelarCadastro}>
          <Text style={styles.botaoCancelarTexto}>{t.cancelar}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center',marginTop:40 },
  input: { marginTop: 15, borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 10 },
  botao: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  botaoTexto: { fontWeight: 'bold', fontSize: 16 },
  botaoCancelar: { marginTop: 18, padding: 12, borderRadius: 8, alignItems: 'center' },
  botaoCancelarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  buscarBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, justifyContent: 'center', marginBottom: 10 },
  buscarTexto: { fontWeight: 'bold', fontSize: 16 },
  ipItem: { padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#ccc' },
});
