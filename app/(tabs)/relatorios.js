import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import axios from "axios";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { ThemeContext } from "../../src/context/ThemeContext";
import { API_URL } from "../../src/config/api"; // URL do backend

export default function RelatoriosUnificado() {
  const { temaEscuro, idioma } = useContext(ThemeContext);
  const tema = temaEscuro
    ? { fundo: "#1f2937", texto: "#fff", card: "#374151", primary: "#3b82f6" }
    : { fundo: "#f5f5f5", texto: "#000", card: "#fff", primary: "#3b82f6" };

  const [periodo, setPeriodo] = useState("hoje");
  const [refreshing, setRefreshing] = useState(false);
  const [relatorio, setRelatorio] = useState(null);

  // Função para carregar dados do backend
  const carregarRelatorio = useCallback(async () => {
    try {
      // Buscar todas as motos
      const motosRes = await axios.get(`${API_URL}/motos`);
      const motos = motosRes.data;

      // Filtrar por período
      const hoje = new Date();
      let motosEntraram = 0;
      let motosSairam = 0; // você pode criar campo no backend para histórico de saída
      let foraDoPatio = 0;
      let emAtraso = 0; // calculado conforme regra de atraso
      let planoAquisicao = 0;
      let planoAluguel = 0;

      // Agrupar motos no pátio e por categoria
      const motosPatio = motos.map(m => ({
        placa: m.placa,
        categoria: m.categoria.toLowerCase(),
      }));

      motos.forEach(m => {
        // Contagem de categorias
        if (m.categoria.toLowerCase() === "aluguel") planoAluguel++;
        else if (m.categoria.toLowerCase() === "aquisição") planoAquisicao++;

        // Contagem de motos dentro ou fora do pátio
        if (m.status === "patio") motosEntraram++;
        else foraDoPatio++;
      });

      setRelatorio({
        data: hoje.toLocaleDateString(),
        motosEntraram,
        motosSairam,
        foraDoPatio,
        emAtraso,
        planoAquisicao,
        planoAluguel,
        motosPatio,
      });
    } catch (err) {
      console.log("Erro ao carregar relatório:", err);
      setRelatorio({
        data: new Date().toLocaleDateString(),
        motosEntraram: 0,
        motosSairam: 0,
        foraDoPatio: 0,
        emAtraso: 0,
        planoAquisicao: 0,
        planoAluguel: 0,
        motosPatio: [],
      });
    }
  }, []);

  useEffect(() => {
    carregarRelatorio();
  }, [carregarRelatorio]);

  const t = {
    relatorio: idioma === "pt" ? "Relatório do Pátio" : idioma === "es" ? "Informe del Patio" : "Yard Report",
    hoje: idioma === "pt" ? "hoje" : idioma === "es" ? "hoy" : "today",
    dias15: idioma === "pt" ? "15 dias" : idioma === "es" ? "15 días" : "15 days",
    dias30: idioma === "pt" ? "30 dias" : idioma === "es" ? "30 días" : "30 days",
    resumo: idioma === "pt" ? "Resumo" : idioma === "es" ? "Resumen" : "Summary",
    motosPatio: idioma === "pt" ? "Motos no Pátio" : idioma === "es" ? "Motos en el Patio" : "Bikes in Yard",
    nenhum: idioma === "pt" ? "Nenhuma moto no pátio" : idioma === "es" ? "Ninguna moto en el patio" : "No bikes in yard",
    exportarPDF: idioma === "pt" ? "📄 Exportar PDF Completo" : idioma === "es" ? "📄 Exportar PDF Completo" : "📄 Export Full PDF",
  };

  const gerarRelatorioCompletoPDF = async () => {
    if (!relatorio) return;
    const html = `
      <html><body style="font-family: sans-serif;">
        <h1 style="text-align:center;">${t.relatorio}</h1>
        <p><strong>Data de Geração:</strong> ${relatorio.data}</p>
        <h2>${t.resumo}</h2>
        <ul>
          <li>Entraram: ${relatorio.motosEntraram}</li>
          <li>Saíram: ${relatorio.motosSairam}</li>
          <li>Fora do pátio: ${relatorio.foraDoPatio}</li>
          <li>Em atraso: ${relatorio.emAtraso}</li>
          <li>Plano aquisição: ${relatorio.planoAquisicao}</li>
          <li>Plano aluguel: ${relatorio.planoAluguel}</li>
        </ul>
        <h2>${t.motosPatio}</h2>
        ${relatorio.motosPatio.map(m => `<p>Placa: ${m.placa} | Categoria: ${m.categoria}</p>`).join("")}
      </body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarRelatorio().then(() => setRefreshing(false));
  }, [carregarRelatorio]);

  const ResumoMotos = ({ total, categorias }) => (
    <View style={[styles.card, { backgroundColor: tema.card }]}>
      <Text style={[styles.title, { color: tema.primary }]}>{t.resumo}</Text>
      <View style={styles.linha}>
        <Text style={[styles.label, { color: tema.texto }]}>Total de Motos:</Text>
        <Text style={[styles.valor, { color: tema.texto }]}>{total}</Text>
      </View>
      <View style={styles.subsection}>
        <Text style={[styles.subtitulo, { color: tema.texto }]}>Categoria:</Text>
        <Text style={[styles.detalhe, { color: tema.texto }]}>🔄 Aluguel: {categorias.aluguel}</Text>
        <Text style={[styles.detalhe, { color: tema.texto }]}>🛒 Aquisição: {categorias.aquisicao}</Text>
      </View>
    </View>
  );

  if (!relatorio) {
    return (
      <View style={[styles.container, { backgroundColor: tema.fundo }]}>
        <Text style={{ color: tema.texto }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: tema.fundo }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.header, { color: tema.primary }]}>{t.relatorio}</Text>

      <View style={styles.filtrosContainer}>
        {["hoje", "15 dias", "30 dias"].map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.filtroBtn,
              { backgroundColor: periodo === p ? tema.primary : "#ccc" },
            ]}
            onPress={() => setPeriodo(p)}
          >
            <Text style={styles.filtroText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ResumoMotos
        total={relatorio.motosEntraram - relatorio.motosSairam + relatorio.foraDoPatio}
        categorias={{
          aluguel: relatorio.planoAluguel,
          aquisicao: relatorio.planoAquisicao,
        }}
      />

      <View style={[styles.card, { backgroundColor: tema.card }]}>
        <Text style={[styles.subTitle, { color: tema.texto }]}>{t.motosPatio}</Text>
        {relatorio.motosPatio.length > 0 ? (
          relatorio.motosPatio.map((m, i) => (
            <Text key={i} style={[styles.text, { color: tema.texto }]}>
              Placa: {m.placa} | Categoria: {m.categoria}
            </Text>
          ))
        ) : (
          <Text style={[styles.text, { color: tema.texto }]}>{t.nenhum}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: tema.primary }]}
        onPress={gerarRelatorioCompletoPDF}
      >
        <Text style={styles.btnText}>{t.exportarPDF}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  header: { fontSize: 26, fontWeight: "bold", paddingTop: 30, marginBottom: 20 },
  filtrosContainer: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 20 },
  filtroBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 10 },
  filtroText: { color: "#fff", fontWeight: "bold", textTransform: "capitalize" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  card: { borderRadius: 12, padding: 16, marginBottom: 20, width: "100%", elevation: 3 },
  linha: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  label: { fontSize: 16 },
  valor: { fontWeight: "bold", fontSize: 16 },
  subsection: { marginBottom: 10 },
  subtitulo: { fontWeight: "600", marginBottom: 4 },
  detalhe: { fontSize: 15, marginLeft: 10 },
  text: { fontSize: 16, marginBottom: 4 },
  btn: { padding: 16, borderRadius: 10, alignItems: "center", marginTop: 10, width: "100%" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
