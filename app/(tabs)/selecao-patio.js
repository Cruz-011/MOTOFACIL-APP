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
import axios from "axios";
import { ThemeContext } from "../../src/context/ThemeContext";

const API_URL = "http://10.3.75.8:8080/api/patios"; // Substitua pelo seu endpoint real

export default function PatioManager() {
  const { temaEscuro, idioma } = useContext(ThemeContext);
  const [aba, setAba] = useState("lista"); // "lista" ou "conectar"

  const tema = temaEscuro
    ? { fundo: "#111827", texto: "#fff", card: "#1f2937", primary: "#3b82f6", secundario: "#9ca3af", ipBg: "#222" }
    : { fundo: "#f9fafb", texto: "#111827", card: "#fff", primary: "#2563eb", secundario: "#6b7280", ipBg: "#e9e9e9" };

  const t = {
    selecionarPatio: idioma === "pt" ? "Selecione um Pátio" : idioma === "es" ? "Seleccione un Patio" : "Select a Yard",
    nenhumPatio: idioma === "pt" ? "Nenhum pátio cadastrado." : idioma === "es" ? "Ningún patio registrado." : "No yard registered.",
    conectarNovo: idioma === "pt" ? "Conectar Novo Pátio" : idioma === "es" ? "Conectar Nuevo Patio" : "Connect New Yard",
    conectarESP32: idioma === "pt" ? "Cadastrar Novo Pátio" : idioma === "es" ? "Registrar Nuevo Patio" : "Register New Yard",
    nomePatio: idioma === "pt" ? "Nome do Pátio" : idioma === "es" ? "Nombre del Patio" : "Yard Name",
    enderecoPatio: idioma === "pt" ? "Endereço" : idioma === "es" ? "Dirección" : "Address",
    codigoUnico: idioma === "pt" ? "Código Único" : idioma === "es" ? "Código Único" : "Unique Code",
    esp32: idioma === "pt" ? "ESP32 Central" : idioma === "es" ? "ESP32 Central" : "ESP32 Central",
    cadastrar: idioma === "pt" ? "Cadastrar Pátio" : idioma === "es" ? "Registrar Patio" : "Register Yard",
    conectando: idioma === "pt" ? "Conectando..." : idioma === "es" ? "Conectando..." : "Connecting...",
    sucesso: idioma === "pt" ? "Cadastrado com sucesso!" : idioma === "es" ? "¡Registrado exitosamente!" : "Registered successfully!",
    erro: idioma === "pt" ? "Erro ao cadastrar." : idioma === "es" ? "Error al registrar." : "Failed to register.",
    informeCampos: idioma === "pt" ? "Informe todos os campos." : idioma === "es" ? "Ingrese todos los campos." : "Fill all fields.",
  };

  const [patios, setPatios] = useState([]);
  const [patioSelecionado, setPatioSelecionado] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [codigoUnico, setCodigoUnico] = useState("");
  const [esp32Central, setEsp32Central] = useState("");
  const [loading, setLoading] = useState(false);

  // ----------- Funções -----------

  const carregarPatios = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(API_URL);
      setPatios(response.data);
    } catch (error) {
      console.error("Erro ao carregar pátios:", error);
      Alert.alert("Erro", "Não foi possível carregar os pátios.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarPatios();
  }, []);

  const onRefresh = useCallback(() => {
    carregarPatios();
  }, []);

  const selecionar = (patio) => {
    setPatioSelecionado(patio);
  };

  const deletar = async (id) => {
    Alert.alert("Excluir", "Tem certeza que deseja excluir este pátio?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/${id}`);
            carregarPatios();
            if (patioSelecionado?.id === id) setPatioSelecionado(null);
          } catch (error) {
            console.error("Erro ao deletar:", error);
            Alert.alert("Erro", "Não foi possível excluir o pátio.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const cadastrarPatio = async () => {
    if (!nome || !endereco || !codigoUnico || !esp32Central) {
      Alert.alert("Atenção", t.informeCampos);
      return;
    }

    setLoading(true);
    try {
      await axios.post(API_URL, {
        nome,
        endereco,
        codigoUnico,
        esp32Central,
      });
      Alert.alert(t.sucesso);
      setNome(""); setEndereco(""); setCodigoUnico(""); setEsp32Central("");
      setAba("lista");
      carregarPatios();
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      Alert.alert("Erro", t.erro);
    } finally {
      setLoading(false);
    }
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
              style={[styles.card, { backgroundColor: tema.card, borderColor: isSelected ? tema.primary : tema.secundario }]}
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
          <Text style={[styles.miniMapaTitle, { color: tema.primary }]}>{patioSelecionado.nome}</Text>
          <View style={styles.mapaPlaceholder}>
            <Ionicons name="map-outline" size={70} color={tema.secundario} />
            <Text style={{ color: tema.secundario, marginTop: 10 }}>Visualização do pátio</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderConectar = () => (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.title, { color: tema.primary }]}>{t.conectarESP32}</Text>

        <TextInput
          placeholder={t.nomePatio}
          value={nome}
          onChangeText={setNome}
          style={[styles.input, { borderColor: tema.secundario, color: tema.texto, backgroundColor: tema.card }]}
          placeholderTextColor={tema.secundario}
        />
        <TextInput
          placeholder={t.enderecoPatio}
          value={endereco}
          onChangeText={setEndereco}
          style={[styles.input, { borderColor: tema.secundario, color: tema.texto, backgroundColor: tema.card }]}
          placeholderTextColor={tema.secundario}
        />
        <TextInput
          placeholder={t.codigoUnico}
          value={codigoUnico}
          onChangeText={setCodigoUnico}
          style={[styles.input, { borderColor: tema.secundario, color: tema.texto, backgroundColor: tema.card }]}
          placeholderTextColor={tema.secundario}
        />
        <TextInput
          placeholder={t.esp32}
          value={esp32Central}
          onChangeText={setEsp32Central}
          style={[styles.input, { borderColor: tema.secundario, color: tema.texto, backgroundColor: tema.card }]}
          placeholderTextColor={tema.secundario}
        />

        <TouchableOpacity style={[styles.botao, { backgroundColor: tema.primary }]} onPress={cadastrarPatio}>
          {loading ? <ActivityIndicator color={tema.texto} /> : <Text style={[styles.botaoTexto, { color: tema.texto }]}>{t.cadastrar}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botaoCancelar, { backgroundColor: tema.secundario }]} onPress={() => setAba("lista")}>
          <Text style={styles.botaoCancelarTexto}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return <View style={[styles.container, { backgroundColor: tema.fundo }]}>{aba === "lista" ? renderLista() : renderConectar()}</View>;
}

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
  mapaPlaceholder: { flex: 1, minHeight: 250, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  input: { marginTop: 15, borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  botaoCancelar: { marginTop: 18, padding: 12, borderRadius: 8, alignItems: "center" },
  botaoCancelarTexto: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
