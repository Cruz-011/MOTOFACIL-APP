// app/(tabs)/configuracoes.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import colors from '../../src/theme/colors';

export default function Configuracoes() {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [patioSelecionado, setPatioSelecionado] = useState(null);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      const dadosUsuario = await AsyncStorage.getItem('@usuario');
      if (dadosUsuario) {
        const { nome, email, senha } = JSON.parse(dadosUsuario);
        setNomeUsuario(nome);
        setEmail(email);
        setSenha(senha);
      }

      const patioAtual = await AsyncStorage.getItem('@patio_selecionado');
      if (patioAtual) setPatioSelecionado(JSON.parse(patioAtual));
    })();
  }, []);

  const alterarDados = () => {
    router.push('/(tabs)/alterar-dados'); // aqui você pode criar essa tela depois
  };

  const alterarSenha = () => {
    router.push('/(tabs)/alterar-senha'); // mesma coisa, tela futura
  };

  const alterarPatio = () => {
    router.push('/(tabs)/selecao-patio');
  };

  const sairConta = async () => {
    await AsyncStorage.clear();
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Configurações</Text>

      {/* Área Dados da Conta */}
      <View style={styles.card}>
        <Text style={styles.secaoTitulo}>Conta</Text>

        <Text style={styles.label}>Nome:</Text>
        <Text style={styles.valor}>{nomeUsuario || 'Não informado'}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.valor}>{email || 'Não informado'}</Text>

        <Text style={styles.label}>Senha:</Text>
        <Text style={styles.valor}>{senha ? '******' : 'Não informado'}</Text>

        <TouchableOpacity style={styles.botao} onPress={alterarDados}>
          <Text style={styles.botaoTexto}>Alterar Dados</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botao} onPress={alterarSenha}>
          <Text style={styles.botaoTexto}>Alterar Senha</Text>
        </TouchableOpacity>
      </View>

      {/* Área Pátio Atual */}
      <View style={styles.card}>
        <Text style={styles.secaoTitulo}>Pátio Atual</Text>

        {patioSelecionado ? (
          <>
            <Text style={styles.label}>Nome:</Text>
            <Text style={styles.valor}>{patioSelecionado.nome}</Text>

            <Text style={styles.label}>Tamanho:</Text>
            <Text style={styles.valor}>
              {patioSelecionado.estrutura?.width} x {patioSelecionado.estrutura?.height}
            </Text>
          </>
        ) : (
          <Text style={styles.valor}>Nenhum pátio selecionado.</Text>
        )}

        <TouchableOpacity style={styles.botao} onPress={alterarPatio}>
          <Text style={styles.botaoTexto}>Alterar Pátio</Text>
        </TouchableOpacity>
      </View>

      {/* Botão Sair */}
      <TouchableOpacity style={[styles.botao, { backgroundColor: 'red', marginTop: 20 }]} onPress={sairConta}>
        <Text style={styles.botaoTexto}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 30 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secaoTitulo: { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 10 },
  label: { fontSize: 14, color: colors.secondary, marginTop: 10 },
  valor: { fontSize: 16, color: colors.text, fontWeight: 'bold' },
  botao: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  botaoTexto: { color: colors.text, fontWeight: 'bold', fontSize: 16 },
});
