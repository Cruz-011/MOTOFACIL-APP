import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import colors from '../../src/theme/colors';
import ResumoMotos from '../../components/ResumoMotos';
import CadastroMotoAvancado from '../../components/CadastroMotoAvancado';

const dadosPatio = {
  total: 24,
  classificacao: { verde: 7, azul: 10, vermelha: 7 },
  categorias: { aluguel: 15, aquisicao: 9 },
};

export default function Motos() {
  const handleNovaMoto = (moto) => {
    console.log('🆕 Nova moto cadastrada:', moto);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ResumoMotos
        total={dadosPatio.total}
        classificacao={dadosPatio.classificacao}
        categorias={dadosPatio.categorias}
      />

      <CadastroMotoAvancado onRegistrarLocalizacao={handleNovaMoto} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingTop: 60,
  },
});
