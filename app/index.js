import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import colors from '../src/theme/colors.js';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  const fazerLogin = async () => {
    // Aqui você pode integrar com backend Java futuramente
    if (usuario === '' && senha === '') {
      await AsyncStorage.setItem('@usuario_logado', JSON.stringify({ usuario }));
      router.replace('/selecao-patio');
    } else {
      Alert.alert('Erro', 'Usuário ou senha incorretos');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/motofacil.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <Text style={styles.title}>SEJA BEM-VINDO</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={usuario}
        onChangeText={setUsuario}
        placeholderTextColor={colors.secondary}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        placeholderTextColor={colors.secondary}
      />

      <TouchableOpacity style={styles.botao} onPress={fazerLogin}>
        <Text style={styles.botaoTexto}>Entrar</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 20, paddingHorizontal: 35  },
  logoContainer: { alignItems: 'center', marginBottom: 5 },
  logo: { width: 170, height: 170 },
  title: { fontSize: 27, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 5 },
  input: {
    backgroundColor: colors.card, color: colors.text, borderRadius: 10,
    paddingHorizontal:15, paddingVertical:20, marginBottom: 10,
    borderWidth: 1, borderColor: colors.primary,
  },
  botao: { backgroundColor: colors.primary, padding: 20, borderRadius: 10, alignItems: 'center' },
  botaoTexto: { fontSize: 20, color: colors.text, fontWeight: 'bold' },
});
