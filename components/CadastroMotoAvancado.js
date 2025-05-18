import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import colors from '../src/theme/colors';

const modelosDisponiveis = [
  { nome: 'Mottu Sport' },
  { nome: 'Mottu E' },
  { nome: 'Mottu Pop'},
];

const cores = ['azul', 'verde', 'vermelha'];

export default function CadastroMotoAvancado({ onRegistrarLocalizacao, onFechar }) {
  const [placa, setPlaca] = useState('');
  const [chassi, setChassi] = useState('');
  const [modelo, setModelo] = useState('');
  const [cor, setCor] = useState('');
  const [categoria, setCategoria] = useState('');

  const validar = () => {
    if (!placa || !modelo || !categoria) {
      Alert.alert('Campos obrigatórios', 'Placa, Modelo e Categoria são obrigatórios.');
      return false;
    }
    return true;
  };

  const registrar = () => {
    if (!validar()) return;

    onRegistrarLocalizacao?.({
      placa,
      chassi,
      modelo,
      cor,
      categoria,
      x: 0.5,
      y: 0.6,
    });

    Alert.alert('Sucesso', 'Moto cadastrada com sucesso!');
    onFechar?.();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>📋 Cadastrar Nova Moto</Text>

      <TextInput
        style={styles.input}
        placeholder="Placa"
        placeholderTextColor={colors.secondary}
        value={placa}
        onChangeText={setPlaca}
      />
      <TextInput
        style={styles.input}
        placeholder="Chassi (opcional)"
        placeholderTextColor={colors.secondary}
        value={chassi}
        onChangeText={setChassi}
      />

      <Text style={styles.label}>Modelo</Text>
      <View style={styles.opcoes}>
        {modelosDisponiveis.map((m) => (
          <TouchableOpacity
            key={m.nome}
            style={[styles.btnOpcao, modelo === m.nome && styles.btnSelecionado]}
            onPress={() => setModelo(m.nome)}
          >
            <Text style={styles.opcaoTitulo}>{m.nome}</Text>
            <Text style={styles.opcaoDescricao}>{m.descricao}</Text>
          </TouchableOpacity>
        ))}
      </View>


<Text style={styles.label}>Categoria</Text>
<View style={styles.categorias}>
  {['aluguel', 'aquisição'].map((tipo) => (
    <TouchableOpacity
      key={tipo}
      style={[styles.categoriaBtn, categoria === tipo && styles.categoriaSelecionada]}
      onPress={() => setCategoria(tipo)}
    >
      <Text style={styles.categoriaText}>{tipo.toUpperCase()}</Text>
    </TouchableOpacity>
  ))}
</View>


      <TouchableOpacity style={styles.btnSalvar} onPress={registrar}>
        <Text style={styles.btnText}>📍 Registrar Localização</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnFechar} onPress={onFechar}>
        <Text style={styles.btnText}>❌ Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: colors.background,
    flexGrow: 1,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff1',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    color: colors.text,
  },
  label: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  opcoes: {
    marginBottom: 13,
  },
  btnOpcao: {
    backgroundColor: colors.card,
    maxHeight: 50,
    borderColor: colors.secondary,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  btnSelecionado: {
    borderColor: colors.primary,
    backgroundColor: '#00224433',
  },
  opcaoTitulo: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.text,
  },

  cores: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  corBtn: {
    flex: 1,
    padding: 10,
    maxHeight: 40,
    minWidth:60,
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.secondary,
    alignItems: 'center',
  },
  corSelecionada: {
    borderColor: colors.primary,
    backgroundColor: '#00224433',
  },
  corText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  btnSalvar: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  btnFechar: {
    backgroundColor: '#444',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  categorias: {
  flexDirection: 'row',
  gap: 10,
  marginBottom: 16,
},
categoriaBtn: {
  flex: 1,
  padding: 12,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: colors.secondary,
  alignItems: 'center',
},
categoriaSelecionada: {
  borderColor: colors.primary,
  backgroundColor: '#00224433',
},
categoriaText: {
  fontWeight: 'bold',
  color: colors.text,
},
});
