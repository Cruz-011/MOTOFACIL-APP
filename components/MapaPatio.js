import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import colors from '../src/theme/colors.js';

const MAP_WIDTH = 300;
const MAP_HEIGHT = 300;
const API_URL = 'http://10.3.75.8:8080/api'; // substitua pelo IP real do backend

export default function MapaPatio({ patioSelecionado, motoSelecionada }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [posicaoUsuario, setPosicaoUsuario] = useState({ x: 0.1, y: 0.9 });
  const [motoAtual, setMotoAtual] = useState(motoSelecionada);

  useEffect(() => {
    if (motoSelecionada?.id) fetchMotoLocation(motoSelecionada.id);
  }, [motoSelecionada]);

  const fetchMotoLocation = async (id) => {
    try {
      setCarregando(true);
      const response = await axios.get(`${API_URL}/motos/${id}/location`);
      setMotoAtual({ ...motoSelecionada, location: response.data });
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Não foi possível carregar a localização da moto.');
    } finally {
      setCarregando(false);
    }
  };

  const x = motoAtual?.location?.x ?? 0;
  const y = motoAtual?.location?.y ?? 0;

  const left = x * MAP_WIDTH;
  const top = y * MAP_HEIGHT;

  const leftUser = posicaoUsuario.x * MAP_WIDTH;
  const topUser = posicaoUsuario.y * MAP_HEIGHT;

  const distancia = Math.sqrt(Math.pow(left - leftUser, 2) + Math.pow(top - topUser, 2)) * 100;

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

      {carregando ? <ActivityIndicator size="large" color={colors.primary} /> : renderMapa()}

      {motoAtual && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{motoAtual.modelo || 'Moto'}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Placa:</Text>
            <Text style={styles.valor}>{motoAtual.placa || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Chassi:</Text>
            <Text style={styles.valor}>{motoAtual.chassi || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Categoria:</Text>
            <Text style={styles.valor}>{motoAtual.categoria || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.valor}>{motoAtual.status || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Distância:</Text>
            <Text style={styles.valor}>{distancia.toFixed(1)} m</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.expandirBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.expandirText}>🔍 Ver em tela cheia</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitulo}>🧭 Mapa em Tela Cheia</Text>
          {renderMapa()}
          <TouchableOpacity style={styles.modalFecharBtn} onPress={() => setModalVisible(false)}>
            <Text style={styles.modalFecharText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 16 },
  titulo: { fontSize: 20, fontWeight: '600', color: colors.primary, marginBottom: 8 },
  mapa: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    borderColor: colors.primary,
    borderWidth: 1.5,
    position: 'relative',
  },
  ponto: { position: 'absolute', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  moto: { backgroundColor: '#ff4d4d' },
  usuario: { backgroundColor: '#4d94ff' },
  icone: { fontSize: 16, color: '#fff' },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginTop: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', width: '100%', marginBottom: 10 },
  infoRow: { flexDirection: 'row', width: '48%', marginBottom: 6 },
  label: { fontWeight: 'bold', marginRight: 4 },
  valor: {},
  expandirBtn: { backgroundColor: colors.primary, padding: 12, borderRadius: 10, marginTop: 10, marginBottom: 20 },
  expandirText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  modalContainer: { flex: 1, backgroundColor: colors.background, padding: 20, justifyContent: 'center', alignItems: 'center', gap: 20 },
  modalTitulo: { fontSize: 22, color: colors.primary, fontWeight: 'bold' },
  modalFecharBtn: { marginTop: 20, backgroundColor: '#444', padding: 12, borderRadius: 10 },
  modalFecharText: { color: '#fff', fontWeight: 'bold' },
});
