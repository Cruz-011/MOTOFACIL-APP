import React, { useState, useEffect, useContext } from 'react'; 
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
import { ThemeContext } from '../../src/context/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Motos() {
  const { temaEscuro, idioma } = useContext(ThemeContext);

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

  // cores dinâmicas
  const tema = temaEscuro
    ? { fundo: '#1f2937', texto: '#fff', card: '#374151', border: '#2563eb', btnPrimary: '#3b82f6', btnDanger: '#ef4444' }
    : { fundo: '#f5f5f5', texto: '#000', card: '#fff', border: '#3b82f6', btnPrimary: '#3b82f6', btnDanger: '#ef4444' };

  // traduções
  const t = {
    pesquisar: idioma === 'pt' ? '🔍 Pesquisar moto' : idioma === 'es' ? '🔍 Buscar moto' : '🔍 Search bike',
    patio: idioma === 'pt' ? '🏍️ Pátio' : idioma === 'es' ? '🏍️ Patio' : '🏍️ Yard',
    mecanica: idioma === 'pt' ? '🔧 Mecânica' : idioma === 'es' ? '🔧 Mecánica' : '🔧 Mechanics',
    cadastrar: idioma === 'pt' ? '➕ Cadastrar Nova Moto' : idioma === 'es' ? '➕ Registrar Nueva Moto' : '➕ Add New Bike',
    cancelar: idioma === 'pt' ? '✖️ Cancelar Cadastro' : idioma === 'es' ? '✖️ Cancelar Registro' : '✖️ Cancel',
    posicionar: idioma === 'pt' ? '📌 Posicionar no Pátio' : idioma === 'es' ? '📌 Posicionar en Patio' : '📌 Position in Yard',
    trocarLocalizacao: idioma === 'pt' ? '📍 Trocar Localização' : idioma === 'es' ? '📍 Cambiar Localización' : '📍 Change Location',
    enviarMecanica: idioma === 'pt' ? '🔧 Enviar para Mecânica' : idioma === 'es' ? '🔧 Enviar a Mecánica' : '🔧 Send to Mechanics',
    retornarPatio: idioma === 'pt' ? '🔙 Retornar ao Pátio' : idioma === 'es' ? '🔙 Regresar al Patio' : '🔙 Return to Yard',
    fechar: idioma === 'pt' ? '✖️ Fechar' : idioma === 'es' ? '✖️ Cerrar' : '✖️ Close',
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.fundo }]}>
      <TouchableOpacity style={[styles.btnCadastroTopo, { backgroundColor: tema.btnPrimary, borderColor: tema.border }]} onPress={toggleCadastro}>
        <Text style={styles.btnText}>{mostrarCadastro ? t.cancelar : t.cadastrar}</Text>
      </TouchableOpacity>

      {mostrarCadastro && (
        <View style={[styles.cardCadastro, { backgroundColor: tema.card }]}>
          <CadastroMotoAvancado onRegistrarLocalizacao={handleNovaMoto} onFechar={() => setMostrarCadastro(false)} />
        </View>
      )}

      <View style={styles.statusContainer}>
        <View style={[styles.statusCard, { backgroundColor: temaEscuro ? '#065f46' : '#d1fae5' }]}>
          <Text style={[styles.statusTitulo, { color: temaEscuro ? '#10b981' : '#047857' }]}>{t.patio}</Text>
          <Text style={[styles.statusNumero, { color: tema.texto }]}>{motosNoPatio.length}</Text>
        </View>
        <View style={[styles.statusCard, { backgroundColor: temaEscuro ? '#991b1b' : '#fee2e2' }]}>
          <Text style={[styles.statusTitulo, { color: temaEscuro ? '#fca5a5' : '#b91c1c' }]}>{t.mecanica}</Text>
          <Text style={[styles.statusNumero, { color: tema.texto }]}>{motosNaMecanica.length}</Text>
        </View>
      </View>

      <TextInput
        style={[styles.searchInput, { backgroundColor: tema.card, color: tema.texto, borderColor: tema.border }]}
        placeholder={t.pesquisar}
        placeholderTextColor={temaEscuro ? '#9ca3af' : '#6b7280'}
        value={busca}
        onChangeText={setBusca}
      />

      <FlatList
        data={motosFiltradas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.motoItem, { backgroundColor: tema.card, borderLeftColor:
            item.status === 'patio' ? '#10b981' :
            item.status === 'mecanica' ? '#ef4444' : '#f59e0b'
          }]} onPress={() => abrirModal(item)}>
            <Text style={[styles.motoTitulo, { color: tema.texto }]}>{item.placa || item.codigo} - {item.modelo}</Text>
            <Text style={[styles.motoSub, { color: temaEscuro ? '#d1d5db' : '#6b7280' }]}>Chassi: {item.chassi || 'N/A'}</Text>
          </TouchableOpacity>
        )}
        style={{flex: 1, width: '100%'}}
        contentContainerStyle={{paddingBottom: 120}}
      />

      <Modal visible={modalMoto} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: tema.card }]}>
            <Text style={[styles.modalTitulo, { color: tema.texto }]}>{motoSelecionada?.placa || motoSelecionada?.codigo} - {motoSelecionada?.modelo}</Text>
            {motoSelecionada?.descricao && <Text style={[styles.modalSub, { color: tema.texto }]}>{motoSelecionada.descricao}</Text>}
            <Text style={{ color: tema.texto }}>Status: {motoSelecionada?.status === 'patio' ? t.patio : motoSelecionada?.status === 'mecanica' ? t.mecanica : '📌 Pendente'}</Text>

            {motoSelecionada?.status === 'pingar' && (
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: tema.btnPrimary }]} onPress={() => pingarLocalizacao(motoSelecionada)}>
                <Text style={styles.btnText}>{t.posicionar}</Text>
              </TouchableOpacity>
            )}
            {motoSelecionada?.status === 'patio' && (
              <>
                <TouchableOpacity style={[styles.btnSecondary, { backgroundColor: tema.btnPrimary }]} onPress={() => pingarLocalizacao(motoSelecionada)}>
                  <Text style={styles.btnText}>{t.trocarLocalizacao}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnDanger, { backgroundColor: tema.btnDanger }]} onPress={() => enviarParaMecanica(motoSelecionada)}>
                  <Text style={styles.btnText}>{t.enviarMecanica}</Text>
                </TouchableOpacity>
              </>
            )}
            {motoSelecionada?.status === 'mecanica' && (
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: tema.btnPrimary }]} onPress={() => retornarParaPatio(motoSelecionada)}>
                <Text style={styles.btnText}>{t.retornarPatio}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.btnSecondary, { marginTop: 10, backgroundColor: tema.btnPrimary }]} onPress={() => setModalMoto(false)}>
              <Text style={styles.btnText}>{t.fechar}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 15, alignItems: 'center', paddingTop:50},
  btnCadastroTopo: { padding: 14, borderRadius: 12, width: '100%', maxWidth: 600, marginBottom: 15, borderWidth:1 },
  cardCadastro: {width: '100%', maxWidth: 600, marginBottom: 15},
  statusContainer: {flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 15},
  statusCard: {alignItems: 'center', borderRadius: 12, padding: 15, width: '45%'},
  statusTitulo: {fontSize: 16, fontWeight: 'bold'},
  statusNumero: {fontSize: 24, fontWeight: 'bold', marginTop: 5},
  searchInput: {width: '100%', maxWidth: 600, padding: 12, borderRadius: 12, marginBottom: 10, borderWidth:1},
  motoItem: {padding: 12, borderRadius: 12, marginBottom: 10, borderLeftWidth: 5},
  motoTitulo: {fontWeight: 'bold', fontSize: 15},
  motoSub: {fontSize: 13},
  modalContainer: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'},
  modalContent: {borderRadius: 16, padding: 20, width: '90%', maxWidth: 400},
  modalTitulo: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  modalSub: {fontSize: 14, marginBottom: 10},
  btnPrimary: { padding: 12, borderRadius: 10, marginTop: 10},
  btnSecondary: { padding: 12, borderRadius: 10, marginTop: 10},
  btnDanger: { padding: 12, borderRadius: 10, marginTop: 10},
  btnText: {color: '#fff', fontWeight: 'bold', textAlign: 'center'},
});
