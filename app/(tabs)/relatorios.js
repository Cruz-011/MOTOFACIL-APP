import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import colors from '../../src/theme/colors';
import { ThemeContext } from '../../src/context/ThemeContext';

const mockRelatorio = {
  hoje: {
    data: new Date().toLocaleDateString(),
    motosEntraram: 5,
    motosSairam: 3,
    categoria: { azul: 2, verde: 1, vermelha: 2 },
    foraDoPatio: 1,
    emAtraso: 0,
    planoAquisicao: 2,
    planoAluguel: 3,
    motosPatio: [
      { placa: 'ABC1234', cor: 'Azul', categoria: 'Aluguel' },
      { placa: 'XYZ5678', cor: 'Verde', categoria: 'Aquisição' }
    ]
  },
  '15 dias': {
    data: new Date().toLocaleDateString(),
    motosEntraram: 25,
    motosSairam: 20,
    categoria: { azul: 8, verde: 9, vermelha: 8 },
    foraDoPatio: 3,
    emAtraso: 2,
    planoAquisicao: 10,
    planoAluguel: 15,
    motosPatio: [
      { placa: 'QWE9876', cor: 'Vermelha', categoria: 'Aluguel' },
      { placa: 'MNO4321', cor: 'Azul', categoria: 'Aluguel' }
    ]
  },
  '30 dias': {
    data: new Date().toLocaleDateString(),
    motosEntraram: 45,
    motosSairam: 38,
    categoria: { azul: 15, verde: 14, vermelha: 16 },
    foraDoPatio: 5,
    emAtraso: 3,
    planoAquisicao: 18,
    planoAluguel: 27,
    motosPatio: [
      { placa: 'DEF5555', cor: 'Verde', categoria: 'Aquisição' },
      { placa: 'GHI7890', cor: 'Azul', categoria: 'Aluguel' }
    ]
  },
};

export default function Relatorios() {
  const { temaEscuro, idioma } = useContext(ThemeContext);
  const tema = temaEscuro
    ? { fundo: '#1f2937', texto: '#fff', card: '#374151', primary: '#3b82f6' }
    : { fundo: '#f5f5f5', texto: '#000', card: '#fff', primary: '#3b82f6' };

  const [periodo, setPeriodo] = useState('hoje');
  const relatorio = mockRelatorio[periodo];

  const t = {
    relatorio: idioma === 'pt' ? 'Relatório do Pátio' : idioma === 'es' ? 'Informe del Patio' : 'Yard Report',
    hoje: idioma === 'pt' ? 'hoje' : idioma === 'es' ? 'hoy' : 'today',
    dias15: idioma === 'pt' ? '15 dias' : idioma === 'es' ? '15 días' : '15 days',
    dias30: idioma === 'pt' ? '30 dias' : idioma === 'es' ? '30 días' : '30 days',
    resumo: idioma === 'pt' ? 'Resumo' : idioma === 'es' ? 'Resumen' : 'Summary',
    motosPatio: idioma === 'pt' ? 'Motos no Pátio' : idioma === 'es' ? 'Motos en el Patio' : 'Bikes in Yard',
    nenhum: idioma === 'pt' ? 'Nenhuma moto no pátio' : idioma === 'es' ? 'Ninguna moto en el patio' : 'No bikes in yard',
    exportarPDF: idioma === 'pt' ? '📄 Exportar PDF Completo' : idioma === 'es' ? '📄 Exportar PDF Completo' : '📄 Export Full PDF'
  };

  const gerarRelatorioCompletoPDF = async () => {
    const html = `
      <html><body style="font-family: sans-serif;">
        <h1 style="text-align:center;">${t.relatorio} - ${periodo.toUpperCase()}</h1>
        <p><strong>Data de Geração:</strong> ${relatorio.data}</p>
        <h2>${t.resumo}</h2>
        <ul>
          <li>Entraram: ${relatorio.motosEntraram}</li>
          <li>Saíram: ${relatorio.motosSairam}</li>
          <li>Azul: ${relatorio.categoria.azul}</li>
          <li>Verde: ${relatorio.categoria.verde}</li>
          <li>Vermelha: ${relatorio.categoria.vermelha}</li>
          <li>Fora do pátio: ${relatorio.foraDoPatio}</li>
          <li>Em atraso: ${relatorio.emAtraso}</li>
          <li>Plano aquisição: ${relatorio.planoAquisicao}</li>
          <li>Plano aluguel: ${relatorio.planoAluguel}</li>
        </ul>
        <h2>${t.motosPatio}</h2>
        ${relatorio.motosPatio.map(m => `<p>Placa: ${m.placa} | Cor: ${m.cor} | Categoria: ${m.categoria}</p>`).join('')}
      </body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <ScrollView style={{ backgroundColor: tema.fundo }} contentContainerStyle={styles.container}>
      <Text style={[styles.header, { color: tema.primary }]}>{t.relatorio}</Text>

      <View style={styles.filtrosContainer}>
        {['hoje', '15 dias', '30 dias'].map(p => (
          <TouchableOpacity
            key={p}
            style={[
              styles.filtroBtn,
              { backgroundColor: periodo === p ? tema.primary : '#ccc' }
            ]}
            onPress={() => setPeriodo(p)}
          >
            <Text style={styles.filtroText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: tema.card }]}>
        <Text style={[styles.subTitle, { color: tema.texto }]}>{t.resumo}</Text>
        <Text style={[styles.text, { color: tema.texto }]}>Entraram: {relatorio.motosEntraram}</Text>
        <Text style={[styles.text, { color: tema.texto }]}>Saíram: {relatorio.motosSairam}</Text>
        <Text style={[styles.text, { color: tema.texto }]}>Azul: {relatorio.categoria.azul}</Text>
        <Text style={[styles.text, { color: tema.texto }]}>Verde: {relatorio.categoria.verde}</Text>
        <Text style={[styles.text, { color: tema.texto }]}>Vermelha: {relatorio.categoria.vermelha}</Text>
        <Text style={[styles.text, { color: tema.texto }]}>Fora do pátio: {relatorio.foraDoPatio}</Text>
        <Text style={[styles.text, { color: tema.texto }]}>Em atraso: {relatorio.emAtraso}</Text>
        <Text style={[styles.text, { color: tema.texto }]}>Plano aquisição: {relatorio.planoAquisicao}</Text>
        <Text style={[styles.text, { color: tema.texto }]}>Plano aluguel: {relatorio.planoAluguel}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: tema.card }]}>
        <Text style={[styles.subTitle, { color: tema.texto }]}>{t.motosPatio}</Text>
        {relatorio.motosPatio.length > 0 ? relatorio.motosPatio.map((m, i) => (
          <Text key={i} style={[styles.text, { color: tema.texto }]}>Placa: {m.placa} | Cor: {m.cor} | Categoria: {m.categoria}</Text>
        )) : <Text style={[styles.text, { color: tema.texto }]}>{t.nenhum}</Text>}
      </View>

      <TouchableOpacity style={[styles.btn, { backgroundColor: tema.primary }]} onPress={gerarRelatorioCompletoPDF}>
        <Text style={styles.btnText}>{t.exportarPDF}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  header: { fontSize: 26, fontWeight: 'bold', paddingTop: 30, marginBottom: 20 },
  filtrosContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  filtroBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 10 },
  filtroText: { color: '#fff', fontWeight: 'bold', textTransform: 'capitalize' },
  subTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  card: { borderRadius: 12, padding: 16, marginBottom: 20, width: '100%' },
  text: { fontSize: 16, marginBottom: 4 },
  btn: { padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10, width: '100%' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
