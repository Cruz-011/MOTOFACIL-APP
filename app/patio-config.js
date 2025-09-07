import React, { useState, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  PanResponder,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ThemeContext } from "../src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function PatioConfig() {
  const router = useRouter();
  const { temaEscuro } = useContext(ThemeContext);

  const tema = temaEscuro
    ? {
        fundo: "#1f2937",
        texto: "#fff",
        card: "#1f2937",
        primary: "#3b82f6",
        secundario: "#9ca3af",
      }
    : {
        fundo: "#f9fafb",
        texto: "#111827",
        card: "#fff",
        primary: "#2563eb",
        secundario: "#6b7280",
      };

  const [nomePatio, setNomePatio] = useState("");
  const [patio, setPatio] = useState({ x: 50, y: 50, width: 220, height: 200 });
  const [zonas, setZonas] = useState([]);

  const adicionarZona = () => {
    setZonas((prev) => [
      ...prev,
      {
        id: Date.now(),
        nome: `Zona ${prev.length + 1}`,
        x: patio.x + 30,
        y: patio.y + 30,
        width: 100,
        height: 100,
      },
    ]);
  };

  const salvar = async () => {
    // Aqui você pode integrar com backend Java futuramente
    if (!nomePatio.trim())
      return Alert.alert("Erro", "Digite o nome do pátio");

    const novoPatio = { id: Date.now(), nome: nomePatio, estrutura: patio, zonas };
    const salvos = await AsyncStorage.getItem("@lista_patios");
    const lista = salvos ? JSON.parse(salvos) : [];
    lista.push(novoPatio);

    await AsyncStorage.setItem("@lista_patios", JSON.stringify(lista));
    await AsyncStorage.setItem("@patio_selecionado", JSON.stringify(novoPatio));

    router.replace("/selecao-patio");
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.fundo }]}>
      <Text style={[styles.title, { color: tema.primary }]}>
        ⚙️ Configurar Pátio
      </Text>

      <TextInput
        placeholder="Digite o nome do pátio..."
        placeholderTextColor={tema.secundario}
        style={[
          styles.input,
          { backgroundColor: tema.card, color: tema.texto, borderColor: tema.primary },
        ]}
        value={nomePatio}
        onChangeText={setNomePatio}
      />

      <View
        style={[
          styles.canvas,
          { borderColor: tema.primary, backgroundColor: tema.card },
        ]}
      >
        <Text style={[styles.canvasTitle, { color: tema.primary }]}>🅿️ Pátio</Text>
        <ResizableBox box={patio} setBox={setPatio} editable={false} label="Pátio" tema={tema} />

        {zonas.map((zona) => (
          <ResizableBox
            key={zona.id}
            box={zona}
            setBox={(newZona) =>
              setZonas((prev) =>
                prev.map((z) => (z.id === zona.id ? newZona : z))
              )
            }
            editable={true}
            label={zona.nome}
            onNameChange={(nome) =>
              setZonas((prev) =>
                prev.map((z) => (z.id === zona.id ? { ...z, nome } : z))
              )
            }
            tema={tema}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: tema.primary }]}
        onPress={adicionarZona}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={[styles.btnText, { color: "#fff" }]}>Adicionar Zona</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#10b981" }]}
        onPress={salvar}
      >
        <Ionicons name="save-outline" size={20} color="#fff" />
        <Text style={[styles.btnText, { color: "#fff" }]}>Salvar Pátio</Text>
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
      onPanResponderMove: (_, g) =>
        setLocalBox((prev) => ({ ...prev, x: box.x + g.dx, y: box.y + g.dy })),
      onPanResponderRelease: (_, g) => {
        const updated = { ...box, x: box.x + g.dx, y: box.y + g.dy };
        setLocalBox(updated);
        setBox(updated);
      },
    })
  ).current;

  const resizeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) =>
        setLocalBox((prev) => ({
          ...prev,
          width: Math.max(60, box.width + g.dx),
          height: Math.max(60, box.height + g.dy),
        })),
      onPanResponderRelease: (_, g) => {
        const updated = {
          ...box,
          width: Math.max(60, box.width + g.dx),
          height: Math.max(60, box.height + g.dy),
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
          backgroundColor: `${tema.primary}22`,
          borderColor: tema.primary,
        },
      ]}
    >
      {editable ? (
        <TextInput
          style={[
            styles.zonaTextInput,
            { backgroundColor: tema.card, color: tema.texto, borderColor: tema.primary },
          ]}
          value={nomeZona}
          onChangeText={(text) => {
            setNomeZona(text);
            onNameChange(text);
          }}
        />
      ) : (
        <Text style={[styles.labelText, { color: tema.texto }]}>{nomeZona}</Text>
      )}

      <View
        {...resizeResponder.panHandlers}
        style={[styles.resizeHandle, { backgroundColor: tema.primary }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 15, textAlign: "center" },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
    borderWidth: 1.5,
    fontSize: 15,
  },
  canvas: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 16,
    position: "relative",
    padding: 6,
  },
  canvasTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    gap: 8,
    elevation: 2,
  },
  btnText: { fontWeight: "600", fontSize: 15 },
  box: {
    position: "absolute",
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  labelText: { fontSize: 13, fontWeight: "600" },
  zonaTextInput: {
    fontSize: 13,
    padding: 4,
    borderRadius: 6,
    borderWidth: 1,
    width: "90%",
    textAlign: "center",
  },
  resizeHandle: {
    width: 20,
    height: 20,
    position: "absolute",
    bottom: -2,
    right: -2,
    borderTopLeftRadius: 6,
  },
});
