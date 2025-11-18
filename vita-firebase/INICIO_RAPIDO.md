# 🚀 Guia de Início Rápido - VITA Firebase

## Passos Essenciais (10 minutos)

### 1️⃣ Criar Projeto Firebase (3 min)

1. Acesse: https://console.firebase.google.com/
2. Clique em **"Adicionar projeto"**
3. Nome: `vita-links` (ou outro de sua preferência)
4. Clique em **"Criar projeto"**

### 2️⃣ Ativar Firestore (2 min)

1. No menu lateral: **Firestore Database**
2. Clique em **"Criar banco de dados"**
3. Modo: **Produção**
4. **⚠️ IMPORTANTE - Localização:**
   - Escolha: **southamerica-east1** (São Paulo) 🇧🇷
   - **NÃO escolha** regiões dos EUA (us-central1, us-east1, etc.)
   - Esta escolha **NÃO pode ser alterada depois!**
   - Ver detalhes em: `REGIAO_FIREBASE.txt`
5. Clique em **"Ativar"**

### 3️⃣ Obter Credenciais (1 min)

1. Clique no ícone ⚙️ → **"Configurações do projeto"**
2. Role até **"Seus aplicativos"**
3. Clique no ícone `</>` (Web)
4. Nome do app: `VITA`
5. **COPIE** o objeto `firebaseConfig` que aparecer

Exemplo do que você vai copiar:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "vita-links.firebaseapp.com",
  projectId: "vita-links",
  storageBucket: "vita-links.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

### 4️⃣ Configurar Projeto Local (2 min)

```bash
# Instalar Firebase CLI (só precisa fazer 1 vez)
npm install -g firebase-tools

# Entrar na pasta do projeto
cd vita-firebase

# Login no Firebase
firebase login

# Inicializar projeto
firebase init
```

Quando perguntar:
- **Quais recursos?** Selecione `Firestore` e `Hosting` (use espaço para marcar)
- **Projeto existente?** Escolha o projeto que você criou
- **Firestore rules?** Aperte ENTER (usar firestore.rules)
- **Firestore indexes?** Aperte ENTER (usar firestore.indexes.json)
- **Public directory?** Digite `public`
- **Single-page app?** Digite `n` (não)
- **Sobrescrever index.html?** Digite `n` (não)

### 5️⃣ Adicionar Credenciais nos Arquivos (1 min)

Edite **2 arquivos** e cole suas credenciais do Firebase:

**Arquivo 1:** `public/js/app.js`
- Procure por `const firebaseConfig = {`
- Substitua pelos seus dados

**Arquivo 2:** `public/js/admin.js`
- Procure por `const firebaseConfig = {`
- Substitua pelos seus dados (mesmo conteúdo)

Também edite:

**Arquivo 3:** `.firebaserc`
```json
{
  "projects": {
    "default": "SEU_PROJECT_ID_AQUI"
  }
}
```

### 6️⃣ Deploy! (1 min)

```bash
firebase deploy
```

Aguarde a mensagem:
```
✔  Deploy complete!

Hosting URL: https://seu-projeto.web.app
```

### 7️⃣ Importar Dados Existentes (30 seg)

1. Acesse: `https://seu-projeto.web.app/admin.html`
2. Clique em **"📥 Importar Dados Iniciais"**
3. Confirme
4. Pronto! ✅

### 8️⃣ Visualizar Site (10 seg)

Acesse: `https://seu-projeto.web.app`

---

## ✅ Checklist Rápido

- [ ] Criei projeto no Firebase Console
- [ ] Ativei Firestore Database
- [ ] Copiei as credenciais (firebaseConfig)
- [ ] Instalei Firebase CLI (`npm install -g firebase-tools`)
- [ ] Fiz login (`firebase login`)
- [ ] Inicializei o projeto (`firebase init`)
- [ ] Colei credenciais em `public/js/app.js`
- [ ] Colei credenciais em `public/js/admin.js`
- [ ] Editei `.firebaserc` com meu project ID
- [ ] Fiz deploy (`firebase deploy`)
- [ ] Importei dados no painel admin
- [ ] Testei o site funcionando

---

## 🎯 URLs Importantes

Após o deploy, salve estas URLs:

- **Site Principal:** `https://seu-projeto.web.app`
- **Painel Admin:** `https://seu-projeto.web.app/admin.html`
- **Firebase Console:** `https://console.firebase.google.com/project/seu-projeto`

---

## 🆘 Problemas Comuns

**"Erro ao carregar dados"**
- Verifique se colou as credenciais corretamente nos 2 arquivos JS

**"firebase: command not found"**
- Instale o Firebase CLI: `npm install -g firebase-tools`

**"Não consigo fazer deploy"**
- Verifique se está dentro da pasta `vita-firebase`
- Execute: `firebase login` novamente

**"Página em branco"**
- Aguarde 5-10 minutos após o deploy
- Limpe o cache do navegador (Ctrl + Shift + Delete)

---

## 📞 Precisa de Ajuda?

Consulte o arquivo `README.md` para documentação completa!
