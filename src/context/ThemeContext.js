import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [idioma, setIdioma] = useState('pt'); // pt, es, en

  useEffect(() => {
    (async () => {
      const temaSalvo = await AsyncStorage.getItem('@tema');
      if (temaSalvo) setTemaEscuro(temaSalvo === 'escuro');

      const idiomaSalvo = await AsyncStorage.getItem('@idioma');
      if (idiomaSalvo) setIdioma(idiomaSalvo);
    })();
  }, []);

  const toggleTema = async () => {
    const novoTema = !temaEscuro;
    setTemaEscuro(novoTema);
    await AsyncStorage.setItem('@tema', novoTema ? 'escuro' : 'claro');
  };

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
