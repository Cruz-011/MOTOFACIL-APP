import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Switch,
  Modal,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ThemeContext } from '../src/context/ThemeContext.js';
import colors from '../src/theme/colors.js';
import api from '../src/config/api.js'; // <-- agora usa a instância centralizada

const LANGUAGES = [
  { code: 'pt', label: 'Português', emoji: '🇧🇷' },
  { code: 'en', label: 'English', emoji: '🇺🇸' },
  { code: 'es', label: 'Español', emoji: '🇪🇸' },
];

const TEXTS = {
  pt: { welcome: 'SEJA BEM-VINDO', user: 'E-mail', pass: 'Senha', enter: 'Entrar', error: 'Usuário ou senha incorretos' },
  en: { welcome: 'WELCOME', user: 'E-mail', pass: 'Password', enter: 'Login', error: 'Incorrect username or password' },
  es: { welcome: 'BIENVENIDO', user: 'E-mail', pass: 'Contraseña', enter: 'Entrar', error: 'Usuario o contraseña incorrectos' },
};

function gerarCodigoAdm() {
  return 'ADM-' + Math.floor(Math.random() * 1000000);
}

// Validações
const validarEmail = (email) => /\S+@\S+\.\S+/.test(email);
const validarSenha = (senha) => senha.length >= 6;
const validarCNPJ = (cnpj) => /^\d{14}$/.test(cnpj);

