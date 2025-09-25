import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  FlatList,
  Modal,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  UIManager,
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

function gerarCodigoAleatorio() {
  return "MOTO-" + Math.floor(Math.random() * 1000000);
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

  // Campos do cadastro
  const [placa, setPlaca] = useState("");
  const [chassi, setChassi] = useState("");
  const [modelo, setModelo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");

  // Tema
  const tema = temaEscuro
    ? { fundo: "#1f2937", texto: "#fff", card: "#374151", border: "#2563eb", btnPrimary: "#3b82f6", btnDanger: "#ef4444", secundario: "#9ca3af" }
    : { fundo: "#f5f5f5", texto: "#000", card: "#fff", border: "#3b82f6", btnPrimary: "#3b82f6", btnDanger: "#ef4444", secundario: "#6b7280" };

  const t = {
    pesquisar: idioma === "pt" ? "🔍 Pesquisar moto" : idioma === "es" ? "🔍 Buscar moto" : "🔍 Search bike",
    cadastrar: idioma === "pt" ? "➕ Cadastrar Nova Moto" : idioma === "es" ? "➕ Registrar Nueva Moto" : "➕ Add New Bike",
    cancelar: idioma === "pt" ? "✖️ Cancelar Cadastro" : idioma === "es" ? "✖️ Cancelar Registro" : "✖️ Cancel",
    localizar: idioma === "pt" ? "🗺️ Localizar Moto" : idioma === "es" ? "🗺️ Localizar Moto" : "🗺️ Locate Bike",
    fechar: idioma === "pt" ? "✖️ Fechar" : idioma === "es" ? "✖️ Cerrar" : "✖️ Close",
  };

  // Carregar motos
  const carregarMotos = async () => {
    setRefreshing(true);
    try {
      const response = await api.get("/motos");
      const lista = response.data;

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

  // Criar moto
  const registrar = async () => {
    if (!modelo || !categoria) {
      Alert.alert("Campos obrigatórios", "Modelo e Categoria são obrigatórios.");
      return;
    }
    if (!placa && !chassi && !codigo) {
      Alert.alert(
        "Identificação necessária",
        "A moto não possui placa ou chassi. Será gerado um código único automaticamente."
      );
    }

    const codigoFinal = placa || chassi ? codigo || "" : codigo || gerarCodigoAleatorio();

    try {
      const response = await api.post("/motos", {
        placa: placa || null,
        chassi: chassi || null,
        modelo,
        categoria,
        codigo: codigoFinal,
        descricao,
        x: 0.5,
        y: 0.6,
      });
      setMotos((prev) => [...prev, response.data]);
      Alert.alert("Sucesso", "Moto cadastrada com sucesso!");
      setMostrarCadastro(false);
      setPlaca("");
      setChassi("");
      setModelo("");
      setCategoria("");
      setCodigo("");
      setDescricao("");
    } catch (err) {
      console.error("Erro ao cadastrar moto:", err);
    }
  };

  // Atualizar localização fake
  const pingarLocalizacao = async (moto) => {
    try {
      const dto = {
        x: -23.653 + Math.random() * 0.01,
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: tema.fundo }]}>
      {/* Botão abrir cadastro */}
      <TouchableOpacity
        style={[styles.btnCadastroTopo, { backgroundColor: tema.btnPrimary, borderColor: tema.border }]}
        onPress={() => setMostrarCadastro(!mostrarCadastro)}
      >
        <Text style={styles.btnText}>{mostrarCadastro ? t.cancelar : t.cadastrar}</Text>
      </TouchableOpacity>

      {/* Cadastro Moto */}
      {mostrarCadastro && (
        <ScrollView style={[styles.cardCadastro, { backgroundColor: tema.card }]}>
          <Text style={[styles.titulo, { color: tema.btnPrimary }]}>📋 Cadastrar Nova Moto</Text>

          <TextInput
            style={[styles.input, { backgroundColor: tema.card, color: tema.texto, borderColor: tema.btnPrimary }]}
            placeholder="Placa"
            placeholderTextColor={tema.secundario}
            value={placa}
            onChangeText={setPlaca}
          />
          <TextInput
            style={[styles.input, { backgroundColor: tema.card, color: tema.texto, borderColor: tema.btnPrimary }]}
            placeholder="Chassi"
            placeholderTextColor={tema.secundario}
            value={chassi}
            onChangeText={setChassi}
          />
          <TextInput
            style={[styles.input, { backgroundColor: tema.card, color: tema.texto, borderColor: tema.btnPrimary }]}
            placeholder="Código (opcional)"
            placeholderTextColor={tema.secundario}
            value={codigo}
            onChangeText={setCodigo}
          />

          <Text style={[styles.label, { color: tema.btnPrimary }]}>Modelo</Text>
          {modelosDisponiveis.map((m) => (
            <TouchableOpacity
              key={m.nome}
              style={[styles.btnOpcao, { borderColor: modelo === m.nome ? tema.btnPrimary : tema.secundario, backgroundColor: modelo === m.nome ? `${tema.btnPrimary}33` : tema.card }]}
              onPress={() => setModelo(m.nome)}
            >
              <Text style={[styles.opcaoTitulo, { color: tema.texto }]}>{m.nome}</Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.label, { color: tema.btnPrimary }]}>Categoria</Text>
          <View style={styles.categorias}>
            {["aluguel", "aquisição"].map((tipo) => (
              <TouchableOpacity
                key={tipo}
                style={[styles.categoriaBtn, { borderColor: categoria === tipo ? tema.btnPrimary : tema.secundario, backgroundColor: categoria === tipo ? `${tema.btnPrimary}33` : tema.card }]}
                onPress={() => setCategoria(tipo)}
              >
                <Text style={[styles.categoriaText, { color: tema.texto }]}>{tipo.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: tema.btnPrimary }]}>Descrição</Text>
          <TextInput
            style={[styles.input, { minHeight: 60, backgroundColor: tema.card, color: tema.texto, borderColor: tema.btnPrimary }]}
            placeholder="Descrição (opcional)"
            placeholderTextColor={tema.secundario}
            value={descricao}
            onChangeText={setDescricao}
            multiline
          />

          <TouchableOpacity style={[styles.btnSalvar, { backgroundColor: tema.btnPrimary }]} onPress={registrar}>
            <Text style={styles.btnText}>📍 Registrar Localização</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Barra de busca */}
      <TextInput
        style={[styles.searchInput, { backgroundColor: tema.card, color: tema.texto, borderColor: tema.border }]}
        placeholder={t.pesquisar}
        placeholderTextColor={temaEscuro ? "#9ca3af" : "#6b7280"}
        value={busca}
        onChangeText={setBusca}
      />

      {/* Lista de motos */}
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
                <Text style={{ color: tema.texto }}>Status: {motoSelecionada?.localizacao ? "🏍️ Pátio" : "📌 Pendente"}</Text>

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
  cardCadastro: { width: "100%", maxWidth: 600, marginBottom: 15, borderRadius: 12, padding: 16 },
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
  titulo: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  input: { borderRadius: 10, padding: 14, marginBottom: 14, borderWidth: 1 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  btnOpcao: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 },
  opcaoTitulo: { fontSize: 15, textAlign: "center", fontWeight: "bold" },
  btnSalvar: { padding: 16, borderRadius: 10, marginBottom: 10, alignItems: "center" },
  categorias: { flexDirection: "row", gap: 10, marginBottom: 16 },
  categoriaBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  categoriaText: { fontWeight: "bold" },
});
