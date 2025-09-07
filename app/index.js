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

export default function Login() {
  const { temaEscuro, toggleTema, idioma, mudarIdioma } = useContext(ThemeContext);
  const router = useRouter();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

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
});
