// src/screens/Motos.js
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

function gerarCodigoAleatorio() {
  return "MOTO-" + Math.floor(Math.random() * 1000000);
}

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

  const carregarMotos = async () => {
    setRefreshing(true);
    try {
      // Faz as duas requisições simultâneas
      const [respMotos, respPatios] = await Promise.all([api.get("/motos"), api.get("/patios")]);

      // Log para conferir os dados retornados
      console.log("Resp Motos:", respMotos.data);
      console.log("Resp Patios:", respPatios.data);

      // Ajusta os patios
      const patiosData = Array.isArray(respPatios.data) ? respPatios.data : [];
      setPatios(patiosData);

      // Ajusta as motos, mapeando localização corretamente
      const motosData = Array.isArray(respMotos.data)
        ? respMotos.data.map((m) => ({
          ...m,
          // localizacao pega coordenadas do pátio, se existir
          localizacao: m.patio?.coordenadasExtremidade?.length > 0 ? m.patio.coordenadasExtremidade : null,
        }))
        : [];

      setMotos(motosData);

    } catch (err) {
      console.log("Erro na API:", err.response?.status, err.response?.data || err.message);
      Alert.alert("Erro", "Não foi possível carregar motos ou pátios.");
      // Não zere os dados, para não perder informações já carregadas
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
      Alert.alert("Pátio inválido", "O pátio selecionado precisa ter um esp32Central válido.");
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
        patio: { id: patioSelecionado.id }, // <<< assim funciona com o backend atual
        ativo: true,
      });


      setMotos((prev) => [...prev, { ...response.data, localizacao: null }]);
      Alert.alert("Sucesso", "Moto cadastrada com sucesso!");

      // Reset campos
      setPlaca("");
      setChassi("");
      setModelo("");
      setCategoria("");
      setCodigo("");
      setDescricao("");
      setPatioSelecionado(null);
      setMostrarCadastro(false);

    } catch (err) {
      console.log("Erro ao cadastrar moto:", err.response?.status, err.response?.data || err.message);
      if (err.response?.data?.message) {
        Alert.alert("Erro", err.response.data.message);
      } else {
        Alert.alert("Erro", "Não foi possível cadastrar a moto. Verifique o pátio e tente novamente.");
      }
    }
  };

  const atualizarLocalizacao = async (moto, x, y) => {
    try {
      const response = await api.put(`/motos/${moto.id}/location`, { x, y });
      carregarMotos();
      setMotoSelecionada(response.data);
    } catch (err) {
      console.log("Erro ao atualizar localização:", err.response?.status, err.response?.data || err.message);
      Alert.alert("Erro", "Não foi possível atualizar a localização.");
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

      {mostrarCadastro && (
        <ScrollView style={[styles.cardCadastro, { backgroundColor: tema.card }]}>
          <Text style={[styles.titulo, { color: tema.btnPrimary }]}>📋 Cadastrar Nova Moto</Text>

          <TextInput style={[styles.input, { borderColor: tema.btnPrimary, color: tema.texto }]} placeholder="Placa" placeholderTextColor={tema.secundario} value={placa} onChangeText={setPlaca} />
          <TextInput style={[styles.input, { borderColor: tema.btnPrimary, color: tema.texto }]} placeholder="Chassi" placeholderTextColor={tema.secundario} value={chassi} onChangeText={setChassi} />
          <TextInput style={[styles.input, { borderColor: tema.btnPrimary, color: tema.texto }]} placeholder="Código (opcional)" placeholderTextColor={tema.secundario} value={codigo} onChangeText={setCodigo} />

          <Text style={[styles.label, { color: tema.btnPrimary }]}>Modelo</Text>
          {modelosDisponiveis.map((m) => (
            <TouchableOpacity key={m.nome} style={[styles.btnOpcao, { borderColor: modelo === m.nome ? tema.btnPrimary : tema.secundario }]} onPress={() => setModelo(m.nome)}>
              <Text style={[styles.opcaoTitulo, { color: tema.texto }]}>{m.nome}</Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.label, { color: tema.btnPrimary }]}>Categoria</Text>
          <View style={styles.categorias}>
            {["aluguel", "aquisição"].map((tipo) => (
              <TouchableOpacity key={tipo} style={[styles.categoriaBtn, { borderColor: categoria === tipo ? tema.btnPrimary : tema.secundario }]} onPress={() => setCategoria(tipo)}>
                <Text style={[styles.categoriaText, { color: tema.texto }]}>{tipo.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: tema.btnPrimary }]}>Pátio</Text>
          <View style={styles.categorias}>
            {patios.map((p) => (
              <TouchableOpacity key={p.id} style={[styles.categoriaBtn, { borderColor: patioSelecionado?.id === p.id ? tema.btnPrimary : tema.secundario }]} onPress={() => setPatioSelecionado(p)}>
                <Text style={[styles.categoriaText, { color: tema.texto }]}>{p.nome}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: tema.btnPrimary }]}>Descrição</Text>
          <TextInput style={[styles.input, { minHeight: 60, borderColor: tema.btnPrimary, color: tema.texto }]} placeholder="Descrição (opcional)" placeholderTextColor={tema.secundario} value={descricao} onChangeText={setDescricao} multiline />

          <TouchableOpacity style={[styles.btnSalvar, { backgroundColor: tema.btnPrimary }]} onPress={registrar}>
            <Text style={styles.btnText}>📍 Registrar</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

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
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <Modal visible={modalMoto} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: tema.card }]}>
            {!mostrarMapa ? (
              <>
                <Text style={[styles.modalTitulo, { color: tema.texto }]}>{motoSelecionada?.placa || motoSelecionada?.codigo} - {motoSelecionada?.modelo}</Text>
                <Text style={{ color: tema.texto }}>Status: {motoSelecionada?.localizacao ? "🏍️ Pátio" : "📌 Pendente"}</Text>

                <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: tema.btnPrimary }]} onPress={() => atualizarLocalizacao(motoSelecionada, Math.random(), Math.random())}>
                  <Text style={styles.btnText}>📌 Atualizar Localização</Text>
                </TouchableOpacity>

                {motoSelecionada?.localizacao && (
                  <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: tema.btnPrimary }]} onPress={() => setMostrarMapa(true)}>
                    <Text style={styles.btnText}>{t.localizar}</Text>
                  </TouchableOpacity>
                )}

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
  categorias: { flexDirection: "row", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  categoriaBtn: { padding: 10, borderWidth: 1, borderRadius: 10 },
  categoriaText: { fontWeight: "bold" },
});
