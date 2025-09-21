const API_URL = "http://192.168.0.10:8080/api"; // ajuste para seu IP local

const fazerLogin = async () => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: usuario, senha }),
    });

    if (response.ok) {
      const data = await response.json();

      // Salva o token
      await AsyncStorage.setItem("@token_usuario", data.token);

      // Salva usuário logado também
      await AsyncStorage.setItem("@usuario_logado", JSON.stringify({ usuario, lang: idioma }));

      router.replace("/selecao-patio");
    } else {
      Alert.alert("Erro", currentTexts.error);
    }
  } catch (error) {
    console.error(error);
    Alert.alert("Erro", "Não foi possível conectar ao servidor");
  }
};
