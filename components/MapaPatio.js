import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import colors from '../src/theme/colors';

const larguraPatio = 300;
const alturaPatio = 300;

// Simula posição da moto entre 0 e 1
const moto = {
  placa: 'ABC1234',
  x: 0.4,
  y: 0.7,
};

export default function MapaPatio() {
  const left = moto.x * larguraPatio;
  const top = moto.y * alturaPatio;

  return (
    <View>
      <Text style={styles.titulo}>Mapa do Pátio</Text>

      <View style={styles.mapa}>
        <View style={[styles.ponto, { left, top }]}>
          <Text style={styles.icone}>📍</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
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
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icone: {
    color: 'white',
    fontSize: 18,
  },
});
