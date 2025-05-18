import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [motosRegistradas, setMotosRegistradas] = useState([]);

  useEffect(() => {
    carregarMotos();
  }, []);

  const carregarMotos = async () => {
    const salvas = await AsyncStorage.getItem('motos');
    if (salvas) {
      setMotosRegistradas(JSON.parse(salvas));
    }
  };

  const salvarMotos = async (motos) => {
    await AsyncStorage.setItem('motos', JSON.stringify(motos));
  };

  const toggleCadastro = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMostrarCadastro(!mostrarCadastro);
  };

  const handleNovaMoto = (moto) => {
    const novaMoto = {
      ...moto,
      id: Date.now(),
      status: 'pingar',
      localizacao: null,
    };
    const listaAtualizada = [...motosRegistradas, novaMoto];
    setMotosRegistradas(listaAtualizada);
    salvarMotos(listaAtualizada);
    setMotoSelecionada(novaMoto);
    setMostrarCadastro(false);
  };

  const handleSelecionarMoto = (moto) => {
    setMotoSelecionada(moto);
  };

  const enviarParaMecanica = () => {
    const atualizada = { ...motoSelecionada, status: 'mecanica', localizacao: null };
    atualizarMoto(atualizada);
    setMotoSelecionada(atualizada);
  };

  const retornarParaPatio = () => {
    const atualizada = { ...motoSelecionada, status: 'pingar' };
    atualizarMoto(atualizada);
    setMotoSelecionada(atualizada);
  };

  const pingarLocalizacao = () => {
    const local = { x: Math.random(), y: Math.random() };
    const atualizada = {
      ...motoSelecionada,
      status: 'patio',
      localizacao: local,
    };
    atualizarMoto(atualizada);
    setMotoSelecionada(atualizada);
    Alert.alert('📍 Localização registrada', 'Moto posicionada no pátio!');
  };

  const atualizarMoto = (atualizada) => {
    const listaNova = motosRegistradas.map((m) => (m.id === atualizada.id ? atualizada : m));
    setMotosRegistradas(listaNova);
    salvarMotos(listaNova);
  };

  const renderMapaOuStatus = () => {
    if (!motoSelecionada) return null;

    if (motoSelecionada.status === 'mecanica') {
      return (
        <View style={styles.card}>
          <Text style={styles.mecanicaStatus}>🔧 Esta moto está na mecânica</Text>
          <TouchableOpacity style={styles.btn} onPress={retornarParaPatio}>
            <Text style={styles.btnText}>🔙 Retornar ao Pátio</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (motoSelecionada.status === 'pingar') {
      return (
        <View style={styles.card}>
          <Text style={styles.mecanicaStatus}>📍 A moto precisa ser posicionada no pátio</Text>
          <TouchableOpacity style={styles.btn} onPress={pingarLocalizacao}>
            <Text style={styles.btnText}>📌 Definir Localização</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (motoSelecionada.status === 'patio') {
      return (
        <View style={styles.card}>
          <MapaPatio motoSelecionada={motoSelecionada} />
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.btnSecundario} onPress={pingarLocalizacao}>
              <Text style={styles.btnText}>📍 Trocar Localização</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnAlerta} onPress={enviarParaMecanica}>
              <Text style={styles.btnText}>🔧 Enviar para Mecânica</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Gestão de Motos no Pátio</Text>

      <View style={styles.card}>
        <BuscaMoto
          onSelecionarMoto={(moto) => handleSelecionarMoto(moto)}
          listaMotos={motosRegistradas}
        />
      </View>

      {renderMapaOuStatus()}

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
  btnSecundario: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  btnAlerta: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  mecanicaStatus: {
    textAlign: 'center',
    color: '#f59e0b',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 15,
  },
  buttonGroup: {
    gap: 12,
  },
});
