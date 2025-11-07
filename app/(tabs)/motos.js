import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  UIManager,
  StyleSheet,
} from "react-native";
import { ThemeContext } from "../../src/context/ThemeContext";
import MapaPatio from "../../components/MapaPatio";
import api from "../../src/config/api";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const modelosDisponiveis = [
  { nome: "Mottu Sport" },
  { nome: "Mottu E" },
  { nome: "Mottu Pop" },
];

const categoriasDisponiveis = ["aluguel", "aquisição", "mecanica"];

function gerarCodigoAleatorio() {
  return "MOTO-" + Math.floor(Math.random() * 1000000);
}

const validarEsp32Central = (valor) => {
  const regex = /^([a-zA-Z0-9\.\-]+)$/;
  return regex.test(valor.trim());
};

export default function Motos() {
  const { temaEscuro, idioma } = useContext(ThemeContext);
  const [motos, setMotos] = useState([]);
  const [patios, setPatios] = useState([]);
  const [motoSelecionada, setMotoSelecionada] = useState(null);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [busca, setBusca] = useState("");
  const [modalMoto, setModalMoto] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [placa, setPlaca] = useState("");
  const [chassi, setChassi] = useState("");
  const [modelo, setModelo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [patioSelecionado, setPatioSelecionado] = useState(null);
  const [novoPatioSelecionado, setNovoPatioSelecionado] = useState(null);

  const tema = temaEscuro
    ? { fundo: "#1f2937", texto: "#fff", card: "#374151", border: "#2563eb", btnPrimary: "#3b82f6", btnDanger: "#ef4444", secundario: "#9ca3af" }
    : { fundo: "#f5f5f5", texto: "#000", card: "#fff", border: "#3b82f6", btnPrimary: "#3b82f6", btnDanger: "#ef4444", secundario: "#6b7280" };

  const t = {
    pesquisar: idioma === "pt" ? "🔍 Pesquisar moto" : idioma === "es" ? "🔍 Buscar moto" : "🔍 Search bike",
    cadastrar: idioma === "pt" ? "➕ Cadastrar Nova Moto" : idioma === "es" ? "➕ Registrar Nueva Moto" : "➕ Add New Bike",
    cancelar: idioma === "pt" ? "✖️ Cancelar Cadastro" : idioma === "es" ? "✖️ Cancelar Registro" : "✖️ Cancel",
    localizar: idioma === "pt" ? "🗺️ Localizar Moto" : idioma === "es" ? "🗺️ Localizar Moto" : "🗺️ Locate Bike",
    fechar: idioma === "pt" ? "✖️ Fechar" : idioma === "es" ? "✖️ Cerrar" : "✖️ Close",
    enviarMecanica: idioma === "pt" ? "🔧 Enviar para Mecânica" : "🔧 Enviar a Mecánica",
    voltarPatio: idioma === "pt" ? "🏍️ Voltar para Pátio" : "🏍️ Volver al Patio",
    removerMoto: idioma === "pt" ? "🗑️ Remover Moto" : "🗑️ Eliminar Moto",
  };

  const carregarMotos = async () => {
    setRefreshing(true);
    try {
      const [respMotos, respPatios] = await Promise.all([api.get("/motos"), api.get("/patios")]);
      const patiosData = Array.isArray(respPatios.data) ? respPatios.data : [];
      setPatios(patiosData);
      const motosData = Array.isArray(respMotos.data)
        ? respMotos.data.map((m) => ({
          ...m,
          localizacao: m.patio?.coordenadasExtremidade?.length > 0 ? m.patio.coordenadasExtremidade : null,
        }))
        : [];
      setMotos(motosData);
    } catch (err) {
      console.log("Erro na API:", err.response?.status, err.response?.data || err.message);
      Alert.alert("Erro", "Não foi possível carregar motos ou pátios.");
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

  const registrar = async () => {
    if (!modelo || !categoria || !patioSelecionado) {
      Alert.alert("Campos obrigatórios", "Modelo, Categoria e Pátio são obrigatórios.");
      return;
    }
    if (!patioSelecionado.esp32Central) {
      Alert.alert("Pátio inválido", "Informe um IP válido para o ESP32 Central.");
      return;
    }
    const codigoFinal = codigo || gerarCodigoAleatorio();
    try {
      const response = await api.post("/motos", {
        placa: placa || null,
        chassi: chassi || null,
        modelo,
        categoria,
        codigo: codigoFinal,
        descricao: descricao || null,
        patio: { id: patioSelecionado.id },
        ativo: true,
      });
      setMotos((prev) => [...prev, { ...response.data, localizacao: null }]);
      Alert.alert("Sucesso", "Moto cadastrada com sucesso!");
      setPlaca(""); setChassi(""); setModelo(""); setCategoria(""); setCodigo(""); setDescricao(""); setPatioSelecionado(null); setMostrarCadastro(false);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível cadastrar a moto.");
    }
  };

  const atualizarLocalizacao = async (moto, x, y) => {
    const patioId = moto.patio?.id || novoPatioSelecionado?.id;
    if (!patioId) {
      Alert.alert("Erro", "Selecione um pátio antes de atualizar a localização.");
      return;
    }
    try {
      await api.put(`/motos/${moto.id}/location`, { x, y, patioId, tag: "patio" });
      const locationResp = await api.get(`/motos/${moto.id}/location`);
      setMotoSelecionada({ ...moto, localizacao: locationResp.data, patio: { id: patioId } });
      setMostrarMapa(true);
      carregarMotos();
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar a localização.");
    }
  };

  const abrirModal = (moto) => {
    setMotoSelecionada(moto);
    setModalMoto(true);
    setMostrarMapa(false);
    setNovoPatioSelecionado(null);
  };

  const enviarParaMecanica = async () => {
    try {
      await api.put(`/motos/${motoSelecionada.id}/status`, { status: "mecanica" });
      Alert.alert("Status alterado", "Moto enviada para a mecânica!");
      setModalMoto(false);
      carregarMotos();
    } catch {
      Alert.alert("Erro", "Não foi possível mudar o status.");
    }
  };

  const voltarParaPatio = async () => {
    if (!novoPatioSelecionado) {
      Alert.alert("Selecione um pátio para retornar");
      return;
    }
    try {
      await api.put(`/motos/${motoSelecionada.id}/status`, { status: "patio", patioId: novoPatioSelecionado.id });
      setModalMoto(false);
      carregarMotos();
    } catch {
      Alert.alert("Erro", "Não foi possível voltar ao pátio.");
    }
  };

  // 🚮 Função de remover moto
  const removerMoto = async () => {
    Alert.alert(
      "Remover Moto",
      "Tem certeza que deseja remover esta moto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/motos/${motoSelecionada.id}`);
              Alert.alert("Removida", "Moto removida com sucesso!");
              setModalMoto(false);
              carregarMotos();
            } catch {
              Alert.alert("Erro", "Não foi possível remover a moto.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={tema.btnPrimary} />
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

      <TextInput style={[styles.searchInput, { borderColor: tema.border, color: tema.texto }]} placeholder={t.pesquisar} placeholderTextColor={tema.secundario} value={busca} onChangeText={setBusca} />

      <FlatList
        data={motos.filter((m) => (m.placa || m.codigo || m.modelo)?.toLowerCase().includes(busca.toLowerCase()))}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.motoItem, { borderLeftColor: item.localizacao ? "#10b981" : "#f59e0b" }]} onPress={() => abrirModal(item)}>
            <Text style={[styles.motoTitulo, { color: tema.texto }]}>{item.placa || item.codigo} - {item.modelo} ({item.patio?.nome || "Sem Pátio"})</Text>
          </TouchableOpacity>
        )}
        style={{ flex: 1, width: "100%" }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <Modal visible={modalMoto} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: tema.card }]}>
            {!mostrarMapa ? (
              <>
                <Text style={[styles.modalTitulo, { color: tema.texto }]}>
                  {motoSelecionada?.placa || motoSelecionada?.codigo} - {motoSelecionada?.modelo}
                </Text>
                <Text style={{ color: tema.texto }}>Categoria: {motoSelecionada?.categoria}</Text>
                <Text style={{ color: tema.texto }}>Chassi: {motoSelecionada?.chassi}</Text>
                <Text style={{ color: tema.texto }}>Descrição: {motoSelecionada?.descricao}</Text>
                <Text style={{ color: tema.texto }}>Pátio: {motoSelecionada?.patio?.nome || "Sem Pátio"}</Text>
                <Text style={{ color: tema.texto }}>Código: {motoSelecionada?.codigo}</Text>

                <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: tema.btnDanger }]} onPress={enviarParaMecanica}>
                  <Text style={styles.btnText}>{t.enviarMecanica}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: tema.btnPrimary }]} onPress={() => atualizarLocalizacao(motoSelecionada, Math.random(), Math.random())}>
                  <Text style={styles.btnText}>📌 Atualizar Localização</Text>
                </TouchableOpacity>

                {motoSelecionada?.localizacao && (
                  <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: tema.btnPrimary }]} onPress={() => setMostrarMapa(true)}>
                    <Text style={styles.btnText}>{t.localizar}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: tema.btnDanger }]} onPress={removerMoto}>
                  <Text style={styles.btnText}>{t.removerMoto}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btnSecondary, { marginTop: 10, backgroundColor: tema.btnPrimary }]} onPress={() => setModalMoto(false)}>
                  <Text style={styles.btnText}>{t.fechar}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <ScrollView contentContainerStyle={{ alignItems: "center" }}>
                <MapaPatio motos={[motoSelecionada]} />
                <TouchableOpacity style={[styles.btnSecondary, { marginTop: 20, backgroundColor: tema.btnPrimary }]} onPress={() => setMostrarMapa(false)}>
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
