import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import colors from '../../src/theme/colors';

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
  const [periodo, setPeriodo] = useState('hoje');
  const relatorio = mockRelatorio[periodo];

  const gerarRelatorioCompletoPDF = async () => {
    const html = `
      <html><body style="font-family: sans-serif;">
        <h1 style="text-align:center;">Relatório Completo - ${periodo.toUpperCase()}</h1>
        <p><strong>Data de Geração:</strong> ${relatorio.data}</p>
        <h2>Resumo do Pátio</h2>
        <ul>
          <li>Entraram: ${relatorio.motosEntraram}</li>
          <li>Saíram: ${relatorio.motosSairam}</li>
          <li>Cor Azul: ${relatorio.categoria.azul}</li>
          <li>Cor Verde: ${relatorio.categoria.verde}</li>
          <li>Cor Vermelha: ${relatorio.categoria.vermelha}</li>
          <li>Fora do pátio: ${relatorio.foraDoPatio}</li>
          <li>Em atraso: ${relatorio.emAtraso}</li>
          <li>Plano aquisição: ${relatorio.planoAquisicao}</li>
          <li>Plano aluguel: ${relatorio.planoAluguel}</li>
        </ul>
        <h2>Motos no Pátio</h2>
        ${relatorio.motosPatio.map(m => `<p>Placa: ${m.placa} | Cor: ${m.cor} | Categoria: ${m.categoria}</p>`).join('')}
      </body></html>`;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.header}>Relatório do Pátio</Text>

      <View style={styles.filtrosContainer}>
        {['hoje', '15 dias', '30 dias'].map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.filtroBtn, periodo === p && styles.filtroBtnAtivo]}
            onPress={() => setPeriodo(p)}
          >
            <Text style={styles.filtroText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.subTitle}>Resumo</Text>
        <Text style={styles.text}>Entraram: {relatorio.motosEntraram}</Text>
        <Text style={styles.text}>Saíram: {relatorio.motosSairam}</Text>
        <Text style={styles.text}>Azul: {relatorio.categoria.azul}</Text>
        <Text style={styles.text}>Verde: {relatorio.categoria.verde}</Text>
        <Text style={styles.text}>Vermelha: {relatorio.categoria.vermelha}</Text>
        <Text style={styles.text}>Fora do pátio: {relatorio.foraDoPatio}</Text>
        <Text style={styles.text}>Em atraso: {relatorio.emAtraso}</Text>
        <Text style={styles.text}>Plano aquisição: {relatorio.planoAquisicao}</Text>
        <Text style={styles.text}>Plano aluguel: {relatorio.planoAluguel}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.subTitle}>Motos no Pátio</Text>
        {relatorio.motosPatio.length > 0 ? relatorio.motosPatio.map((m, i) => (
          <Text key={i} style={styles.text}>Placa: {m.placa} | Cor: {m.cor} | Categoria: {m.categoria}</Text>
        )) : <Text style={styles.text}>Nenhuma moto no pátio</Text>}
      </View>

      <TouchableOpacity style={styles.btn} onPress={gerarRelatorioCompletoPDF}>
        <Text style={styles.btnText}>📄 Exportar PDF Completo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    color: colors.primary,
    fontWeight: 'bold',
    paddingTop: 30,
    marginBottom: 20,
  },
  filtrosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  filtroBtn: {
    backgroundColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  filtroBtnAtivo: {
    backgroundColor: colors.primary,
  },
  filtroText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  text: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 4,
  },
  btn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
