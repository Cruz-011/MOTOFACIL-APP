import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { ThemeContext } from '../src/context/ThemeContext';

const modelosDisponiveis = [
  { nome: 'Mottu Sport' },
  { nome: 'Mottu E' },
  { nome: 'Mottu Pop' },
];

function gerarCodigoAleatorio() {
  return 'MOTO-' + Math.floor(Math.random() * 1000000);
}

export default function CadastroMotoAvancado({ onRegistrarLocalizacao, onFechar, mostrarCampoCodigo }) {
  const { temaEscuro } = useContext(ThemeContext);

  const tema = temaEscuro
    ? { fundo: '#1f2937', texto: '#fff', card: '#374151', primary: '#3b82f6', secundario: '#9ca3af' }
    : { fundo: '#f5f5f5', texto: '#000', card: '#fff', primary: '#3b82f6', secundario: '#6b7280' };

  const [placa, setPlaca] = useState('');
  const [chassi, setChassi] = useState('');
  const [modelo, setModelo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');

  const validar = () => {
    if (!modelo || !categoria) {
      Alert.alert('Campos obrigatórios', 'Modelo e Categoria são obrigatórios.');
      return false;
    }
    if (!placa && !chassi && !codigo) {
      Alert.alert(
        'Identificação necessária',
        'A moto não possui placa ou chassi. Será gerado um código único automaticamente.'
      );
    }
    return true;
  };

  const registrar = () => {
    if (!validar()) return;

    // Se não tiver placa nem chassi, gera código único
    const codigoFinal = placa || chassi ? codigo || '' : codigo || gerarCodigoAleatorio();

    onRegistrarLocalizacao?.({
      placa: placa || null,
      chassi: chassi || null,
      modelo,
      categoria,
      codigo: codigoFinal,
      descricao,
      x: 0.5,
      y: 0.6,
    });

    Alert.alert('Sucesso', 'Moto cadastrada com sucesso!');
    onFechar?.();
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: tema.fundo }]}>
      <Text style={[styles.titulo, { color: tema.primary }]}>📋 Cadastrar Nova Moto</Text>

      <TextInput
        style={[styles.input, { backgroundColor: tema.card, color: tema.texto, borderColor: tema.primary }]}
        placeholder="Placa"
        placeholderTextColor={tema.secundario}
        value={placa}
        onChangeText={setPlaca}
      />
      <TextInput
        style={[styles.input, { backgroundColor: tema.card, color: tema.texto, borderColor: tema.primary }]}
        placeholder="Chassi"
        placeholderTextColor={tema.secundario}
        value={chassi}
        onChangeText={setChassi}
      />
      {mostrarCampoCodigo && (
        <TextInput
          style={[styles.input, { backgroundColor: tema.card, color: tema.texto, borderColor: tema.primary }]}
          placeholder="Código (opcional, será gerado se vazio)"
          placeholderTextColor={tema.secundario}
          value={codigo}
          onChangeText={setCodigo}
        />
      )}

      <Text style={[styles.label, { color: tema.primary }]}>Modelo</Text>
      <View style={styles.opcoes}>
        {modelosDisponiveis.map((m) => (
          <TouchableOpacity
            key={m.nome}
            style={[
              styles.btnOpcao,
              { backgroundColor: tema.card, borderColor: tema.secundario },
              modelo === m.nome && { borderColor: tema.primary, backgroundColor: `${tema.primary}33` },
            ]}
            onPress={() => setModelo(m.nome)}
          >
            <Text style={[styles.opcaoTitulo, { color: tema.texto }]}>{m.nome}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: tema.primary }]}>Categoria</Text>
      <View style={styles.categorias}>
        {['aluguel', 'aquisição'].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[
              styles.categoriaBtn,
              { backgroundColor: tema.card, borderColor: tema.secundario },
              categoria === tipo && { borderColor: tema.primary, backgroundColor: `${tema.primary}33` },
            ]}
            onPress={() => setCategoria(tipo)}
          >
            <Text style={[styles.categoriaText, { color: tema.texto }]}>{tipo.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: tema.primary }]}>Descrição</Text>
      <TextInput
        style={[styles.input, { minHeight: 60, backgroundColor: tema.card, color: tema.texto, borderColor: tema.primary }]}
        placeholder="Digite uma descrição sobre a moto (opcional)"
        placeholderTextColor={tema.secundario}
        value={descricao}
        onChangeText={setDescricao}
        multiline
      />

      <TouchableOpacity style={[styles.btnSalvar, { backgroundColor: tema.primary }]} onPress={registrar}>
        <Text style={styles.btnText}>📍 Registrar Localização</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btnFechar, { backgroundColor: '#444' }]} onPress={onFechar}>
        <Text style={styles.btnText}>❌ Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderRadius: 10, padding: 14, marginBottom: 14, borderWidth: 1 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  opcoes: { marginBottom: 13 },
  btnOpcao: { maxHeight: 50, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 },
  opcaoTitulo: { fontSize: 15, textAlign: 'center', fontWeight: 'bold' },
  btnSalvar: { padding: 16, borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  btnFechar: { padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  categorias: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  categoriaBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  categoriaText: { fontWeight: 'bold' },
});
