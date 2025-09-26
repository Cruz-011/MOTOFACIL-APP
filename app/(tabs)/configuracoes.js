import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Switch, Modal, TextInput, Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ThemeContext } from '../../src/context/ThemeContext';
import api from '../../src/config/api'; 
export default function Configuracoes() {
  const { temaEscuro, toggleTema, idioma, mudarIdioma } = useContext(ThemeContext);

  const [usuario, setUsuario] = useState({});
  const [loading, setLoading] = useState(true);

  const [modalNome, setModalNome] = useState(false);
  const [modalEmail, setModalEmail] = useState(false);
  const [modalSenha, setModalSenha] = useState(false);

  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [senhaAntiga, setSenhaAntiga] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

  const router = useRouter();

  // --- Buscar usuário logado ---
  const buscarUsuarioLogado = async () => {
    setLoading(true);
    try {
      const dadosLogin = await AsyncStorage.getItem('@usuario_logado');
      if (!dadosLogin) return;

      const { usuario: email } = JSON.parse(dadosLogin);
      const res = await api.get(`/user/me/${email}`);
      setUsuario(res.data);
    } catch (e) {
      console.log('Erro ao buscar usuário logado:', e.response?.data || e.message);
      Alert.alert('Erro', 'Não foi possível carregar os dados do usuário.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarUsuarioLogado();
  }, []);

  // --- Logout ---
  const sairConta = async () => {
    await AsyncStorage.removeItem('@usuario_logado');
    router.replace('/');
  };

  // --- Alterar Nome ---
  const alterarNome = async () => {
    if (!novoNome.trim()) return;
    try {
      await api.put(`/user/update-nome`, { email: usuario.email, nome: novoNome });
      setNovoNome('');
      setModalNome(false);
      await buscarUsuarioLogado();
      Alert.alert('Sucesso', idioma === 'pt' ? 'Nome alterado' : idioma === 'es' ? 'Nombre cambiado' : 'Name changed');
    } catch (e) {
      console.log('Erro alterarNome:', e.response?.data || e.message);
      Alert.alert('Erro', e.response?.data || 'Erro ao alterar nome');
    }
  };

  // --- Alterar Email ---
  const alterarEmail = async () => {
    if (!novoEmail.trim()) return;
    try {
      await api.put(`/user/update-email`, { email: usuario.email, emailNovo: novoEmail });
      const dadosLogin = JSON.parse(await AsyncStorage.getItem('@usuario_logado'));
      await AsyncStorage.setItem('@usuario_logado', JSON.stringify({ token: dadosLogin.token, usuario: novoEmail }));
      setNovoEmail('');
      setModalEmail(false);
      await buscarUsuarioLogado();
      Alert.alert('Sucesso', idioma === 'pt' ? 'Email alterado' : idioma === 'es' ? 'Correo cambiado' : 'Email changed');
    } catch (e) {
      console.log('Erro alterarEmail:', e.response?.data || e.message);
      Alert.alert('Erro', e.response?.data || 'Erro ao alterar email');
    }
  };

  // --- Alterar Senha ---
  const alterarSenha = async () => {
    if (!senhaAntiga || !novaSenha) return;
    try {
      await api.put(`/user/update-senha`, { email: usuario.email, senhaAntiga, novaSenha });
      setSenhaAntiga('');
      setNovaSenha('');
      setModalSenha(false);
      Alert.alert('Sucesso', idioma === 'pt' ? 'Senha alterada' : idioma === 'es' ? 'Contraseña cambiada' : 'Password changed');
    } catch (e) {
      console.log('Erro alterarSenha:', e.response?.data || e.message);
      Alert.alert('Erro', e.response?.data || 'Erro ao alterar senha');
    }
  };

  const themeStyles = temaEscuro ? darkStyles : lightStyles;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, themeStyles.container]}>
        <ActivityIndicator size="large" color={temaEscuro ? '#fff' : '#3b82f6'} />
        <Text style={{ color: temaEscuro ? '#fff' : '#000', marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, themeStyles.container]}>
      <Text style={[styles.titulo, themeStyles.titulo]}>
        {idioma === 'pt' ? 'Perfil' : idioma === 'es' ? 'Perfil' : 'Profile'}
      </Text>

      {/* Card usuário */}
      <View style={[styles.cardUsuario, themeStyles.cardUsuario]}>
        <Text style={[styles.nomeUsuario, themeStyles.nomeUsuario]}>{usuario.nome || 'Usuário'}</Text>

        {/* Email */}
        <View style={styles.infoLinha}>
          <Text style={[styles.infoLabel, themeStyles.infoLabel]}>{idioma === 'pt' ? 'Email:' : 'Email:'}</Text>
          <Text style={[styles.infoValor, themeStyles.infoValor]}>{usuario.email || '-'}</Text>
          <TouchableOpacity onPress={() => setModalEmail(true)}>
            <Text style={themeStyles.editText}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Senha */}
        <View style={styles.infoLinha}>
          <Text style={[styles.infoLabel, themeStyles.infoLabel]}>{idioma === 'pt' ? 'Senha:' : 'Password:'}</Text>
          <Text style={[styles.infoValor, themeStyles.infoValor]}>{'••••••••'}</Text>
          <TouchableOpacity onPress={() => setModalSenha(true)}>
            <Text style={themeStyles.editText}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Código ADM */}
        {usuario.codigoAdm && (
          <View style={styles.infoLinha}>
            <Text style={[styles.infoLabel, themeStyles.infoLabel]}>{idioma === 'pt' ? 'Código ADM:' : 'Admin Code:'}</Text>
            <Text style={[styles.infoValor, themeStyles.infoValor]}>{usuario.codigoAdm}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.editNomeBtn} onPress={() => setModalNome(true)}>
          <Text style={themeStyles.editText}>{idioma === 'pt' ? 'Editar Nome' : 'Edit Name'}</Text>
        </TouchableOpacity>
      </View>

      {/* Preferências */}
      <View style={[styles.card, themeStyles.card]}>
        <Text style={[styles.secaoTitulo, themeStyles.secaoTitulo]}>
          {idioma === 'pt' ? 'Preferências' : 'Preferences'}
        </Text>

        <View style={styles.prefLinha}>
          <Text style={[styles.label, themeStyles.label]}>{idioma === 'pt' ? 'Modo Escuro' : 'Dark Mode'}</Text>
          <Switch
            value={temaEscuro}
            onValueChange={toggleTema}
            trackColor={{ false: '#ccc', true: '#3b82f6' }}
            thumbColor={temaEscuro ? '#2563eb' : '#fff'}
          />
        </View>

        <View style={styles.prefLinha}>
          <Text style={[styles.label, themeStyles.label]}>{idioma === 'pt' ? 'Idioma' : 'Language'}</Text>
          <View style={{ flexDirection: 'row' }}>
            {['pt', 'es', 'en'].map(lang => (
              <TouchableOpacity
                key={lang}
                style={[styles.botaoPequeno, idioma === lang ? themeStyles.botaoSelecionado : themeStyles.botao, { marginHorizontal: 2 }]}
                onPress={() => mudarIdioma(lang)}>
                <Text style={themeStyles.botaoTexto}>{lang === 'pt' ? '🇧🇷' : lang === 'es' ? '🇪🇸' : '🇺🇸'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity style={[styles.botaoSair, { backgroundColor: 'red' }]} onPress={sairConta}>
        <Text style={[styles.botaoTexto, { color: '#fff' }]}>{idioma === 'pt' ? 'Sair da Conta' : 'Sign Out'}</Text>
      </TouchableOpacity>

      {/* ---------------- Modais ---------------- */}

      {/* Modal Nome */}
      <Modal visible={modalNome} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, themeStyles.card]}>
            <Text style={themeStyles.secaoTitulo}>{idioma === 'pt' ? 'Alterar Nome' : 'Change Name'}</Text>
            <TextInput style={styles.input} value={novoNome} onChangeText={setNovoNome} placeholder="Digite o novo nome" />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.botaoPequeno, themeStyles.botao]} onPress={alterarNome}>
                <Text style={themeStyles.botaoTexto}>{idioma === 'pt' ? 'Salvar' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botaoPequeno, { backgroundColor: 'gray' }]} onPress={() => setModalNome(false)}>
                <Text style={{ color: '#fff' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Email */}
      <Modal visible={modalEmail} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, themeStyles.card]}>
            <Text style={themeStyles.secaoTitulo}>{idioma === 'pt' ? 'Alterar Email' : 'Change Email'}</Text>
            <TextInput style={styles.input} value={novoEmail} onChangeText={setNovoEmail} placeholder="Digite o novo email" keyboardType="email-address" autoCapitalize="none" />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.botaoPequeno, themeStyles.botao]} onPress={alterarEmail}>
                <Text style={themeStyles.botaoTexto}>{idioma === 'pt' ? 'Salvar' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botaoPequeno, { backgroundColor: 'gray' }]} onPress={() => setModalEmail(false)}>
                <Text style={{ color: '#fff' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Senha */}
      <Modal visible={modalSenha} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, themeStyles.card]}>
            <Text style={themeStyles.secaoTitulo}>{idioma === 'pt' ? 'Alterar Senha' : 'Change Password'}</Text>
            <TextInput style={styles.input} placeholder="Senha antiga" secureTextEntry value={senhaAntiga} onChangeText={setSenhaAntiga} />
            <TextInput style={styles.input} placeholder="Nova senha" secureTextEntry value={novaSenha} onChangeText={setNovaSenha} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.botaoPequeno, themeStyles.botao]} onPress={alterarSenha}>
                <Text style={themeStyles.botaoTexto}>{idioma === 'pt' ? 'Salvar' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botaoPequeno, { backgroundColor: 'gray' }]} onPress={() => setModalSenha(false)}>
                <Text style={{ color: '#fff' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

// ----------- Estilos (tema claro/escuro) ----------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  titulo: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 18 },
  cardUsuario: { borderRadius: 16, padding: 20, marginBottom: 24, alignItems: 'center', borderWidth: 1, flexDirection: 'column' },
  nomeUsuario: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  infoLinha: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%', justifyContent: 'center' },
  infoLabel: { fontSize: 16, fontWeight: '600', marginRight: 6 },
  infoValor: { fontSize: 16, marginRight: 6 },
  editNomeBtn: { marginTop: 10, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#3b82f6' },
  card: { borderRadius: 12, padding: 16, marginBottom: 18, borderWidth: 1 },
  secaoTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  label: { fontSize: 15 },
  prefLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  botaoPequeno: { padding: 8, borderRadius: 8, minWidth: 40, alignItems: 'center' },
  botaoTexto: { fontSize: 16, fontWeight: 'bold' },
  botaoSair: { padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', borderRadius: 12, padding: 20, elevation: 5 },
  input: { borderWidth: 1, borderColor: '#3b82f6', borderRadius: 8, padding: 10, marginBottom: 16, backgroundColor: '#fff' },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

const lightStyles = StyleSheet.create({
  container: { backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff', borderColor: '#3b82f6' },
  cardUsuario: { backgroundColor: '#fff', borderColor: '#3b82f6' },
  titulo: { color: '#3b82f6' },
  secaoTitulo: { color: '#3b82f6' },
  nomeUsuario: { color: '#2563eb' },
  infoLabel: { color: '#6b7280' },
  infoValor: { color: '#374151' },
  editText: { color: '#2563eb', fontWeight: 'bold' },
  label: { color: '#6b7280' },
  botao: { backgroundColor: '#3b82f6' },
  botaoTexto: { color: '#fff' },
  botaoSelecionado: { backgroundColor: '#2563eb' },
});

const darkStyles = StyleSheet.create({
  container: { backgroundColor: '#1f2937' },
  card: { backgroundColor: '#374151', borderColor: '#2563eb' },
  cardUsuario: { backgroundColor: '#374151', borderColor: '#2563eb' },
  titulo: { color: '#3b82f6' },
  secaoTitulo: { color: '#3b82f6' },
  nomeUsuario: { color: '#60a5fa' },
  infoLabel: { color: '#d1d5db' },
  infoValor: { color: '#fff' },
  editText: { color: '#60a5fa', fontWeight: 'bold' },
  label: { color: '#d1d5db' },
  botao: { backgroundColor: '#3b82f6' },
  botaoTexto: { color: '#fff' },
  botaoSelecionado: { backgroundColor: '#2563eb' },
});
