import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, LayoutAnimation, Platform, UIManager } from 'react-native';
import colors from '../../src/theme/colors';
import CadastroMotoAvancado from '../../components/CadastroMotoAvancado';
import MapaPatio from '../../components/MapaPatio';
import BuscaMoto from '../../components/BuscaMoto';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Motos() {
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [motoSelecionada, setMotoSelecionada] = useState(null);

  const toggleCadastro = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMostrarCadastro(!mostrarCadastro);
  };

  const handleNovaMoto = (moto) => {
    console.log('✅ Moto registrada:', moto);
    setMostrarCadastro(false);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Gerenciamento de Motos</Text>

      <TouchableOpacity style={styles.btnToggle} onPress={toggleCadastro} activeOpacity={0.8}>
        <Text style={styles.btnTexto}>
          {mostrarCadastro ? '⬆️ Fechar Cadastro' : '➕ Cadastrar Nova Moto'}
        </Text>
      </TouchableOpacity>

      {mostrarCadastro && (
        <View style={styles.card}>
          <CadastroMotoAvancado onRegistrarLocalizacao={handleNovaMoto} />
        </View>
      )}

      <View style={styles.card}>
        <BuscaMoto onSelecionarMoto={(m) => setMotoSelecionada(m)} />
      </View>

      <View style={styles.card}>
        <MapaPatio motoSelecionada={motoSelecionada} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 26,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  btnToggle: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
  },
  btnTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    elevation: 4,
  },
});
