import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Dimensions, Alert
} from 'react-native';
import api from '../src/config/api.js';
import colors from '../src/theme/colors.js';

const { width } = Dimensions.get('window');
const MAP_WIDTH = Math.min(width * 0.8, 250); // nunca maior que 250px
const MAP_HEIGHT = MAP_WIDTH;
const ICON_SIZE = 25;

export default function MapaPatio({ patioSelecionado, motoSelecionada }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [posicaoUsuario, setPosicaoUsuario] = useState({ x: 0.1, y: 0.9 });
  const [motoAtual, setMotoAtual] = useState(motoSelecionada);
  const [patioCoords, setPatioCoords] = useState([]);

  // Carrega coordenadas do pátio selecionado
  useEffect(() => {
    if (patioSelecionado?.id) fetchPatioCoords(patioSelecionado.id);
  }, [patioSelecionado]);

  useEffect(() => {
    if (motoSelecionada?.id) fetchMotoLocation(motoSelecionada.id);
  }, [motoSelecionada]);

  const fetchPatioCoords = async (patioId) => {
    try {
      setCarregando(true);
      const resp = await api.get(`/patios/${patioId}`);
      setPatioCoords(resp.data.coordenadasExtremidade || []);
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Não foi possível carregar as coordenadas do pátio.');
      setPatioCoords([]);
    } finally {
      setCarregando(false);
    }
  };

  const fetchMotoLocation = async (id) => {
    try {
      setCarregando(true);
      const response = await api.get(`/motos/${id}/location`);
      // Corrigido: localizacao para compatibilidade absoluta com backend/front
      setMotoAtual({ ...motoSelecionada, localizacao: response.data });
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Não foi possível carregar a localização da moto.');
    } finally {
      setCarregando(false);
    }
  };

  // Use localizacao.x e localizacao.y fiel ao backend/front
  const getCoords = (coord, size) => (coord * size - ICON_SIZE / 2);

  // Corrigido: usa motoAtual.localizacao
  const leftMoto = getCoords(motoAtual?.localizacao?.x ?? 0, MAP_WIDTH);
  const topMoto = getCoords(motoAtual?.localizacao?.y ?? 0, MAP_HEIGHT);
  const leftUser = getCoords(posicaoUsuario.x, MAP_WIDTH);
  const topUser = getCoords(posicaoUsuario.y, MAP_HEIGHT);

  const distancia = Math.sqrt(Math.pow(leftMoto - leftUser, 2) + Math.pow(topMoto - topUser, 2)) * 100;

  // Renderiza os pontos das coordenadas do pátio (os ESPs/cantos)
  const renderPatioPoints = (mapWidth = MAP_WIDTH, mapHeight = MAP_HEIGHT) => {
    if (!patioCoords || patioCoords.length === 0) return null;
    return patioCoords.map((coord, idx) => (
      <View
        key={idx}
        style={[styles.pontoPatio, {
          left: getCoords(coord.x, mapWidth),
          top: getCoords(coord.y, mapHeight),
        }]}
      >
        <Text style={styles.iconePatio}>📍</Text>
        <Text style={styles.patioNome}>{coord.nome || `ESP${idx + 1}`}</Text>
      </View>
    ));
  };

  const renderMapa = (mapWidth = MAP_WIDTH, mapHeight = MAP_HEIGHT) => (
    <View style={[styles.mapa, { width: mapWidth, height: mapHeight }]}>
      {/* Pontos dos cantos do pátio */}
      {renderPatioPoints(mapWidth, mapHeight)}
      {/* Moto */}
      <View style={[styles.ponto, styles.moto, { left: leftMoto, top: topMoto }]}>
        <Text style={styles.icone}>🏍</Text>
      </View>
      {/* Usuário */}
      <View style={[styles.ponto, styles.usuario, { left: leftUser, top: topUser }]}>
        <Text style={styles.icone}>🧍</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.titulo}>🗺️ Mapa do Pátio</Text>

      {carregando ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : renderMapa()}

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
          {renderMapa(width * 0.95, width * 0.95)}
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
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    borderColor: colors.primary,
    borderWidth: 1.5,
    position: 'relative',
    maxWidth: 350,
    maxHeight: 350,
    width: '100%',
    height: 250,
  },
  ponto: {
    position: 'absolute',
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  moto: { backgroundColor: '#ff4d4d', borderWidth: 2, borderColor: '#fff' },
  usuario: { backgroundColor: '#4d94ff', borderWidth: 2, borderColor: '#fff' },
  icone: { fontSize: 18, color: '#fff' },
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
  pontoPatio: {
    position: 'absolute',
    width: ICON_SIZE + 8,
    height: ICON_SIZE + 8,
    borderRadius: (ICON_SIZE + 8) / 2,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  mapaPlaceholder: {
    minHeight: 250,
    maxHeight: 350,
    maxWidth: 350,
    width: '100%',
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  iconePatio: { fontSize: 18, color: colors.primary },
  patioNome: { fontSize: 11, color: colors.primary, fontWeight: 'bold' }
});