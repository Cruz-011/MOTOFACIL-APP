import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  FlatList,
  Modal,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import CadastroMotoAvancado from "../../components/CadastroMotoAvancado";
import MapaPatio from "../../components/MapaPatio";
import { ThemeContext } from "../../src/context/ThemeContext";
import api from "../../src/config/api";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Motos() {
  const { temaEscuro, idioma } = useContext(ThemeContext);

  const [motos, setMotos] = useState([]);
  const [motoSelecionada, setMotoSelecionada] = useState(null);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [busca, setBusca] = useState("");
  const [modalMoto, setModalMoto] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 Carregar motos do backend
  const carregarMotos = async () => {
    setRefreshing(true);
    try {
      const response = await api.get("/motos");
      const lista = response.data;

      // pega última localização de cada moto
      const listaComLocalizacao = await Promise.all(
        lista.map(async (m) => {
          try {
            const loc = await api.get(`/location/moto/${m.id}/latest`);
            return { ...m, localizacao: loc.data };
          } catch {
            return { ...m, localizacao: null };
          }
        })
      );

      setMotos(listaComLocalizacao);
    } catch (err) {
      console.error("Erro ao carregar motos:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarMotos();
  }, []);

  const onRefresh = useCallback(() => {
    carregarMotos();
  }, []);

  // 🔹 Criar moto no backend
  const handleNovaMoto = async (moto) => {
    try {
      const response = await api.post("/motos", moto);
      setMotos((prev) => [...prev, response.data]);
    } catch (err) {
      console.error("Erro ao cadastrar moto:", err);
    }
    setMostrarCadastro(false);
  };

  // 🔹 Atualizar localização fake (pingar)
  const pingarLocalizacao = async (moto) => {
    try {
      const dto = {
        x: -23.653 + Math.random() * 0.01, // simulação
        y: -46.532 + Math.random() * 0.01,
        motoId: moto.id,
      };
      const response = await api.put(`/motos/${moto.id}/location`, dto);
      carregarMotos();
      setMotoSelecionada(response.data);
    } catch (err) {
      console.error("Erro ao atualizar localização:", err);
    }
  };

  const abrirModal = (moto) => {
    setMotoSelecionada(moto);
    setModalMoto(true);
    setMostrarMapa(false);
  };

  // Cores e traduções (mantive iguais às suas)
  const tema = temaEscuro
    ? { fundo: "#1f2937", texto: "#fff", card: "#374151", border: "#2563eb", btnPrimary: "#3b82f6", btnDanger: "#ef4444" }
    : { fundo: "#f5f5f5", texto: "#000", card: "#fff", border: "#3b82f6", btnPrimary: "#3b82f6", btnDanger: "#ef4444" };

  const t = {
    pesquisar: idioma === "pt" ? "🔍 Pesquisar moto" : idioma === "es" ? "🔍 Buscar moto" : "🔍 Search bike",
    patio: idioma === "pt" ? "🏍️ Pátio" : idioma === "es" ? "🏍️ Patio" : "🏍️ Yard",
    mecanica: idioma === "pt" ? "🔧 Mecânica" : idioma === "es" ? "🔧 Mecánica" : "🔧 Mechanics",
    cadastrar: idioma === "pt" ? "➕ Cadastrar Nova Moto" : idioma === "es" ? "➕ Registrar Nueva Moto" : "➕ Add New Bike",
    cancelar: idioma === "pt" ? "✖️ Cancelar Cadastro" : idioma === "es" ? "✖️ Cancelar Registro" : "✖️ Cancel",
    localizar: idioma === "pt" ? "🗺️ Localizar Moto" : idioma === "es" ? "🗺️ Localizar Moto" : "🗺️ Locate Bike",
    fechar: idioma === "pt" ? "✖️ Fechar" : idioma === "es" ? "✖️ Cerrar" : "✖️ Close",
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: tema.fundo }]}>
      <TouchableOpacity
        style={[styles.btnCadastroTopo, { backgroundColor: tema.btnPrimary, borderColor: tema.border }]}
        onPress={() => setMostrarCadastro(!mostrarCadastro)}
      >
        <Text style={styles.btnText}>{mostrarCadastro ? t.cancelar : t.cadastrar}</Text>
      </TouchableOpacity>

      {mostrarCadastro && (
        <View style={[styles.cardCadastro, { backgroundColor: tema.card }]}>
          <CadastroMotoAvancado onRegistrarLocalizacao={handleNovaMoto} onFechar={() => setMostrarCadastro(false)} />
        </View>
      )}

      <TextInput
        style={[styles.searchInput, { backgroundColor: tema.card, color: tema.texto, borderColor: tema.border }]}
        placeholder={t.pesquisar}
        placeholderTextColor={temaEscuro ? "#9ca3af" : "#6b7280"}
        value={busca}
        onChangeText={setBusca}
      />

      <FlatList
        data={motos.filter(
          (m) =>
            m.placa?.toLowerCase().includes(busca.toLowerCase()) ||
            m.modelo?.toLowerCase().includes(busca.toLowerCase()) ||
            m.codigo?.toLowerCase().includes(busca.toLowerCase())
        )}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.motoItem, { backgroundColor: tema.card, borderLeftColor: item.localizacao ? "#10b981" : "#f59e0b" }]}
            onPress={() => abrirModal(item)}
          >
            <Text style={[styles.motoTitulo, { color: tema.texto }]}>{item.placa || item.codigo} - {item.modelo}</Text>
          </TouchableOpacity>
        )}
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {/* Modal Moto */}
      <Modal visible={modalMoto} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: tema.card }]}>
            {!mostrarMapa ? (
              <>
                <Text style={[styles.modalTitulo, { color: tema.texto }]}>{motoSelecionada?.placa || motoSelecionada?.codigo} - {motoSelecionada?.modelo}</Text>
                <Text style={{ color: tema.texto }}>Status: {motoSelecionada?.localizacao ? t.patio : "📌 Pendente"}</Text>

                <TouchableOpacity
                  style={[styles.btnPrimary, { backgroundColor: tema.btnPrimary }]}
                  onPress={() => pingarLocalizacao(motoSelecionada)}
                >
                  <Text style={styles.btnText}>📌 Atualizar Localização</Text>
                </TouchableOpacity>

                {motoSelecionada?.localizacao && (
                  <TouchableOpacity
                    style={[styles.btnPrimary, { backgroundColor: tema.btnPrimary }]}
                    onPress={() => setMostrarMapa(true)}
                  >
                    <Text style={styles.btnText}>{t.localizar}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.btnSecondary, { marginTop: 10, backgroundColor: tema.btnPrimary }]}
                  onPress={() => setModalMoto(false)}
                >
                  <Text style={styles.btnText}>{t.fechar}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <ScrollView contentContainerStyle={{ alignItems: "center" }}>
                <MapaPatio motoSelecionada={motoSelecionada} />
                <TouchableOpacity
                  style={[styles.btnSecondary, { marginTop: 20, backgroundColor: tema.btnPrimary }]}
                  onPress={() => setMostrarMapa(false)}
                >
                  <Text style={styles.btnText}>⬅️ Voltar</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, alignItems: "center", paddingTop: 50 },
  btnCadastroTopo: { padding: 14, borderRadius: 12, width: "100%", maxWidth: 600, marginBottom: 15, borderWidth: 1 },
  cardCadastro: { width: "100%", maxWidth: 600, marginBottom: 15 },
  searchInput: { width: "100%", maxWidth: 600, padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1 },
  motoItem: { padding: 12, borderRadius: 12, marginBottom: 10, borderLeftWidth: 5 },
  motoTitulo: { fontWeight: "bold", fontSize: 15 },
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { borderRadius: 16, padding: 20, width: "90%", maxWidth: 400, maxHeight: "80%" },
  modalTitulo: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  btnPrimary: { padding: 12, borderRadius: 10, marginTop: 10 },
  btnSecondary: { padding: 12, borderRadius: 10, marginTop: 10 },
  btnText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
