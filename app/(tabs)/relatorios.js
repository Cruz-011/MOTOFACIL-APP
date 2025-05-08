import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../src/theme/colors';

export default function Relatorios() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Relatórios</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.text,
    fontSize: 18,
  },
});
