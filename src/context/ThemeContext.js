// contexts/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme(); // 'light' ou 'dark'
  const [temaEscuro, setTemaEscuro] = useState(systemColorScheme === 'dark');
  const [idioma, setIdioma] = useState('pt'); // pt, es, en

  useEffect(() => {
    (async () => {
      // Verifica se o usuário já salvou um tema no AsyncStorage
      const temaSalvo = await AsyncStorage.getItem('@tema');
      if (temaSalvo) {
        setTemaEscuro(temaSalvo === 'escuro'); // sobrescreve o tema do sistema
      }

      // Verifica idioma salvo
      const idiomaSalvo = await AsyncStorage.getItem('@idioma');
      if (idiomaSalvo) setIdioma(idiomaSalvo);
    })();
  }, [systemColorScheme]);

  // Alterna tema manualmente
  const toggleTema = async () => {
    const novoTema = !temaEscuro;
    setTemaEscuro(novoTema);
    await AsyncStorage.setItem('@tema', novoTema ? 'escuro' : 'claro');
  };

  // Muda idioma
  const mudarIdioma = async (novoIdioma) => {
    setIdioma(novoIdioma);
    await AsyncStorage.setItem('@idioma', novoIdioma);
  };

  return (
    <ThemeContext.Provider value={{ temaEscuro, toggleTema, idioma, mudarIdioma }}>
      {children}
    </ThemeContext.Provider>
  );
};
