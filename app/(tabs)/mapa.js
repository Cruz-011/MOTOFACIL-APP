// app/mapa.js - Tela de Mapa moderna com edição das motos
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, SafeAreaView, ScrollView, Modal, TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../src/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function Mapa() {
  const [patio, setPatio] = useState(null);
  const [motos, setMotos] = useState([]);
  const [motoSelecionada, setMotoSelecionada] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('@patio_selecionado').then((dado) => {
      if (dado) {
        const parsed = JSON.parse(dado);
        setPatio(parsed);
        gerarMotosExemplo(parsed);
      }
    });
  }, []);

  const gerarMotosExemplo = (p) => {
    const exemplo = [
      { id: 1, cor: 'verde', placa: 'ABC1234', modelo: 'Modelo A', zonaId: p.zonas[0]?.id },
      { id: 2, cor: 'azul', placa: 'DEF5678', modelo: 'Modelo B', zonaId: p.zonas[1]?.id },
      { id: 3, cor: 'vermelho', placa: 'GHI9012', modelo: 'Modelo C', zonaId: p.zonas[2]?.id },
    ];
    setMotos(exemplo);
  };

  const abrirModal = (moto) => setMotoSelecionada({ ...moto });

  const salvarEdicao = () => {
    setMotos((prev) =>
      prev.map((m) => (m.id === motoSelecionada.id ? motoSelecionada : m))
    );
    setMotoSelecionada(null);
  };

  const excluirMoto = () => {
    setMotos((prev) => prev.filter((m) => m.id !== motoSelecionada.id));
    setMotoSelecionada(null);
  };

  const mudarLocalAleatorio = () => {
    const zona = patio.zonas.find((z) => z.id === motoSelecionada.zonaId);
    if (zona) {
      const novaX = 20 + Math.random() * (zona.width - 40);
      const novaY = 40 + Math.random() * (zona.height - 60);
      setMotoSelecionada((prev) => ({ ...prev, deslocX: novaX, deslocY: novaY }));
    }
  };

  const contarPorCor = (cor) => motos.filter((m) => m.cor === cor).length;

  if (!patio) return <Text style={{ color: colors.text, padding: 20 }}>Carregando pátio...</Text>;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>{patio.nome}</Text>

        <View style={styles.resumoContainer}>
          <ResumoCard icon="speedometer" corIcon={colors.primary} titulo="Total" valor={motos.length} />
          <ResumoCard icon="ellipse" corIcon="green" titulo="Verdes" valor={contarPorCor('verde')} />
          <ResumoCard icon="ellipse" corIcon="blue" titulo="Azuis" valor={contarPorCor('azul')} />
          <ResumoCard icon="ellipse" corIcon="red" titulo="Vermelhas" valor={contarPorCor('vermelho')} />
        </View>

        <View style={styles.center}>
          <View style={[styles.patio, {
            width: patio.estrutura.width,
            height: patio.estrutura.height,
          }]}>
            {patio.zonas.map((zona) => (
              <View
                key={zona.id}
                style={[styles.zona, {
                  top: zona.y - patio.estrutura.y,
                  left: zona.x - patio.estrutura.x,
                  width: zona.width,
                  height: zona.height,
                }]}
              >
                <Text style={styles.zonaTexto}>{zona.nome}</Text>
                {motos.filter((m) => m.zonaId === zona.id).map((moto) => (
                  <TouchableOpacity
                    key={moto.id}
                    onPress={() => abrirModal(moto)}
                    style={[styles.moto, {
                      backgroundColor: moto.cor,
                      top: moto.deslocY || 40,
                      left: moto.deslocX || 20,
                    }]}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Modal de edição */}
        <Modal visible={!!motoSelecionada} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Moto</Text>

              <Text style={styles.label}>Placa:</Text>
              <TextInput
                style={styles.input}
                value={motoSelecionada?.placa}
                onChangeText={(t) => setMotoSelecionada((prev) => ({ ...prev, placa: t }))}
              />

              <Text style={styles.label}>Modelo:</Text>
              <TextInput
                style={styles.input}
                value={motoSelecionada?.modelo}
                onChangeText={(t) => setMotoSelecionada((prev) => ({ ...prev, modelo: t }))}
              />

              <Text style={styles.label}>Classificação:</Text>
              <Text style={[styles.classificacao, { color: motoSelecionada?.cor }]}>
                {motoSelecionada?.cor === 'verde' ? 'Reparo Leve' :
                 motoSelecionada?.cor === 'azul' ? 'Reparo Médio' : 'Reparo Complexo'}
              </Text>

              <TouchableOpacity style={styles.btn} onPress={mudarLocalAleatorio}>
                <Text style={styles.btnTexto}>Mudar Localização</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btn} onPress={salvarEdicao}>
                <Text style={styles.btnTexto}>Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, { backgroundColor: 'red' }]} onPress={excluirMoto}>
                <Text style={styles.btnTexto}>Excluir Moto</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.secondary }]} onPress={() => setMotoSelecionada(null)}>
                <Text style={styles.btnTexto}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

function ResumoCard({ icon, corIcon, titulo, valor }) {
  return (
    <View style={styles.cardResumo}>
      <Ionicons name={icon} size={24} color={corIcon} />
      <Text style={styles.cardValor}>{valor}</Text>
      <Text style={styles.cardTitulo}>{titulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 20 },
  resumoContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  cardResumo: {
    backgroundColor: colors.card,
    width: '48%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  cardValor: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginVertical: 4 },
  cardTitulo: { fontSize: 14, color: colors.secondary },
  center: { alignItems: 'center', justifyContent: 'center' },
  patio: {
    backgroundColor: '#f5f5f5',
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 10,
    position: 'relative',
  },
  zona: {
    position: 'absolute',
    backgroundColor: '#ddd',
    borderColor: colors.primary,
    borderWidth: 1,
    padding: 4,
    borderRadius: 6,
  },
  zonaTexto: { color: colors.text, fontSize: 12, textAlign: 'center', marginBottom: 4 },
  moto: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 10,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  label: { color: colors.primary, fontWeight: 'bold', marginBottom: 4 },
  classificacao: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  btn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnTexto: { color: colors.text, fontWeight: 'bold' },
});
