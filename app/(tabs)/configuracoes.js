import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal, TextInput, Alert
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
  const [modalNome, setModalNome] = useState(false);
  const [modalEmail, setModalEmail] = useState(false);
  const [modalSenha, setModalSenha] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

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

  // Função para gerar código (exemplo simples)
  const gerarCodigo = () => {
    const codigo = Math.random().toString(36).substr(2, 8).toUpperCase();
    Alert.alert(
      idioma === 'pt' ? 'Código Gerado' : idioma === 'es' ? 'Código Generado' : 'Generated Code',
      codigo
    );
  };

  // Funções para alterar dados
  const alterarNome = async () => {
    if (!novoNome.trim()) return;
    setNomeUsuario(novoNome);
    // Salva no AsyncStorage
    const dadosUsuario = await AsyncStorage.getItem('@usuario');
    if (dadosUsuario) {
      const usuario = JSON.parse(dadosUsuario);
      usuario.nome = novoNome;
      await AsyncStorage.setItem('@usuario', JSON.stringify(usuario));
    }
    setModalNome(false);
    setNovoNome('');
  };

  const alterarEmail = async () => {
    if (!novoEmail.trim()) return;
    setEmail(novoEmail);
    const dadosUsuario = await AsyncStorage.getItem('@usuario');
    if (dadosUsuario) {
      const usuario = JSON.parse(dadosUsuario);
      usuario.email = novoEmail;
      await AsyncStorage.setItem('@usuario', JSON.stringify(usuario));
    }
    setModalEmail(false);
    setNovoEmail('');
  };

  const alterarSenha = async () => {
    if (!novaSenha.trim()) return;
    setSenha(novaSenha);
    const dadosUsuario = await AsyncStorage.getItem('@usuario');
    if (dadosUsuario) {
      const usuario = JSON.parse(dadosUsuario);
      usuario.senha = novaSenha;
      await AsyncStorage.setItem('@usuario', JSON.stringify(usuario));
    }
    setModalSenha(false);
    setNovaSenha('');
  };

  const themeStyles = temaEscuro ? darkStyles : lightStyles;

  return (
    <ScrollView style={[styles.container, themeStyles.container]}>
      {/* Título */}
      <Text style={[styles.titulo, themeStyles.titulo]}>
        {idioma === 'pt' ? 'Perfil' : idioma === 'es' ? 'Perfil' : 'Profile'}
      </Text>

      {/* Card de Usuário */}
      <View style={[styles.cardUsuario, themeStyles.cardUsuario]}>
        <Text style={[styles.nomeUsuario, themeStyles.nomeUsuario]}>{nomeUsuario || 'Usuário'}</Text>
        <View style={styles.infoLinha}>
          <Text style={[styles.infoLabel, themeStyles.infoLabel]}>
            {idioma === 'pt' ? 'Email:' : idioma === 'es' ? 'Correo:' : 'Email:'}
          </Text>
          <Text style={[styles.infoValor, themeStyles.infoValor]}>{email || '-'}</Text>
          <TouchableOpacity onPress={() => setModalEmail(true)} style={styles.editIcon}>
            <Text style={themeStyles.editText}>✏️</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoLinha}>
          <Text style={[styles.infoLabel, themeStyles.infoLabel]}>
            {idioma === 'pt' ? 'Senha:' : idioma === 'es' ? 'Contraseña:' : 'Password:'}
          </Text>
          <Text style={[styles.infoValor, themeStyles.infoValor]}>
            {senha ? '••••••••' : '-'}
          </Text>
          <TouchableOpacity onPress={() => setModalSenha(true)} style={styles.editIcon}>
            <Text style={themeStyles.editText}>✏️</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.editNomeBtn} onPress={() => setModalNome(true)}>
          <Text style={themeStyles.editText}>
            {idioma === 'pt' ? 'Editar Nome' : idioma === 'es' ? 'Editar Nombre' : 'Edit Name'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Preferências */}
      <View style={[styles.card, themeStyles.card]}>
        <Text style={[styles.secaoTitulo, themeStyles.secaoTitulo]}>
          {idioma === 'pt' ? 'Preferências' : idioma === 'es' ? 'Preferencias' : 'Preferences'}
        </Text>
        <View style={styles.prefLinha}>
          <Text style={[styles.label, themeStyles.label]}>
            {idioma === 'pt' ? 'Modo Escuro' : idioma === 'es' ? 'Modo Oscuro' : 'Dark Mode'}
          </Text>
          <Switch value={temaEscuro} onValueChange={toggleTema} />
        </View>
        <View style={styles.prefLinha}>
          <Text style={[styles.label, themeStyles.label]}>
            {idioma === 'pt' ? 'Idioma' : idioma === 'es' ? 'Idioma' : 'Language'}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            {['pt','es','en'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.botaoPequeno,
                  idioma === lang ? themeStyles.botaoSelecionado : themeStyles.botao,
                  { marginHorizontal: 2 }
                ]}
                onPress={() => mudarIdioma(lang)}
              >
                <Text style={themeStyles.botaoTexto}>
                  {lang === 'pt' ? '🇧🇷' : lang === 'es' ? '🇪🇸' : '🇺🇸'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Funções de Administrador */}
      <View style={[styles.card, themeStyles.card]}>
        <Text style={[styles.secaoTitulo, themeStyles.secaoTitulo]}>
          {idioma === 'pt' ? 'Funções de Administrador' : idioma === 'es' ? 'Funciones de Administrador' : 'Admin Functions'}
        </Text>
        <TouchableOpacity style={[styles.botaoAdm, themeStyles.botaoAdm]} onPress={gerarCodigo}>
          <Text style={themeStyles.botaoTexto}>
            {idioma === 'pt' ? 'Gerar Código' : idioma === 'es' ? 'Generar Código' : 'Generate Code'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sair */}
      <TouchableOpacity style={[styles.botaoSair, { backgroundColor: 'red' }]} onPress={sairConta}>
        <Text style={[styles.botaoTexto, { color: '#fff' }]}>
          {idioma === 'pt' ? 'Sair da Conta' : idioma === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
        </Text>
      </TouchableOpacity>

      {/* Modais */}
      <Modal visible={modalNome} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, themeStyles.card]}>
            <Text style={themeStyles.secaoTitulo}>
              {idioma === 'pt' ? 'Alterar Nome' : idioma === 'es' ? 'Cambiar Nombre' : 'Change Name'}
            </Text>
            <TextInput
              style={styles.input}
              value={novoNome}
              onChangeText={setNovoNome}
              placeholder={idioma === 'pt' ? 'Digite o novo nome' : idioma === 'es' ? 'Ingrese el nuevo nombre' : 'Enter new name'}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.botaoPequeno, themeStyles.botao]} onPress={alterarNome}>
                <Text style={themeStyles.botaoTexto}>
                  {idioma === 'pt' ? 'Salvar' : idioma === 'es' ? 'Guardar' : 'Save'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botaoPequeno, { backgroundColor: 'gray' }]} onPress={() => setModalNome(false)}>
                <Text style={{ color: '#fff' }}>
                  {idioma === 'pt' ? 'Cancelar' : idioma === 'es' ? 'Cancelar' : 'Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={modalEmail} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, themeStyles.card]}>
            <Text style={themeStyles.secaoTitulo}>
              {idioma === 'pt' ? 'Alterar Email' : idioma === 'es' ? 'Cambiar Email' : 'Change Email'}
            </Text>
            <TextInput
              style={styles.input}
              value={novoEmail}
              onChangeText={setNovoEmail}
              placeholder={idioma === 'pt' ? 'Digite o novo email' : idioma === 'es' ? 'Ingrese el nuevo email' : 'Enter new email'}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.botaoPequeno, themeStyles.botao]} onPress={alterarEmail}>
                <Text style={themeStyles.botaoTexto}>
                  {idioma === 'pt' ? 'Salvar' : idioma === 'es' ? 'Guardar' : 'Save'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botaoPequeno, { backgroundColor: 'gray' }]} onPress={() => setModalEmail(false)}>
                <Text style={{ color: '#fff' }}>
                  {idioma === 'pt' ? 'Cancelar' : idioma === 'es' ? 'Cancelar' : 'Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={modalSenha} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, themeStyles.card]}>
            <Text style={themeStyles.secaoTitulo}>
              {idioma === 'pt' ? 'Alterar Senha' : idioma === 'es' ? 'Cambiar Contraseña' : 'Change Password'}
            </Text>
            <TextInput
              style={styles.input}
              value={novaSenha}
              onChangeText={setNovaSenha}
              placeholder={idioma === 'pt' ? 'Digite a nova senha' : idioma === 'es' ? 'Ingrese la nueva contraseña' : 'Enter new password'}
              secureTextEntry
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.botaoPequeno, themeStyles.botao]} onPress={alterarSenha}>
                <Text style={themeStyles.botaoTexto}>
                  {idioma === 'pt' ? 'Salvar' : idioma === 'es' ? 'Guardar' : 'Save'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botaoPequeno, { backgroundColor: 'gray' }]} onPress={() => setModalSenha(false)}>
                <Text style={{ color: '#fff' }}>
                  {idioma === 'pt' ? 'Cancelar' : idioma === 'es' ? 'Cancelar' : 'Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  titulo: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 18 },
  cardUsuario: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'column'
  },
  nomeUsuario: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  infoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
    justifyContent: 'center'
  },
  infoLabel: { fontSize: 16, fontWeight: '600', marginRight: 6 },
  infoValor: { fontSize: 16, marginRight: 6 },
  editIcon: { marginLeft: 6 },
  editNomeBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6'
  },
  card: { borderRadius: 12, padding: 16, marginBottom: 18, borderWidth: 1 },
  secaoTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  label: { fontSize: 15 },
  prefLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  botaoPequeno: { padding: 8, borderRadius: 8, minWidth: 40, alignItems: 'center' },
  botaoTexto: { fontSize: 16, fontWeight: 'bold' },
  botaoAdm: { padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  botaoSair: { padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '85%',
    borderRadius: 12,
    padding: 20,
    elevation: 5
  },
  input: {
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#fff'
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
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
  botaoAdm: { backgroundColor: '#2563eb' },
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
  botaoAdm: { backgroundColor: '#2563eb' },
  botaoTexto: { color: '#fff' },
  botaoSelecionado: { backgroundColor: '#2563eb' },
});
