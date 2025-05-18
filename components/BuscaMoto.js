import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import colors from '../src/theme/colors';

export default function BuscaMoto({ motos = [], onSelecionarMoto }) {
  const [busca, setBusca] = useState('');

  const resultados = motos.filter((m) =>
    m.placa?.toLowerCase().includes(busca.toLowerCase()) ||
    m.chassi?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🔎 Buscar Moto</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite a placa ou chassi"
        placeholderTextColor={colors.secondary}
        value={busca}
        onChangeText={setBusca}
      />

      {resultados.map((item) => (
        <TouchableOpacity
          key={item.id?.toString() || item.placa}
          style={styles.item}
          onPress={() => onSelecionarMoto(item)}
        >
          <Text style={styles.itemText}>🛵 {item.placa} - {item.chassi}</Text>
        </TouchableOpacity>
      ))}

      {busca.length > 0 && resultados.length === 0 && (
        <Text style={styles.nada}>Nenhuma moto encontrada</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  titulo: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff1',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    marginBottom: 10,
  },
  item: {
    backgroundColor: colors.card,
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  itemText: {
    color: colors.text,
    fontSize: 16,
  },
  nada: {
    color: colors.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
});
