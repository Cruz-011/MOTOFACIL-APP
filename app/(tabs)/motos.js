import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

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
    console.log('✅ Moto cadastrada:', moto);
    setMostrarCadastro(false);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Gestão de Motos no Pátio</Text>

      <View style={styles.card}>
        <BuscaMoto onSelecionarMoto={(moto) => setMotoSelecionada(moto)} />
      </View>

      {motoSelecionada && (
        <View style={styles.card}>
          <MapaPatio motoSelecionada={motoSelecionada} />
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={toggleCadastro}>
        <Text style={styles.btnText}>
          {mostrarCadastro ? '✖️ Cancelar Cadastro' : '➕ Cadastrar Nova Moto'}
        </Text>
      </TouchableOpacity>

      {mostrarCadastro && (
        <View style={styles.card}>
           <CadastroMotoAvancado
      onRegistrarLocalizacao={handleNovaMoto}
      onFechar={() => setMostrarCadastro(false)}
    />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 60,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 25,
  },
  card: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
