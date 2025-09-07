import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ThemeContext } from "../../src/context/ThemeContext";

export default function SelecaoPatio() {
  const { temaEscuro, idioma } = useContext(ThemeContext);

  const tema = temaEscuro
    ? {
        fundo: "#111827",
        texto: "#fff",
        card: "#1f2937",
        primary: "#3b82f6",
        secundario: "#9ca3af",
      }
    : {
        fundo: "#f9fafb",
        texto: "#111827",
        card: "#fff",
        primary: "#2563eb",
        secundario: "#6b7280",
      };

  const t = {
    selecionarPatio:
      idioma === "pt"
        ? "Selecione um Pátio"
        : idioma === "es"
        ? "Seleccione un Patio"
        : "Select a Yard",
    nenhumPatio:
      idioma === "pt"
        ? "Nenhum pátio cadastrado."
        : idioma === "es"
        ? "Ningún patio registrado."
        : "No yard registered.",
    conectarNovo:
      idioma === "pt"
        ? "Conectar Novo Pátio"
        : idioma === "es"
        ? "Conectar Nuevo Patio"
        : "Connect New Yard",
    miniMapa:
      idioma === "pt"
        ? "Mapa do Pátio"
        : idioma === "es"
        ? "Mapa del Patio"
        : "Yard Map",
    miniMapaPlaceholder:
      idioma === "pt"
        ? "Visualização do pátio aqui..."
        : idioma === "es"
        ? "Vista del patio aquí..."
        : "Yard preview here...",
  };

  const [patios, setPatios] = useState([]);
  const [patioSelecionado, setPatioSelecionado] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

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
    Alert.alert(
      t.selecionarPatio,
      "Tem certeza que deseja excluir este pátio?",
      [
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
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isSelected = patioSelecionado?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: tema.card,
            borderColor: isSelected ? tema.primary : tema.secundario,
          },
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
          <Text
            style={[
              styles.cardText,
              { color: isSelected ? tema.primary : tema.texto },
            ]}
          >
            {item.nome}
          </Text>
        </View>
        <TouchableOpacity onPress={() => deletar(item.id)}>
          <Ionicons name="trash-outline" size={22} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.fundo }]}>
      <Text style={[styles.title, { color: tema.primary }]}>
        {t.selecionarPatio}
      </Text>

      {/* Botão de conectar no topo */}
      <TouchableOpacity
        style={[styles.botao, { backgroundColor: tema.primary }]}
        onPress={() => router.push("/conectar-patio")}
        activeOpacity={0.85}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={[styles.botaoTexto, { color: "#fff" }]}>
          {t.conectarNovo}
        </Text>
      </TouchableOpacity>

      {/* Lista de pátios */}
      <FlatList
        data={patios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: tema.secundario }]}>
            {t.nenhumPatio}
          </Text>
        }
        contentContainerStyle={{ flexGrow: 0 }}
        style={{ maxHeight: 250, marginTop: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Mini mapa ampliado */}
      {patioSelecionado && (
        <View
          style={[
            styles.miniMapa,
            { backgroundColor: tema.card, borderColor: tema.primary },
          ]}
        >
          <Text style={[styles.miniMapaTitle, { color: tema.primary }]}>
            {t.miniMapa}: {patioSelecionado.nome}
          </Text>
          <View style={styles.mapaPlaceholder}>
            <Ionicons name="map-outline" size={70} color={tema.secundario} />
            <Text style={{ color: tema.secundario, marginTop: 10, fontSize: 16 }}>
              {t.miniMapaPlaceholder}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },
  card: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  cardText: { fontSize: 16, fontWeight: "500" },
  empty: { textAlign: "center", marginTop: 40, fontSize: 16 },
  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 10,
    gap: 8,
    elevation: 2,
  },
  botaoTexto: { fontWeight: "600", fontSize: 16 },
  miniMapa: {
    flex: 1,
    marginTop: 25,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    elevation: 2,
  },
  miniMapaTitle: { fontWeight: "700", fontSize: 18, marginBottom: 12 },
  mapaPlaceholder: {
    flex: 1,
    minHeight: 250,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
