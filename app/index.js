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
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ThemeContext } from '../src/context/ThemeContext.js';
import colors from '../src/theme/colors.js';

const LANGUAGES = [
  { code: 'pt', label: 'Português', emoji: '🇧🇷' },
  { code: 'en', label: 'English', emoji: '🇺🇸' },
  { code: 'es', label: 'Español', emoji: '🇪🇸' },
];

const TEXTS = {
  pt: { welcome: 'SEJA BEM-VINDO', user: 'Usuário', pass: 'Senha', enter: 'Entrar', error: 'Usuário ou senha incorretos' },
  en: { welcome: 'WELCOME', user: 'User', pass: 'Password', enter: 'Login', error: 'Incorrect username or password' },
  es: { welcome: 'BIENVENIDO', user: 'Usuario', pass: 'Contraseña', enter: 'Entrar', error: 'Usuario o contraseña incorrectos' },
};

function gerarCodigoAdm() {
  return 'ADM-' + Math.floor(Math.random() * 1000000);
}

export default function Login() {
  const { temaEscuro, toggleTema, idioma, mudarIdioma } = useContext(ThemeContext);
  const router = useRouter();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showCadastro, setShowCadastro] = useState(false);
  const [tipoCadastro, setTipoCadastro] = useState('admin');
  const [cadastro, setCadastro] = useState({
    nome: '', email: '', senha: '', cnpj: '', patio: '', endereco: '', codigoAdm: gerarCodigoAdm(), codigoPatio: '', tipo: 'admin', codigoFuncionario: ''
  });
  const [erroCadastro, setErroCadastro] = useState('');

  // Simulação de patios cadastrados
  const [patios, setPatios] = useState([]);

  const currentTexts = TEXTS[idioma] || TEXTS['pt'];

  const theme = temaEscuro
    ? { background: '#000', card: '#222', text: '#fff', buttonText: '#fff', placeholderText: '#ccc', logoBg: 'transparent' }
    : { background: '#fff', card: '#f2f2f2', text: '#222', buttonText: '#fff', placeholderText: '#888', logoBg: '#222' };

  const fazerLogin = async () => {
    if (usuario === '' && senha === '') {
      await AsyncStorage.setItem('@usuario_logado', JSON.stringify({ usuario, lang: idioma }));
      router.replace('/selecao-patio');
    } else {
      Alert.alert('Erro', currentTexts.error);
    }
  };

  // Validação de pátio único
  function patioExiste(nome, endereco, codigoPatio) {
    return patios.some(p => p.patio === nome || p.endereco === endereco || p.codigoPatio === codigoPatio);
  }

  // Cadastro de usuário
  async function cadastrarUsuario() {
    setErroCadastro('');
    if (cadastro.tipo === 'admin') {
      if (!cadastro.nome || !cadastro.email || !cadastro.senha || !cadastro.cnpj || !cadastro.patio || !cadastro.endereco) {
        setErroCadastro('Preencha todos os campos!');
        return;
      }
      if (patioExiste(cadastro.patio, cadastro.endereco, cadastro.codigoPatio)) {
        setErroCadastro('Já existe um pátio com esse nome, endereço ou código!');
        return;
      }
      // Simula cadastro
      setPatios([...patios, { patio: cadastro.patio, endereco: cadastro.endereco, codigoPatio: cadastro.codigoPatio }]);
      Alert.alert('Sucesso', 'Administrador cadastrado! Código do adm: ' + cadastro.codigoAdm);
      setShowCadastro(false);
    } else {
      if (!cadastro.nome || !cadastro.email || !cadastro.senha || !cadastro.codigoFuncionario) {
        setErroCadastro('Preencha todos os campos!');
        return;
      }
      // Simula validação do código de acesso
      if (!patios.some(p => p.codigoPatio === cadastro.codigoFuncionario)) {
        setErroCadastro('Código de acesso ao pátio inválido!');
        return;
      }
      Alert.alert('Sucesso', 'Funcionário cadastrado!');
      setShowCadastro(false);
    }
  }

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
          <Image
            source={require('../assets/images/motofacil.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Título */}
      <Text style={[styles.title, { color: theme.text }]}>{currentTexts.welcome}</Text>

      {/* Inputs */}
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: colors.primary }]}
        placeholder={currentTexts.user}
        placeholderTextColor={theme.placeholderText}
        value={usuario}
        onChangeText={setUsuario}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: colors.primary }]}
        placeholder={currentTexts.pass}
        placeholderTextColor={theme.placeholderText}
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      {/* Botão */}
      <TouchableOpacity style={[styles.botao, { backgroundColor: colors.primary }]} onPress={fazerLogin}>
        <Text style={[styles.botaoTexto, { color: theme.buttonText }]}>{currentTexts.enter}</Text>
      </TouchableOpacity>

      {/* Seleção de idioma */}
      <View style={styles.langContainer}>
        {LANGUAGES.map(lang => (
          <TouchableOpacity key={lang.code} style={styles.langItem} onPress={() => mudarIdioma(lang.code)}>
            <Text style={[styles.langEmoji, { opacity: idioma === lang.code ? 1 : 0.5 }]}>{lang.emoji}</Text>
            <Text style={[styles.langLabel, { color: theme.text }]}>{lang.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={{marginTop: 18}} onPress={() => setShowCadastro(true)}>
        <Text style={{color: colors.primary, fontWeight: 'bold', fontSize: 16, textAlign: 'center'}}>
          {idioma === 'pt' ? 'Cadastrar' : idioma === 'en' ? 'Register' : 'Registrar'}
        </Text>
      </TouchableOpacity>

      <Modal visible={showCadastro} transparent animationType="fade" onRequestClose={() => setShowCadastro(false)}>
        <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)'}}>
          <View style={[styles.modal, {backgroundColor: theme.card, minWidth: 320}]}> 
            <Text style={{fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 10}}>
              {idioma === 'pt' ? 'Cadastro de Usuário' : idioma === 'en' ? 'User Registration' : 'Registro de Usuario'}
            </Text>
            <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 10}}>
              <TouchableOpacity onPress={() => setTipoCadastro('admin')} style={{marginRight: 20}}>
                <Text style={{color: tipoCadastro === 'admin' ? colors.primary : theme.text, fontWeight: 'bold'}}>
                  {idioma === 'pt' ? 'Administrador' : idioma === 'en' ? 'Administrator' : 'Administrador'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTipoCadastro('func')}>
                <Text style={{color: tipoCadastro === 'func' ? colors.primary : theme.text, fontWeight: 'bold'}}>
                  {idioma === 'pt' ? 'Funcionário' : idioma === 'en' ? 'Employee' : 'Empleado'}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput style={[styles.input, {backgroundColor: theme.card, color: theme.text, borderColor: colors.primary}]}
              placeholder={currentTexts.user}
              placeholderTextColor={theme.placeholderText} value={cadastro.nome} onChangeText={v => setCadastro({...cadastro, nome: v})} />
            <TextInput style={[styles.input, {backgroundColor: theme.card, color: theme.text, borderColor: colors.primary}]}
              placeholder="Email" placeholderTextColor={theme.placeholderText} value={cadastro.email} onChangeText={v => setCadastro({...cadastro, email: v})} />
            <TextInput style={[styles.input, {backgroundColor: theme.card, color: theme.text, borderColor: colors.primary}]}
              placeholder={currentTexts.pass}
              placeholderTextColor={theme.placeholderText} secureTextEntry value={cadastro.senha} onChangeText={v => setCadastro({...cadastro, senha: v})} />
            {tipoCadastro === 'admin' && (
              <>
                <TextInput style={[styles.input, {backgroundColor: theme.card, color: theme.text, borderColor: colors.primary}]}
                  placeholder={idioma === 'pt' ? 'CNPJ' : idioma === 'en' ? 'CNPJ' : 'CNPJ'}
                  placeholderTextColor={theme.placeholderText} value={cadastro.cnpj} onChangeText={v => setCadastro({...cadastro, cnpj: v})} />
                <TextInput style={[styles.input, {backgroundColor: theme.card, color: theme.text, borderColor: colors.primary}]}
                  placeholder={idioma === 'pt' ? 'Nome do Pátio' : idioma === 'en' ? 'Yard Name' : 'Nombre del Patio'}
                  placeholderTextColor={theme.placeholderText} value={cadastro.patio} onChangeText={v => setCadastro({...cadastro, patio: v})} />
                <TextInput style={[styles.input, {backgroundColor: theme.card, color: theme.text, borderColor: colors.primary}]}
                  placeholder={idioma === 'pt' ? 'Localização do Pátio' : idioma === 'en' ? 'Yard Location' : 'Ubicación del Patio'}
                  placeholderTextColor={theme.placeholderText} value={cadastro.endereco} onChangeText={v => setCadastro({...cadastro, endereco: v})} />
                <TextInput style={[styles.input, {backgroundColor: theme.card, color: theme.text, borderColor: colors.primary}]}
                  placeholder={idioma === 'pt' ? 'Código do Pátio (gerado)' : idioma === 'en' ? 'Yard Code (generated)' : 'Código del Patio (generado)'}
                  placeholderTextColor={theme.placeholderText} value={cadastro.codigoAdm} editable={false} />
              </>
            )}
            {tipoCadastro === 'func' && (
              <TextInput style={[styles.input, {backgroundColor: theme.card, color: theme.text, borderColor: colors.primary}]}
                placeholder={idioma === 'pt' ? 'Código de acesso ao pátio' : idioma === 'en' ? 'Yard Access Code' : 'Código de acceso al patio'}
                placeholderTextColor={theme.placeholderText} value={cadastro.codigoFuncionario} onChangeText={v => setCadastro({...cadastro, codigoFuncionario: v})} />
            )}
            {erroCadastro !== '' && <Text style={{color: 'red', marginBottom: 8, textAlign: 'center'}}>{erroCadastro}</Text>}
            <TouchableOpacity style={[styles.botao, {backgroundColor: colors.primary, marginTop: 8}]} onPress={cadastrarUsuario}>
              <Text style={[styles.botaoTexto, {color: theme.buttonText}]}>
                {idioma === 'pt' ? 'Cadastrar' : idioma === 'en' ? 'Register' : 'Registrar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.botao, {backgroundColor: '#888', marginTop: 8}]} onPress={() => setShowCadastro(false)}>
              <Text style={[styles.botaoTexto, {color: '#fff'}]}>
                {idioma === 'pt' ? 'Cancelar' : idioma === 'en' ? 'Cancel' : 'Cancelar'}
              </Text>
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
