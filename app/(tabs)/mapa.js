import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import colors from '../../src/theme/colors';

const larguraPatio = 300;
const alturaPatio = 300;

export default function MapaPatio({ motoSelecionada }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [posicaoUsuario, setPosicaoUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Simula coordenadas da moto (valores de 0 a 1)
  const x = motoSelecionada?.x ?? 0.4;
  const y = motoSelecionada?.y ?? 0.7;

  const left = x * larguraPatio;
  const top = y * alturaPatio;

  const leftUser = posicaoUsuario?.x ? posicaoUsuario.x * larguraPatio : 0.1 * larguraPatio;
  const topUser = posicaoUsuario?.y ? posicaoUsuario.y * alturaPatio : 0.9 * alturaPatio;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCarregando(false);
        return;
      }

      // Aqui você pode adaptar a lógica para gerar coordenadas reais
      setPosicaoUsuario({ x: 0.1, y: 0.9 });
      setCarregando(false);
    })();
  }, []);

  const renderMapa = () => (
    <View style={styles.mapa}>
      {/* Moto */}
      <View style={[styles.ponto, styles.moto, { left, top }]}>
        <Text style={styles.icone}>🏍️</Text>
      </View>

      {/* Usuário */}
      <View style={[styles.ponto, styles.usuario, { left: leftUser, top: topUser }]}>
        <Text style={styles.icone}>🧍</Text>
      </View>
    </View>
  );

  return (
    <View>
      <Text style={styles.titulo}>📍 Mapa do Pátio</Text>

      <View style={styles.legenda}>
        <Text style={styles.legendaItem}>🔴 Moto</Text>
        <Text style={styles.legendaItem}>🔵 Você</Text>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <>
          {renderMapa()}
          <TouchableOpacity style={styles.expandirBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.expandirText}>🧭 Ampliar Mapa</Text>
          </TouchableOpacity>
        </>
      )}

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitulo}>📍 Mapa - Visualização Completa</Text>

          {/* Dados da moto */}
          {motoSelecionada ? (
            <View style={styles.motoInfo}>
              <Text style={styles.infoText}>Placa: {motoSelecionada.placa}</Text>
              <Text style={styles.infoText}>Modelo: {motoSelecionada.modelo ?? 'Não informado'}</Text>
              <Text style={styles.infoText}>Categoria: {motoSelecionada.categoria ?? 'Não informado'}</Text>
            </View>
          ) : (
            <Text style={styles.infoText}>Nenhuma moto selecionada</Text>
          )}

          {renderMapa()}

          <TouchableOpacity style={styles.fecharBtn} onPress={() => setModalVisible(false)}>
            <Text style={styles.expandirText}>❌ Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: {
    paddingTop: 50,
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  legenda: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 10,
  },
  legendaItem: {
    fontSize: 14,
    color: colors.text,
    
  },
  mapa: {
    width: larguraPatio,
    height: alturaPatio,
    backgroundColor: '#f2f2f2',
    borderWidth: 2,
    borderColor: colors.primary,
    alignSelf: 'center',
    position: 'relative',
    borderRadius: 12,
    marginBottom: 10,
  },
  ponto: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moto: {
    backgroundColor: 'red',
  },
  usuario: {
    backgroundColor: 'blue',
  },
  icone: {
    color: 'white',
    fontSize: 16,
  },
  expandirBtn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  expandirText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modalTitulo: {
    paddingTop: 40,
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  motoInfo: {
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    color: colors.text,
    fontSize: 16,
    marginVertical: 2,
  },
  fecharBtn: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 10,
    marginTop: 30,
  },
});
