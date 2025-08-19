import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ThemeContext } from '../../src/context/ThemeContext';

export default function Configuracoes() {
  const { temaEscuro, toggleTema, idioma, mudarIdioma } = useContext(ThemeContext);

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

  const sairConta = async () => {
    await AsyncStorage.clear();
    router.replace('/');
  };

  const themeStyles = temaEscuro ? darkStyles : lightStyles;

  return (
    <ScrollView style={[styles.container, themeStyles.container]}>
      <Text style={[styles.titulo, themeStyles.titulo]}>
        {idioma === 'pt' ? 'Configurações' : idioma === 'es' ? 'Configuración' : 'Settings'}
      </Text>

      {/* Tema */}
      <View style={[styles.card, themeStyles.card]}>
        <Text style={[styles.secaoTitulo, themeStyles.secaoTitulo]}>
          {idioma === 'pt' ? 'Tema' : idioma === 'es' ? 'Tema' : 'Theme'}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <Text style={[styles.label, themeStyles.label]}>
            {idioma === 'pt' ? 'Modo Escuro' : idioma === 'es' ? 'Modo Oscuro' : 'Dark Mode'}
          </Text>
          <Switch value={temaEscuro} onValueChange={toggleTema} />
        </View>
      </View>

      {/* Idioma */}
      <View style={[styles.card, themeStyles.card]}>
        <Text style={[styles.secaoTitulo, themeStyles.secaoTitulo]}>
          {idioma === 'pt' ? 'Idioma' : idioma === 'es' ? 'Idioma' : 'Language'}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
          {['pt','es','en'].map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[styles.botaoPequeno, idioma === lang ? themeStyles.botaoSelecionado : themeStyles.botao]}
              onPress={() => mudarIdioma(lang)}
            >
              <Text style={themeStyles.botaoTexto}>
                {lang === 'pt' ? '🇧🇷 PT' : lang === 'es' ? '🇪🇸 ES' : '🇺🇸 EN'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sair */}
      <TouchableOpacity style={[styles.botao, { backgroundColor: 'red', marginTop: 20 }]} onPress={sairConta}>
        <Text style={[styles.botaoTexto, { color: '#fff' }]}>
          {idioma === 'pt' ? 'Sair da Conta' : idioma === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  titulo: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  card: { borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1 },
  secaoTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  label: { fontSize: 14, marginTop: 10 },
  botao: { padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  botaoPequeno: { padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' },
  botaoTexto: { fontSize: 16, fontWeight: 'bold' },
});

const lightStyles = StyleSheet.create({
  container: { backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff', borderColor: '#3b82f6' },
  titulo: { color: '#3b82f6' },
  secaoTitulo: { color: '#3b82f6' },
  label: { color: '#6b7280' },
  botao: { backgroundColor: '#3b82f6' },
  botaoTexto: { color: '#fff' },
  botaoSelecionado: { backgroundColor: '#2563eb' },
});

const darkStyles = StyleSheet.create({
  container: { backgroundColor: '#1f2937' },
  card: { backgroundColor: '#374151', borderColor: '#2563eb' },
  titulo: { color: '#3b82f6' },
  secaoTitulo: { color: '#3b82f6' },
  label: { color: '#d1d5db' },
  botao: { backgroundColor: '#3b82f6' },
  botaoTexto: { color: '#fff' },
  botaoSelecionado: { backgroundColor: '#2563eb' },
});
