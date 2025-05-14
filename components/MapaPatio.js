import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import colors from '../src/theme/colors';

const larguraPatio = 300;
const alturaPatio = 300;

export default function MapaPatio({ motoSelecionada }) {
  const [posicaoUsuario, setPosicaoUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const xMoto = motoSelecionada?.x ?? 0.4;
  const yMoto = motoSelecionada?.y ?? 0.7;

  const leftMoto = xMoto * larguraPatio;
  const topMoto = yMoto * alturaPatio;

  // Simula posição do usuário como (0.1, 0.9) se não tiver GPS
  const leftUser = posicaoUsuario?.x ? posicaoUsuario.x * larguraPatio : 0.1 * larguraPatio;
  const topUser = posicaoUsuario?.y ? posicaoUsuario.y * alturaPatio : 0.9 * alturaPatio;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permissão de localização negada');
        setCarregando(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      // Você pode adaptar aqui para converter GPS real em proporção dentro do pátio
      // Aqui vamos apenas simular uma posição relativa
      setPosicaoUsuario({ x: 0.1, y: 0.9 }); // EXEMPLO fixo
      setCarregando(false);
    })();
  }, []);

  return (
    <View>
      <Text style={styles.titulo}>📍 Mapa do Pátio</Text>

      <View style={styles.legenda}>
        <Text style={styles.legendaItem}>🔴 Moto Localizada</Text>
        <Text style={styles.legendaItem}>🔵 Sua Posição</Text>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.mapa}>
          {/* Posição da MOTO */}
          <View style={[styles.ponto, styles.moto, { left: leftMoto, top: topMoto }]}>
            <Text style={styles.icone}>🏍️</Text>
          </View>

          {/* Posição do USUÁRIO */}
          <View style={[styles.ponto, styles.usuario, { left: leftUser, top: topUser }]}>
            <Text style={styles.icone}>🧍</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  legenda: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 10,
  },
  legendaItem: {
    fontSize: 14,
    color: colors.text,
  },
  mapa: {
    width: larguraPatio,
    height: alturaPatio,
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: colors.primary,
    alignSelf: 'center',
    position: 'relative',
    borderRadius: 12,
  },
  ponto: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moto: {
    backgroundColor: 'red',
  },
  usuario: {
    backgroundColor: 'blue',
  },
  icone: {
    color: 'white',
    fontSize: 16,
  },
});
