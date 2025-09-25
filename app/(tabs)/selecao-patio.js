import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { ThemeContext } from "../../src/context/ThemeContext";

export default function PatioManager() {
  const { temaEscuro, idioma } = useContext(ThemeContext);
  const [aba, setAba] = useState("lista"); // "lista" ou "conectar"

  // ----------- Tema e traduções -----------
  const tema = temaEscuro
    ? { fundo: "#111827", texto: "#fff", card: "#1f2937", primary: "#3b82f6", secundario: "#9ca3af", ipBg: "#222" }
    : { fundo: "#f9fafb", texto: "#111827", card: "#fff", primary: "#2563eb", secundario: "#6b7280", ipBg: "#e9e9e9" };

  const t = {
    selecionarPatio: idioma === "pt" ? "Selecione um Pátio" : idioma === "es" ? "Seleccione un Patio" : "Select a Yard",
    nenhumPatio: idioma === "pt" ? "Nenhum pátio cadastrado." : idioma === "es" ? "Ningún patio registrado." : "No yard registered.",
    conectarNovo: idioma === "pt" ? "Conectar Novo Pátio" : idioma === "es" ? "Conectar Nuevo Patio" : "Connect New Yard",
    miniMapa: idioma === "pt" ? "Mapa do Pátio" : idioma === "es" ? "Mapa del Patio" : "Yard Map",
    miniMapaPlaceholder: idioma === "pt" ? "Visualização do pátio aqui..." : idioma === "es" ? "Vista del patio aquí..." : "Yard preview here...",
    conectarESP32: idioma === "pt" ? "Conectar ao ESP32 por IP" : idioma === "es" ? "Conectar al ESP32 por IP" : "Connect to ESP32 by IP",
    ip: idioma === "pt" ? "Endereço IP do ESP32" : idioma === "es" ? "Dirección IP del ESP32" : "ESP32 IP Address",
    nomePatio: idioma === "pt" ? "Nome do Pátio" : idioma === "es" ? "Nombre del Patio" : "Yard Name",
    conectar: idioma === "pt" ? "Conectar" : idioma === "es" ? "Conectar" : "Connect",
    cadastrar: idioma === "pt" ? "Cadastrar Pátio" : idioma === "es" ? "Registrar Patio" : "Register Yard",
    conectando: idioma === "pt" ? "Conectando..." : idioma === "es" ? "Conectando..." : "Connecting...",
    sucesso: idioma === "pt" ? "Conectado com sucesso!" : idioma === "es" ? "¡Conectado exitosamente!" : "Connected successfully!",
    erro: idioma === "pt" ? "Falha ao conectar. Verifique o IP." : idioma === "es" ? "Error al conectar." : "Failed to connect.",
    informeCampos: idioma === "pt" ? "Informe o nome e o IP." : idioma === "es" ? "Ingrese el nombre y la IP." : "Enter name and IP.",
    buscarRede: idioma === "pt" ? "Buscar ESP32 na rede" : idioma === "es" ? "Buscar ESP32 en la red" : "Scan ESP32 on network",
  };

  // ----------- Estados -----------
  const [patios, setPatios] = useState([]);
  const [patioSelecionado, setPatioSelecionado] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [nome, setNome] = useState("");
  const [ip, setIp] = useState("");
  const [conectando, setConectando] = useState(false);
  const [conectado, setConectado] = useState(false);
  const [ipsEncontrados, setIpsEncontrados] = useState([]);
  const [buscando, setBuscando] = useState(false);

  // ----------- Funções -----------
  const carregarPatios = async () => {
    setRefreshing(true);
    const dados = await AsyncStorage.getItem("@lista_patios");
    if (dados) setPatios(JSON.parse(dados));
    setRefreshing(false);
  };

  useEffect(() => {
    carregarPatios();
  }, []);

  const onRefresh = useCallback(() => {
    carregarPatios();
  }, []);

  const selecionar = async (patio) => {
    await AsyncStorage.setItem("@patio_selecionado", JSON.stringify(patio));
    setPatioSelecionado(patio);
  };

  const deletar = (id) => {
    Alert.alert("Excluir", "Tem certeza que deseja excluir este pátio?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        onPress: async () => {
          const novos = patios.filter((p) => p.id !== id);
          setPatios(novos);
          await AsyncStorage.setItem("@lista_patios", JSON.stringify(novos));
          if (patioSelecionado?.id === id) {
            setPatioSelecionado(null);
            await AsyncStorage.removeItem("@patio_selecionado");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const conectarPorIp = async () => {
    if (!nome || !ip) {
      Alert.alert("Atenção", t.informeCampos);
      return;
    }
    setConectando(true);
    setTimeout(() => {
      setConectando(false);
      setConectado(true);
      Alert.alert(t.sucesso);
    }, 1200);
  };

  const cadastrarPatio = async () => {
    if (!nome || !ip || !conectado) {
      Alert.alert("Atenção", t.informeCampos);
      return;
    }
    const novoPatio = { id: uuid.v4(), nome, ip, criadoEm: new Date().toISOString() };
    const dados = await AsyncStorage.getItem("@lista_patios");
    const lista = dados ? JSON.parse(dados) : [];
    lista.push(novoPatio);
    await AsyncStorage.setItem("@lista_patios", JSON.stringify(lista));
    await AsyncStorage.setItem("@patio_selecionado", JSON.stringify(novoPatio));
    setPatios(lista);
    setAba("lista");
    setNome("");
    setIp("");
    setConectado(false);
  };

  const buscarIpsNaRede = async () => {
    setBuscando(true);
    setIpsEncontrados([]);
    setTimeout(() => {
      setIpsEncontrados([
        { ip: "192.168.0.101", nome: "ESP32-101" },
        { ip: "192.168.0.102", nome: "ESP32-102" },
        { ip: "192.168.0.103", nome: "ESP32-103" },
      ]);
      setBuscando(false);
    }, 1500);
  };

  // ----------- Render -----------
  const renderLista = () => (
    <View>
      <Text style={[styles.title, { color: tema.primary }]}>{t.selecionarPatio}</Text>

      <TouchableOpacity style={[styles.botao, { backgroundColor: tema.primary }]} onPress={() => setAba("conectar")}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={[styles.botaoTexto, { color: "#fff" }]}>{t.conectarNovo}</Text>
      </TouchableOpacity>

      <FlatList
        data={patios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isSelected = patioSelecionado?.id === item.id;
          return (
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: tema.card, borderColor: isSelected ? tema.primary : tema.secundario },
              ]}
              onPress={() => selecionar(item)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Ionicons
                  name={isSelected ? "home" : "home-outline"}
                  size={22}
                  color={isSelected ? tema.primary : tema.secundario}
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.cardText, { color: isSelected ? tema.primary : tema.texto }]}>{item.nome}</Text>
              </View>
              <TouchableOpacity onPress={() => deletar(item.id)}>
                <Ionicons name="trash-outline" size={22} color="red" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={[styles.empty, { color: tema.secundario }]}>{t.nenhumPatio}</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={{ marginTop: 20, maxHeight: 250 }}
      />

      {patioSelecionado && (
        <View style={[styles.miniMapa, { backgroundColor: tema.card, borderColor: tema.primary }]}>
          <Text style={[styles.miniMapaTitle, { color: tema.primary }]}>{t.miniMapa}: {patioSelecionado.nome}</Text>
          <View style={styles.mapaPlaceholder}>
            <Ionicons name="map-outline" size={70} color={tema.secundario} />
            <Text style={{ color: tema.secundario, marginTop: 10 }}>{t.miniMapaPlaceholder}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderConectar = () => (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.title, { color: tema.primary }]}>{t.conectarESP32}</Text>

        <TouchableOpacity style={[styles.buscarBtn, { backgroundColor: tema.primary }]} onPress={buscarIpsNaRede}>
          {buscando ? <ActivityIndicator color={tema.texto} /> : <Text style={{ color: tema.texto }}>{t.buscarRede}</Text>}
        </TouchableOpacity>

        {ipsEncontrados.map((item) => (
          <TouchableOpacity
            key={item.ip}
            style={[styles.ipItem, { backgroundColor: tema.ipBg }, ip === item.ip && { borderColor: tema.primary, borderWidth: 2 }]}
            onPress={() => setIp(item.ip)}
          >
            <Text style={{ color: tema.texto, fontWeight: "bold" }}>{item.nome}</Text>
            <Text style={{ color: tema.texto }}>{item.ip}</Text>
          </TouchableOpacity>
        ))}

        <TextInput
          placeholder={t.ip}
          value={ip}
          onChangeText={setIp}
          style={[styles.input, { borderColor: tema.secundario, color: tema.texto, backgroundColor: tema.card }]}
          placeholderTextColor={tema.secundario}
          keyboardType="numeric"
        />

        <TextInput
          placeholder={t.nomePatio}
          value={nome}
          onChangeText={setNome}
          style={[styles.input, { borderColor: tema.secundario, color: tema.texto, backgroundColor: tema.card }]}
          placeholderTextColor={tema.secundario}
        />

        <TouchableOpacity style={[styles.botao, { backgroundColor: tema.primary }]} onPress={conectarPorIp}>
          {conectando ? <ActivityIndicator color={tema.texto} /> : <Text style={[styles.botaoTexto, { color: tema.texto }]}>{t.conectar}</Text>}
        </TouchableOpacity>

        {conectado && (
          <TouchableOpacity style={[styles.botao, { backgroundColor: tema.primary, marginTop: 10 }]} onPress={cadastrarPatio}>
            <Text style={[styles.botaoTexto, { color: tema.texto }]}>{t.cadastrar}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.botaoCancelar, { backgroundColor: tema.secundario }]} onPress={() => setAba("lista")}>
          <Text style={styles.botaoCancelarTexto}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return <View style={[styles.container, { backgroundColor: tema.fundo }]}>{aba === "lista" ? renderLista() : renderConectar()}</View>;
}

// ----------- Styles -----------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 15, textAlign: "center" },
  card: { padding: 14, borderRadius: 10, marginBottom: 12, borderWidth: 1.5, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardText: { fontSize: 16, fontWeight: "500" },
  empty: { textAlign: "center", marginTop: 40, fontSize: 16 },
  botao: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 10, gap: 8, marginTop: 10 },
  botaoTexto: { fontWeight: "600", fontSize: 16 },
  miniMapa: { flex: 1, marginTop: 25, padding: 18, borderRadius: 12, borderWidth: 1.5 },
  miniMapaTitle: { fontWeight: "700", fontSize: 18, marginBottom: 12 },
  mapaPlaceholder: { flex: 1, minHeight: 250, backgroundColor: "#e5e7eb", borderRadius: 10, justifyContent: "center", alignItems: "center" },
  input: { marginTop: 15, borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  buscarBtn: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 8, justifyContent: "center", marginBottom: 10 },
  ipItem: { padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1 },
  botaoCancelar: { marginTop: 18, padding: 12, borderRadius: 8, alignItems: "center" },
  botaoCancelarTexto: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