export default function Login() {
  const { temaEscuro, toggleTema, idioma, mudarIdioma } = useContext(ThemeContext);
  const router = useRouter();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showCadastro, setShowCadastro] = useState(false);
  const [tipoCadastro, setTipoCadastro] = useState('admin');
  const [cadastro, setCadastro] = useState({
    nome: '',
    email: '',
    senha: '',
    cnpj: '',
    codigoAdm: gerarCodigoAdm(),
    codigoFuncionario: ''
  });
  const [erroCadastro, setErroCadastro] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingCadastro, setLoadingCadastro] = useState(false);

  const currentTexts = TEXTS[idioma] || TEXTS['pt'];

  const theme = temaEscuro
    ? { background: '#000', card: '#222', text: '#fff', buttonText: '#fff', placeholderText: '#ccc', logoBg: 'transparent' }
    : { background: '#fff', card: '#f2f2f2', text: '#222', buttonText: '#fff', placeholderText: '#888', logoBg: '#222' };

  // --- LOGIN ---
  const fazerLogin = async () => {
    if (!usuario || !senha) {
      Alert.alert('Erro', 'Preencha usuário e senha');
      return;
    }

    setLoadingLogin(true);
    try {
      const response = await api.post('/auth/login', { email: usuario, senha });

      if (response.status === 200) {
        const token = response.data; // backend retorna token como string
        await AsyncStorage.setItem('@usuario_logado', JSON.stringify({ token, usuario }));
        router.replace('/selecao-patio');
      } else {
        Alert.alert('Erro', currentTexts.error);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor');
    } finally {
      setLoadingLogin(false);
    }
  };

  // --- CADASTRO ---
  const cadastrarUsuario = async () => {
    setErroCadastro('');

    if (!cadastro.nome || !cadastro.email || !cadastro.senha || (tipoCadastro === 'admin' && !cadastro.cnpj) || (tipoCadastro === 'func' && !cadastro.codigoFuncionario)) {
      setErroCadastro('Preencha todos os campos!');
      return;
    }

    if (!validarEmail(cadastro.email)) {
      setErroCadastro('Email inválido!');
      return;
    }

    if (!validarSenha(cadastro.senha)) {
      setErroCadastro('Senha deve ter no mínimo 6 caracteres!');
      return;
    }

    if (tipoCadastro === 'admin' && !validarCNPJ(cadastro.cnpj)) {
      setErroCadastro('CNPJ inválido! Deve ter 14 dígitos.');
      return;
    }

    setLoadingCadastro(true);
    try {
      const body = tipoCadastro === 'admin'
        ? { nome: cadastro.nome, email: cadastro.email, senha: cadastro.senha, cnpj: cadastro.cnpj, codigoAdm: cadastro.codigoAdm }
        : { nome: cadastro.nome, email: cadastro.email, senha: cadastro.senha, codigoFuncionario: cadastro.codigoFuncionario };

      const response = await api.post(`/auth/register/${tipoCadastro}`, body);

      if (response.status === 200) {
        Alert.alert('Sucesso', response.data || 'Cadastro realizado!');
        setShowCadastro(false);
        setCadastro({ nome: '', email: '', senha: '', cnpj: '', codigoAdm: gerarCodigoAdm(), codigoFuncionario: '' });
      } else {
        setErroCadastro(response.data || 'Erro no cadastro');
      }
    } catch (error) {
      console.log(error);
      setErroCadastro('Erro ao conectar com o servidor');
    } finally {
      setLoadingCadastro(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={{ fontSize: 22, marginRight: 8 }}>{temaEscuro ? '🌙' : '☀️'}</Text>
        <Switch
          value={temaEscuro}
          onValueChange={toggleTema}
          thumbColor={temaEscuro ? colors.primary : '#ccc'}
          trackColor={{ false: '#ccc', true: colors.primary }}
        />
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={[styles.logoBg, { backgroundColor: theme.logoBg }]}>
          <Image source={require('../assets/images/motofacil.png')} style={styles.logo} resizeMode="contain" />
        </View>
      </View>

      <Text style={[styles.title, { color: theme.text }]}>{currentTexts.welcome}</Text>

      {/* Inputs Login */}
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: !usuario && loadingLogin ? 'red' : colors.primary }]}
        placeholder={currentTexts.user}
        placeholderTextColor={theme.placeholderText}
        value={usuario}
        onChangeText={setUsuario}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: !senha && loadingLogin ? 'red' : colors.primary }]}
        placeholder={currentTexts.pass}
        placeholderTextColor={theme.placeholderText}
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: colors.primary, opacity: loadingLogin ? 0.7 : 1 }]}
        onPress={fazerLogin}
        disabled={loadingLogin}
      >
        {loadingLogin ? <ActivityIndicator color="#fff" /> : <Text style={[styles.botaoTexto, { color: theme.buttonText }]}>{currentTexts.enter}</Text>}
      </TouchableOpacity>

      {/* Idiomas */}
      <View style={styles.langContainer}>
        {LANGUAGES.map(lang => (
          <TouchableOpacity key={lang.code} style={styles.langItem} onPress={() => mudarIdioma(lang.code)}>
            <Text style={[styles.langEmoji, { opacity: idioma === lang.code ? 1 : 0.5 }]}>{lang.emoji}</Text>
            <Text style={[styles.langLabel, { color: theme.text }]}>{lang.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botão Cadastro */}
      <TouchableOpacity style={{ marginTop: 18 }} onPress={() => setShowCadastro(true)}>
        <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
          {idioma === 'pt' ? 'Cadastrar' : idioma === 'en' ? 'Register' : 'Registrar'}
        </Text>
      </TouchableOpacity>

      {/* Modal Cadastro */}
      <Modal visible={showCadastro} transparent animationType="fade" onRequestClose={() => setShowCadastro(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={[styles.modal, { backgroundColor: theme.card, minWidth: 320 }]}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 10 }}>
              {idioma === 'pt' ? 'Cadastro de Usuário' : idioma === 'en' ? 'User Registration' : 'Registro de Usuario'}
            </Text>

            {/* Tipo de Cadastro */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
              <TouchableOpacity onPress={() => setTipoCadastro('admin')} style={{ marginRight: 20 }}>
                <Text style={{ color: tipoCadastro === 'admin' ? colors.primary : theme.text, fontWeight: 'bold' }}>
                  {idioma === 'pt' ? 'Administrador' : idioma === 'en' ? 'Administrator' : 'Administrador'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTipoCadastro('func')}>
                <Text style={{ color: tipoCadastro === 'func' ? colors.primary : theme.text, fontWeight: 'bold' }}>
                  {idioma === 'pt' ? 'Funcionário' : idioma === 'en' ? 'Employee' : 'Empleado'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Inputs Cadastro */}
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: erroCadastro && !cadastro.nome ? 'red' : colors.primary }]}
              placeholder="Nome"
              placeholderTextColor={theme.placeholderText}
              value={cadastro.nome}
              onChangeText={v => setCadastro({ ...cadastro, nome: v })}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: erroCadastro && !validarEmail(cadastro.email) ? 'red' : colors.primary }]}
              placeholder="Email"
              placeholderTextColor={theme.placeholderText}
              value={cadastro.email}
              onChangeText={v => setCadastro({ ...cadastro, email: v })}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: erroCadastro && !validarSenha(cadastro.senha) ? 'red' : colors.primary }]}
              placeholder={currentTexts.pass}
              placeholderTextColor={theme.placeholderText}
              secureTextEntry
              value={cadastro.senha}
              onChangeText={v => setCadastro({ ...cadastro, senha: v })}
            />

            {tipoCadastro === 'admin' && (
              <>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: erroCadastro && !validarCNPJ(cadastro.cnpj) ? 'red' : colors.primary }]}
                  placeholder="CNPJ"
                  placeholderTextColor={theme.placeholderText}
                  value={cadastro.cnpj}
                  onChangeText={v => setCadastro({ ...cadastro, cnpj: v })}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: colors.primary }]}
                  placeholder="Código do Admin (gerado)"
                  placeholderTextColor={theme.placeholderText}
                  value={cadastro.codigoAdm}
                  editable={false}
                />
              </>
            )}

            {tipoCadastro === 'func' && (
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: erroCadastro && !cadastro.codigoFuncionario ? 'red' : colors.primary }]}
                placeholder="Código de acesso ao pátio"
                placeholderTextColor={theme.placeholderText}
                value={cadastro.codigoFuncionario}
                onChangeText={v => setCadastro({ ...cadastro, codigoFuncionario: v })}
              />
            )}

            {erroCadastro !== '' && <Text style={{ color: 'red', marginBottom: 8, textAlign: 'center' }}>{erroCadastro}</Text>}

            <TouchableOpacity
              style={[styles.botao, { backgroundColor: colors.primary, marginTop: 8, opacity: loadingCadastro ? 0.7 : 1 }]}
              onPress={cadastrarUsuario}
              disabled={loadingCadastro}
            >
              {loadingCadastro ? <ActivityIndicator color="#fff" /> : <Text style={[styles.botaoTexto, { color: theme.buttonText }]}>Cadastrar</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.botao, { backgroundColor: '#888', marginTop: 8 }]} onPress={() => setShowCadastro(false)}>
              <Text style={[styles.botaoTexto, { color: '#fff' }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, paddingHorizontal: 35 },
  topBar: { position: 'absolute', top: 40, right: 20, flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  logoContainer: { alignItems: 'center', marginBottom: 10 },
  logoBg: { borderRadius: 100, padding: 10 },
  logo: { width: 170, height: 170 },
  title: { fontSize: 27, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  input: { borderRadius: 10, paddingHorizontal: 15, paddingVertical: 15, marginBottom: 10, borderWidth: 1 },
  botao: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  botaoTexto: { fontSize: 20, fontWeight: 'bold' },
  langContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  langItem: { alignItems: 'center', marginHorizontal: 10 },
  langEmoji: { fontSize: 32 },
  langLabel: { fontSize: 13, marginTop: 3 },
  modal: { padding: 20, borderRadius: 12 },
});
