import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  FlatList,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../src/theme/colors';
import MapaPatio from '../../components/MapaPatio';
import CadastroMotoAvancado from '../../components/CadastroMotoAvancado';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Motos() {
  const [motos, setMotos] = useState([]);
  const [motoSelecionada, setMotoSelecionada] = useState(null);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [busca, setBusca] = useState('');
  const [modalMoto, setModalMoto] = useState(false);

  useEffect(() => { carregarMotos(); }, []);

  const carregarMotos = async () => {
    const salvas = await AsyncStorage.getItem('motos');
    if (salvas) setMotos(JSON.parse(salvas));
  };

  const salvarMotos = async (lista) => {
    await AsyncStorage.setItem('motos', JSON.stringify(lista));
  };

  const toggleCadastro = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMostrarCadastro(!mostrarCadastro);
  };

  const handleNovaMoto = (moto) => {
    const novaMoto = { ...moto, id: Date.now(), status: 'pingar', localizacao: null };
    const listaAtualizada = [...motos, novaMoto];
    setMotos(listaAtualizada);
    salvarMotos(listaAtualizada);
    setMostrarCadastro(false);
  };

  const atualizarMoto = (atualizada) => {
    const lista = motos.map(m => m.id === atualizada.id ? atualizada : m);
    setMotos(lista);
    salvarMotos(lista);
    setMotoSelecionada(atualizada);
  };

  // Funções de ação
  const enviarParaMecanica = (m) => atualizarMoto({ ...m, status: 'mecanica' });
  const retornarParaPatio = (m) => atualizarMoto({ ...m, status: 'patio' });
  const pingarLocalizacao = (m) => {
    const atualizada = {
      ...m,
      status: 'patio',
      localizacao: { x: Math.random(), y: Math.random() },
    };
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    atualizarMoto(atualizada);
  };

  const motosNoPatio = motos.filter(m => m.status === 'patio');
  const motosNaMecanica = motos.filter(m => m.status === 'mecanica');

  const motosFiltradas = motos.filter(m =>
    m.placa?.toLowerCase().includes(busca.toLowerCase()) ||
    m.modelo?.toLowerCase().includes(busca.toLowerCase()) ||
    m.codigo?.toLowerCase().includes(busca.toLowerCase())
  );

  const abrirModal = (moto) => {
    setMotoSelecionada(moto);
    setModalMoto(true);
  };

  return (
    <View style={styles.container}>
      {/* Botão cadastro fixo */}
      <TouchableOpacity style={styles.btnCadastroTopo} onPress={toggleCadastro}>
        <Text style={styles.btnText}>{mostrarCadastro ? '✖️ Cancelar Cadastro' : '➕ Cadastrar Nova Moto'}</Text>
      </TouchableOpacity>

      {/* Cadastro */}
      {mostrarCadastro && (
        <View style={styles.cardCadastro}>
          <CadastroMotoAvancado onRegistrarLocalizacao={handleNovaMoto} onFechar={() => setMostrarCadastro(false)} />
        </View>
      )}



      {/* Status */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusCard, {backgroundColor: '#d1fae5'}]}>
          <Text style={[styles.statusTitulo, {color: '#047857'}]}>🏍️ Pátio</Text>
          <Text style={styles.statusNumero}>{motosNoPatio.length}</Text>
        </View>
        <View style={[styles.statusCard, {backgroundColor: '#fee2e2'}]}>
          <Text style={[styles.statusTitulo, {color: '#b91c1c'}]}>🔧 Mecânica</Text>
          <Text style={styles.statusNumero}>{motosNaMecanica.length}</Text>
        </View>
      </View>

      {/* Barra de pesquisa */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Pesquisar moto"
        value={busca}
        onChangeText={setBusca}
      />

      {/* Lista de motos */}
      <FlatList
        data={motosFiltradas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity style={[styles.motoItem, {borderLeftColor:
            item.status === 'patio' ? '#10b981' :
            item.status === 'mecanica' ? '#ef4444' : '#f59e0b'
          }]} onPress={() => abrirModal(item)}>
            <Text style={styles.motoTitulo}>{item.placa || item.codigo} - {item.modelo}</Text>
            <Text style={styles.motoSub}>Chassi: {item.chassi || 'N/A'}</Text>
          </TouchableOpacity>
        )}
        style={{flex: 1, width: '100%'}}
        contentContainerStyle={{paddingBottom: 120}}
      />

      {/* Modal da moto selecionada */}
      <Modal visible={modalMoto} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>{motoSelecionada?.placa || motoSelecionada?.codigo} - {motoSelecionada?.modelo}</Text>
            {motoSelecionada?.descricao && <Text style={styles.modalSub}>{motoSelecionada.descricao}</Text>}
            <Text>Status: {motoSelecionada?.status === 'patio' ? '📍 Pátio' : motoSelecionada?.status === 'mecanica' ? '🔧 Mecânica' : '📌 Pendente'}</Text>

            {/* Botões rápidos */}
            {motoSelecionada?.status === 'pingar' && (
              <TouchableOpacity style={styles.btnPrimary} onPress={() => pingarLocalizacao(motoSelecionada)}>
                <Text style={styles.btnText}>📌 Posicionar no Pátio</Text>
              </TouchableOpacity>
            )}
            {motoSelecionada?.status === 'patio' && (
              <>
                <TouchableOpacity style={styles.btnSecondary} onPress={() => pingarLocalizacao(motoSelecionada)}>
                  <Text style={styles.btnText}>📍 Trocar Localização</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnDanger} onPress={() => enviarParaMecanica(motoSelecionada)}>
                  <Text style={styles.btnText}>🔧 Enviar para Mecânica</Text>
                </TouchableOpacity>
              </>
            )}
            {motoSelecionada?.status === 'mecanica' && (
              <TouchableOpacity style={styles.btnPrimary} onPress={() => retornarParaPatio(motoSelecionada)}>
                <Text style={styles.btnText}>🔙 Retornar ao Pátio</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.btnSecondary, {marginTop: 10}]} onPress={() => setModalMoto(false)}>
              <Text style={styles.btnText}>✖️ Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 15, backgroundColor: colors.background, alignItems: 'center',paddingTop:50},
  btnCadastroTopo: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
    width: '100%',
    maxWidth: 600,
    marginBottom: 15,
  },
  cardCadastro: {width: '100%', maxWidth: 600, marginBottom: 15},
  statusContainer: {flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 15},
  statusCard: {alignItems: 'center', borderRadius: 12, padding: 15, width: '45%'},
  statusTitulo: {fontSize: 16, fontWeight: 'bold'},
  statusNumero: {fontSize: 24, fontWeight: 'bold', marginTop: 5},
  searchInput: {width: '100%', maxWidth: 600, backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#ddd'},
  motoItem: {backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 10, borderLeftWidth: 5},
  motoTitulo: {fontWeight: 'bold', fontSize: 15, color: colors.primary},
  motoSub: {fontSize: 13, color: colors.secondary},
  modalContainer: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'},
  modalContent: {backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '90%', maxWidth: 400},
  modalTitulo: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  modalSub: {fontSize: 14, marginBottom: 10},
  btnPrimary: {backgroundColor: colors.primary, padding: 12, borderRadius: 10, marginTop: 10},
  btnSecondary: {backgroundColor: '#3b82f6', padding: 12, borderRadius: 10, marginTop: 10},
  btnDanger: {backgroundColor: '#ef4444', padding: 12, borderRadius: 10, marginTop: 10},
  btnText: {color: '#fff', fontWeight: 'bold', textAlign: 'center'},
});
