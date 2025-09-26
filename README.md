# 🏍️ MotoFácil - Guia Completo Frontend & Backend

Este guia cobre o processo de instalação, configuração e execução do MotoFácil, incluindo backend (Java/Spring Boot) e frontend (React).

## 1️⃣ Pré-requisitos

- **Node.js 18+** e **npm** ou **yarn**
- **Java 17+** e **Maven**
- **Git**
- **Postman** (opcional, para testar a API)
- Verifique se as portas 8080 (backend) e 3000 (frontend) estão livres.

## 2️⃣ Clonando o Backend

```bash
git clone https://github.com/Cruz-011/motofacil-java.git
cd motofacil-java
```

## 3️⃣ Executando o Backend

No diretório `motofacil-backend`:

- **Linux/Mac:**
  ```bash
  ./mvnw spring-boot:run
  ```
- **Windows:**
  ```bash
  mvnw.cmd spring-boot:run
  ```

O backend estará disponível em: [http://localhost:8080](http://localhost:8080)

> Se precisar alterar a porta, edite `src/main/resources/application.properties`.

## 4️⃣ Clonando o Frontend

Em outro terminal:

```bash
git clone https://github.com/Cruz-011/MOTOFACIL-APP.git
cd MOTOFACIL-APP
```

## 5️⃣ Configurando a URL da API no Frontend

Edite o arquivo:

```
src/config/api.js
```

Altere a linha:

```js
export const API_URL = "http://localhost:8080/api"; // Endereço do backend
```

Se o backend estiver em outro IP, ajuste aqui.

## 6️⃣ Instalando Dependências do Frontend

No diretório `motofacil-frontend`:

```bash
npm install
# ou
yarn
```

## 7️⃣ Executando o Frontend

Ainda em `motofacil-frontend`:

```bash
npm expo start
# ou
yarn expo start
```

O frontend abrirá em: [http://localhost:3000](http://localhost:3000)

## 8️⃣ Estrutura do Frontend

```
motofacil-frontend/
├─ app/
│  ├─ components/      # Componentes reutilizáveis
│  ├─ (tabs)/          # Telas (Motos, Pátios, Login)
│  ├─ App.js           # Arquivo principal
│  ├─ index.js         # Entrada da aplicação
|  └─ src/
|      └─config/api.js    # Configuração da URL da API

├─ package.json        # Dependências e scripts
```

## 9️⃣ Testando Endpoints com Postman

- **Listar todas as motos**
  ```
  GET http://localhost:8080/api/motos
  ```

- **Buscar moto por ID**
  ```
  GET http://localhost:8080/api/motos/{id}
  ```

- **Criar nova moto**
  ```
  POST http://localhost:8080/api/motos
  Body (JSON):
  {
    "placa": "ABC1234",
    "modelo": "Mottu Sport",
    "patio": { "id": 1 }
  }
  ```

- **Atualizar localização de uma moto**
  ```
  PUT http://localhost:8080/api/motos/1/location
  Body (JSON):
  {
    "x": 2.5,
    "y": 3.0,
    "patioId": 1,
    "tag": "patio"
  }
  ```

## 🔟 Observações Importantes

- Sempre inicie o backend antes do frontend.
- Alterações em `API_URL` exigem reinício do frontend.
- Problemas de CORS devem ser resolvidos no backend (permitindo `http://localhost:3000`).

---
