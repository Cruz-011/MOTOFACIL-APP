import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import colors from '../src/theme/colors';

export default function CadastroMotoAvancado({ onRegistrarLocalizacao }) {
  const [placa, setPlaca] = useState('');
  const [chassi, setChassi] = useState('');
  const [cor, setCor] = useState('');
  const [categoria, setCategoria] = useState('');

  const validarCampos = () => {
    if (!placa || !chassi || !cor || !categoria) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos antes de continuar.');
      return false;
    }
    return true;
  };

  const registrarPosicao = () => {
    if (!validarCampos()) return;

    // Aqui entra o envio para o ESP32 central
    console.log('📡 Enviando dados ao ESP32:', { placa, chassi, cor, categoria });
    Alert.alert('Localização registrada', 'Moto posicionada com sucesso no pátio!');

    onRegistrarLocalizacao?.({ placa, chassi, cor, categoria });
    
    setPlaca('');
    setChassi('');
    setCor('');
    setCategoria('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro da Moto</Text>

      <TextInput
        style={styles.input}
        placeholder="Placa"
        placeholderTextColor={colors.secondary}
        value={placa}
        onChangeText={setPlaca}
      />
      <TextInput
        style={styles.input}
        placeholder="Chassi"
        placeholderTextColor={colors.secondary}
        value={chassi}
        onChangeText={setChassi}
      />
      <TextInput
        style={styles.input}
        placeholder="Cor (azul, verde, vermelha)"
        placeholderTextColor={colors.secondary}
        value={cor}
        onChangeText={setCor}
      />
      <TextInput
        style={styles.input}
        placeholder="Categoria (aluguel ou aquisição)"
        placeholderTextColor={colors.secondary}
        value={categoria}
        onChangeText={setCategoria}
      />

      <TouchableOpacity style={styles.btn} onPress={registrarPosicao}>
        <Text style={styles.btnText}>📍 Registrar Localização</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff1',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    color: colors.text,
  },
  btn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
