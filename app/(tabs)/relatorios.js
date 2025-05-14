import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import XLSX from 'xlsx';
import colors from '../../src/theme/colors';

const mockRelatorio = {
  data: new Date().toLocaleDateString(),
  motosEntraram: 20,
  motosSairam: 15,
  categoria: { azul: 5, verde: 8, vermelha: 7 },
  foraDoPatio: 3,
  emAtraso: 2,
  planoAquisicao: 6,
  planoAluguel: 14,
};

const mockMotosPatio = [
  { placa: 'ABC1234', cor: 'Azul', categoria: 'Aluguel' },
  { placa: 'XYZ5678', cor: 'Verde', categoria: 'Aquisição' },
  { placa: 'QWE9876', cor: 'Vermelha', categoria: 'Aluguel' },
  { placa: 'MNO4321', cor: 'Azul', categoria: 'Aluguel' },
  { placa: 'DEF5555', cor: 'Verde', categoria: 'Aquisição' },
];

export default function Relatorios() {
  const [periodo, setPeriodo] = useState('hoje');
  const [filtroPlaca, setFiltroPlaca] = useState('');

  const motosFiltradas = mockMotosPatio.filter(m =>
    m.placa.toLowerCase().includes(filtroPlaca.toLowerCase())
  );

  const gerarPDF = async () => {
    const html = `
      <html><body>
        <h1>Relatório de Motos - ${periodo}</h1>
        <p>Data: ${mockRelatorio.data}</p>
        <p>Entraram: ${mockRelatorio.motosEntraram}</p>
        <p>Saíram: ${mockRelatorio.motosSairam}</p>
        <p>Azul: ${mockRelatorio.categoria.azul}</p>
        <p>Verde: ${mockRelatorio.categoria.verde}</p>
        <p>Vermelha: ${mockRelatorio.categoria.vermelha}</p>
        <p>Fora do pátio: ${mockRelatorio.foraDoPatio}</p>
        <p>Em atraso: ${mockRelatorio.emAtraso}</p>
        <p>Plano aquisição: ${mockRelatorio.planoAquisicao}</p>
        <p>Plano aluguel: ${mockRelatorio.planoAluguel}</p>
      </body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  const gerarExcel = async () => {
    const dados = [{
      ...mockRelatorio,
      azul: mockRelatorio.categoria.azul,
      verde: mockRelatorio.categoria.verde,
      vermelha: mockRelatorio.categoria.vermelha,
    }];
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const uri = FileSystem.cacheDirectory + 'relatorio.xlsx';
    await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });
    await Sharing.shareAsync(uri);
  };

  const exportarMotosPDF = async () => {
    const html = `
      <html><body>
        <h1>Motos no Pátio</h1>
        ${motosFiltradas.map(m => `<p>Placa: ${m.placa} | Cor: ${m.cor} | Categoria: ${m.categoria}</p>`).join('')}
      </body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  const exportarMotosExcel = async () => {
    const ws = XLSX.utils.json_to_sheet(motosFiltradas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MotosPatio');
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const uri = FileSystem.cacheDirectory + 'motos_patio.xlsx';
    await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });
    await Sharing.shareAsync(uri);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.header}>Relatórios</Text>

        {/* Filtros de período */}
        <View style={styles.periodoContainer}>
          {['hoje', '15 dias', '30 dias'].map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.periodoBtn, periodo === p && styles.periodoBtnAtivo]}
              onPress={() => setPeriodo(p)}
            >
              <Text style={styles.periodoText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Relatório geral */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Geral</Text>
          <View style={styles.card}>
            <Text style={styles.text}>Entraram: {mockRelatorio.motosEntraram}</Text>
            <Text style={styles.text}>Saíram: {mockRelatorio.motosSairam}</Text>
            <Text style={styles.text}>Azul: {mockRelatorio.categoria.azul}</Text>
            <Text style={styles.text}>Verde: {mockRelatorio.categoria.verde}</Text>
            <Text style={styles.text}>Vermelha: {mockRelatorio.categoria.vermelha}</Text>
            <Text style={styles.text}>Fora do pátio: {mockRelatorio.foraDoPatio}</Text>
            <Text style={styles.text}>Em atraso: {mockRelatorio.emAtraso}</Text>
            <Text style={styles.text}>Plano aquisição: {mockRelatorio.planoAquisicao}</Text>
            <Text style={styles.text}>Plano aluguel: {mockRelatorio.planoAluguel}</Text>
          </View>
          <View style={styles.buttonRow}>
            <Button title="PDF" onPress={gerarPDF} color={colors.primary} />
            <Button title="Excel" onPress={gerarExcel} color={colors.secondary} />
          </View>
        </View>

        {/* Relatório de motos no pátio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motos no Pátio</Text>
          <TextInput
            style={styles.input}
            placeholder="Buscar por placa"
            placeholderTextColor="#aaa"
            value={filtroPlaca}
            onChangeText={setFiltroPlaca}
          />
          <View style={styles.card}>
            {motosFiltradas.length > 0 ? motosFiltradas.map((m, i) => (
              <Text key={i} style={styles.text}>
                Placa: {m.placa} | Cor: {m.cor} | Categoria: {m.categoria}
              </Text>
            )) : <Text style={styles.text}>Nenhuma moto encontrada</Text>}
          </View>
          <View style={styles.buttonRow}>
            <Button title="PDF" onPress={exportarMotosPDF} color={colors.primary} />
            <Button title="Excel" onPress={exportarMotosExcel} color={colors.secondary} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: 30,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 600,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  periodoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  periodoBtn: {
    backgroundColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  periodoBtnAtivo: {
    backgroundColor: colors.primary,
  },
  periodoText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff1',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    marginVertical: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    color: colors.text,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
});
