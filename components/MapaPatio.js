import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import colors from '../src/theme/colors';

const MAP_WIDTH = 300;
const MAP_HEIGHT = 300;

export default function MapaPatio({ motoSelecionada }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [posicaoUsuario, setPosicaoUsuario] = useState({ x: 0.1, y: 0.9 });
  const [carregando, setCarregando] = useState(true);

  const x = motoSelecionada?.x ?? 0.4;
  const y = motoSelecionada?.y ?? 0.7;

  const left = x * MAP_WIDTH;
  const top = y * MAP_HEIGHT;

  const leftUser = posicaoUsuario.x * MAP_WIDTH;
  const topUser = posicaoUsuario.y * MAP_HEIGHT;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        // Aqui futuramente calcula a posição real
        setPosicaoUsuario({ x: 0.1, y: 0.9 });
      }
      setCarregando(false);
    })();
  }, []);

  const renderMapa = () => (
    <View style={styles.mapa}>
      <View style={[styles.ponto, styles.moto, { left, top }]}>
        <Text style={styles.icone}>🏍</Text>
      </View>
      <View style={[styles.ponto, styles.usuario, { left: leftUser, top: topUser }]}>
        <Text style={styles.icone}>🧍</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.titulo}>🗺️ Mapa do Pátio</Text>

      {carregando ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          {renderMapa()}

          <View style={styles.infoBox}>
            {motoSelecionada ? (
              <>
                <Text style={styles.label}>Placa:</Text>
                <Text style={styles.valor}>{motoSelecionada.placa}</Text>
                <Text style={styles.label}>Modelo:</Text>
                <Text style={styles.valor}>{motoSelecionada.modelo || 'Não informado'}</Text>
                <Text style={styles.label}>Categoria:</Text>
                <Text style={styles.valor}>{motoSelecionada.categoria || 'Não informado'}</Text>
              </>
            ) : (
              <Text style={styles.valor}>Nenhuma moto selecionada</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.expandirBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.expandirText}>🔍 Ver em tela cheia</Text>
          </TouchableOpacity>
        </>
      )}

      {/* MODAL PREMIUM */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitulo}>🧭 Mapa em Tela Cheia</Text>
          {renderMapa()}
          <TouchableOpacity
            style={styles.modalFecharBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalFecharText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 16,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  mapa: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    borderColor: colors.primary,
    borderWidth: 1.5,
    position: 'relative',
  },
  ponto: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  moto: {
    backgroundColor: '#ff4d4d',
  },
  usuario: {
    backgroundColor: '#4d94ff',
  },
  icone: {
    fontSize: 16,
    color: '#fff',
  },
  infoBox: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    color: colors.secondary,
  },
  valor: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  expandirBtn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  expandirText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  modalTitulo: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalFecharBtn: {
    marginTop: 20,
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 10,
  },
  modalFecharText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
