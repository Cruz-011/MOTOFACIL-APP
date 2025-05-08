import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import colors from '../src/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const screen = Dimensions.get('window');

export default function PatioConfig() {
  const router = useRouter();
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

    const novoPatio = {
      id: Date.now(),
      nome: nomePatio,
      estrutura: patio,
      zonas,
    };

    const salvos = await AsyncStorage.getItem('@lista_patios');
    const lista = salvos ? JSON.parse(salvos) : [];
    lista.push(novoPatio);

    await AsyncStorage.setItem('@lista_patios', JSON.stringify(lista));
    await AsyncStorage.setItem('@patio_selecionado', JSON.stringify(novoPatio));

    router.replace('/selecao-patio');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurar Pátio</Text>

      <TextInput
        placeholder="Nome do Pátio"
        placeholderTextColor={colors.secondary}
        style={styles.input}
        value={nomePatio}
        onChangeText={setNomePatio}
      />

      <View style={styles.canvas}>
        <ResizableBox
          box={patio}
          setBox={setPatio}
          editable={false}
          label="Pátio"
        />

        {zonas.map((zona) => (
          <ResizableBox
            key={zona.id}
            box={zona}
            setBox={(newZona) => {
              setZonas((prev) =>
                prev.map((z) => (z.id === zona.id ? newZona : z))
              );
            }}
            editable={true}
            label={zona.nome}
            onNameChange={(nome) => {
              setZonas((prev) =>
                prev.map((z) => (z.id === zona.id ? { ...z, nome } : z))
              );
            }}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.btn} onPress={adicionarZona}>
        <Text style={styles.btnText}>+ Adicionar Zona</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={salvar}>
        <Text style={styles.btnText}>Salvar Pátio</Text>
      </TouchableOpacity>
    </View>
  );
}

function ResizableBox({ box, setBox, editable = false, label, onNameChange }) {
  const [localBox, setLocalBox] = useState(box);
  const [nomeZona, setNomeZona] = useState(label);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        setLocalBox((prev) => ({
          ...prev,
          x: box.x + gesture.dx,
          y: box.y + gesture.dy,
        }));
      },
      onPanResponderRelease: (_, gesture) => {
        const updated = {
          ...box,
          x: box.x + gesture.dx,
          y: box.y + gesture.dy,
        };
        setLocalBox(updated);
        setBox(updated);
      },
    })
  ).current;

  const resizeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        setLocalBox((prev) => ({
          ...prev,
          width: Math.max(50, box.width + gesture.dx),
          height: Math.max(50, box.height + gesture.dy),
        }));
      },
      onPanResponderRelease: (_, gesture) => {
        const updated = {
          ...box,
          width: Math.max(50, box.width + gesture.dx),
          height: Math.max(50, box.height + gesture.dy),
        };
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
        {
          top: localBox.y,
          left: localBox.x,
          width: localBox.width,
          height: localBox.height,
        },
      ]}
    >
      {editable ? (
        <TextInput
          style={styles.zonaTextInput}
          value={nomeZona}
          onChangeText={(text) => {
            setNomeZona(text);
            onNameChange(text);
          }}
        />
      ) : (
        <Text style={styles.labelText}>{nomeZona}</Text>
      )}

      <View {...resizeResponder.panHandlers} style={styles.resizeHandle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    paddingTop: 70 
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  canvas: {
    flex: 1,
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: colors.card,
    position: 'relative',
  },
  btn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  btnText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  box: {
    position: 'absolute',
    backgroundColor: '#007bff33',
    borderColor: colors.primary,
    borderWidth: 1,
    padding: 4,
  },
  labelText: {
    color: colors.text,
    fontSize: 12,
    marginBottom: 4,
  },
  zonaTextInput: {
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: 12,
    padding: 4,
    borderRadius: 4,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  resizeHandle: {
    width: 20,
    height: 20,
    backgroundColor: colors.primary,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderTopLeftRadius: 4,
  },
});
