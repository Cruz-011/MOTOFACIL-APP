import React, { useState, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  PanResponder,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ThemeContext } from '../src/context/ThemeContext';

export default function PatioConfig() {
  const router = useRouter();
  const { temaEscuro } = useContext(ThemeContext);

  const tema = temaEscuro
    ? { fundo: '#1f2937', texto: '#fff', card: '#374151', primary: '#3b82f6', secundario: '#9ca3af' }
    : { fundo: '#f5f5f5', texto: '#000', card: '#fff', primary: '#3b82f6', secundario: '#6b7280' };

  const [nomePatio, setNomePatio] = useState('');
  const [patio, setPatio] = useState({ x: 50, y: 50, width: 200, height: 200 });
  const [zonas, setZonas] = useState([]);

  const adicionarZona = () => {
    setZonas((prev) => [
      ...prev,
      {
        id: Date.now(),
        nome: `Zona ${prev.length + 1}`,
        x: patio.x + 20,
        y: patio.y + 20,
        width: 100,
        height: 100,
      },
    ]);
  };

  const salvar = async () => {
    if (!nomePatio.trim()) return Alert.alert('Erro', 'Digite o nome do pátio');

    const novoPatio = { id: Date.now(), nome: nomePatio, estrutura: patio, zonas };
    const salvos = await AsyncStorage.getItem('@lista_patios');
    const lista = salvos ? JSON.parse(salvos) : [];
    lista.push(novoPatio);

    await AsyncStorage.setItem('@lista_patios', JSON.stringify(lista));
    await AsyncStorage.setItem('@patio_selecionado', JSON.stringify(novoPatio));

    router.replace('/selecao-patio');
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.fundo }]}>
      <Text style={[styles.title, { color: tema.primary }]}>Configurar Pátio</Text>

      <TextInput
        placeholder="Nome do Pátio"
        placeholderTextColor={tema.secundario}
        style={[styles.input, { backgroundColor: tema.card, color: tema.texto, borderColor: tema.primary }]}
        value={nomePatio}
        onChangeText={setNomePatio}
      />

      <View style={[styles.canvas, { borderColor: tema.primary, backgroundColor: tema.card }]}>
        <ResizableBox box={patio} setBox={setPatio} editable={false} label="Pátio" tema={tema} />
        {zonas.map((zona) => (
          <ResizableBox
            key={zona.id}
            box={zona}
            setBox={(newZona) => setZonas((prev) => prev.map((z) => (z.id === zona.id ? newZona : z)))}
            editable={true}
            label={zona.nome}
            onNameChange={(nome) => setZonas((prev) => prev.map((z) => (z.id === zona.id ? { ...z, nome } : z)))}
            tema={tema}
          />
        ))}
      </View>

      <TouchableOpacity style={[styles.btn, { backgroundColor: tema.primary }]} onPress={adicionarZona}>
        <Text style={[styles.btnText, { color: tema.texto }]}>+ Adicionar Zona</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, { backgroundColor: tema.primary }]} onPress={salvar}>
        <Text style={[styles.btnText, { color: tema.texto }]}>Salvar Pátio</Text>
      </TouchableOpacity>
    </View>
  );
}

function ResizableBox({ box, setBox, editable = false, label, onNameChange, tema }) {
  const [localBox, setLocalBox] = useState(box);
  const [nomeZona, setNomeZona] = useState(label);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => setLocalBox((prev) => ({ ...prev, x: box.x + gesture.dx, y: box.y + gesture.dy })),
      onPanResponderRelease: (_, gesture) => {
        const updated = { ...box, x: box.x + gesture.dx, y: box.y + gesture.dy };
        setLocalBox(updated);
        setBox(updated);
      },
    })
  ).current;

  const resizeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) =>
        setLocalBox((prev) => ({ ...prev, width: Math.max(50, box.width + gesture.dx), height: Math.max(50, box.height + gesture.dy) })),
      onPanResponderRelease: (_, gesture) => {
        const updated = { ...box, width: Math.max(50, box.width + gesture.dx), height: Math.max(50, box.height + gesture.dy) };
        setLocalBox(updated);
        setBox(updated);
      },
    })
  ).current;

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.box,
        { top: localBox.y, left: localBox.x, width: localBox.width, height: localBox.height, backgroundColor: `${tema.primary}33`, borderColor: tema.primary },
      ]}
    >
      {editable ? (
        <TextInput
          style={[styles.zonaTextInput, { backgroundColor: tema.card, color: tema.texto, borderColor: tema.primary }]}
          value={nomeZona}
          onChangeText={(text) => {
            setNomeZona(text);
            onNameChange(text);
          }}
        />
      ) : (
        <Text style={[styles.labelText, { color: tema.texto }]}>{nomeZona}</Text>
      )}
      <View {...resizeResponder.panHandlers} style={[styles.resizeHandle, { backgroundColor: tema.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 70 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16, borderWidth: 1 },
  canvas: { flex: 1, borderWidth: 2, borderRadius: 10, marginBottom: 12, position: 'relative' },
  btn: { padding: 12, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  btnText: { fontWeight: 'bold' },
  box: { position: 'absolute', borderWidth: 1, padding: 4 },
  labelText: { fontSize: 12, marginBottom: 4 },
  zonaTextInput: { fontSize: 12, padding: 4, borderRadius: 4, borderWidth: 1 },
  resizeHandle: { width: 20, height: 20, position: 'absolute', bottom: 0, right: 0, borderTopLeftRadius: 4 },
});
