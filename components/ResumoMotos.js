import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../src/theme/colors';

export default function ResumoMotos({ total, classificacao, categorias }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo do Pátio</Text>

      <View style={styles.linha}>
        <Text style={styles.label}>Total de Motos:</Text>
        <Text style={styles.valor}>{total}</Text>
      </View>

      <View style={styles.subsection}>
        <Text style={styles.subtitulo}>Classificação por Cor:</Text>
        <Text style={styles.detalhe}>🟩 Verde: {classificacao.verde}</Text>
        <Text style={styles.detalhe}>🟦 Azul: {classificacao.azul}</Text>
        <Text style={styles.detalhe}>🟥 Vermelha: {classificacao.vermelha}</Text>
      </View>

      <View style={styles.subsection}>
        <Text style={styles.subtitulo}>Categoria:</Text>
        <Text style={styles.detalhe}>🔄 Aluguel: {categorias.aluguel}</Text>
        <Text style={styles.detalhe}>🛒 Aquisição: {categorias.aquisicao}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    color: colors.text,
    fontSize: 16,
  },
  valor: {
    fontWeight: 'bold',
    color: colors.text,
    fontSize: 16,
  },
  subsection: {
    marginBottom: 10,
  },
  subtitulo: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  detalhe: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 10,
  },
});
