// app/(tabs)/motos.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import colors from '../../src/theme/colors';

export default function CadastroMoto() {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro de Moto</Text>

      <TouchableOpacity style={styles.cameraBtn} onPress={abrirCamera}>
        <Text style={styles.cameraText}>📷 Tirar Foto</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Placa"
        placeholderTextColor={colors.secondary}
        value={placa}
        onChangeText={setPlaca}
      />
      <TextInput
        style={styles.input}
        placeholder="Modelo"
        placeholderTextColor={colors.secondary}
        value={modelo}
        onChangeText={setModelo}
      />
      <TextInput
        style={styles.input}
        placeholder="Classificação (verde, azul, vermelho)"
        placeholderTextColor={colors.secondary}
        value={cor}
        onChangeText={setCor}
      />

      <TouchableOpacity style={styles.btnSalvar} onPress={salvarMoto}>
        <Text style={styles.btnSalvarText}>Salvar Moto</Text>
      </TouchableOpacity>

      {/* Modal da câmera */}
      <Modal visible={cameraOpen} animationType="slide">
        <View style={{ flex: 1 }}>
          {!cameraReady ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
          ) : (
            <Camera.Camera
              style={{ flex: 1 }}
              type={Camera.CameraType.back}
              ref={cameraRef}
              onCameraReady={() => setCameraReady(true)}
            >
              <View style={styles.cameraOverlay}>
                <TouchableOpacity style={styles.capturarBtn} onPress={capturarFoto}>
                  <Text style={styles.cameraText}>📸 Capturar</Text>
                </TouchableOpacity>
              </View>
            </Camera.Camera>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20,paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  cameraBtn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraText: { color: colors.text, fontSize: 16 },
  btnSalvar: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  btnSalvarText: { color: colors.text, fontWeight: 'bold', fontSize: 16 },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 30,
  },
  capturarBtn: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 50,
  },
});
