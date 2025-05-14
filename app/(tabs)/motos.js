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
      <Text style={styles.header}>Gestão de Motos no Pátio</Text>

      <View style={styles.card}>
        <BuscaMoto onSelecionarMoto={(m) => setMotoSelecionada(m)} />
      </View>

      <View style={styles.card}>
        <MapaPatio motoSelecionada={motoSelecionada} />
      </View>

      <TouchableOpacity style={styles.actionBtn} onPress={toggleCadastro} activeOpacity={0.8}>
        <Text style={styles.actionText}>
          {mostrarCadastro ? '✖️ Cancelar Cadastro' : '➕ Cadastrar Nova Moto'}
        </Text>
      </TouchableOpacity>

      {mostrarCadastro && (
        <View style={styles.formCard}>
          <CadastroMotoAvancado onRegistrarLocalizacao={handleNovaMoto} />
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
    paddingTop: 40,
    padding: 20,
    paddingBottom: 60,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#1f1f1f',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderColor: colors.primary,
    borderWidth: 1,
  },
});
