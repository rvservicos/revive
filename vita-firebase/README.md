# VITA - Sistema Modernizado com Firebase

Sistema modernizado da página VITA com painel administrativo para gerenciar links e categorias dinamicamente usando Firebase.

## 🚀 Funcionalidades

- ✅ Página principal moderna e responsiva
- ✅ Design otimizado para mobile
- ✅ Painel administrativo completo
- ✅ Gerenciamento de categorias
- ✅ Gerenciamento de links
- ✅ Banco de dados em tempo real (Firebase Firestore)
- ✅ Hospedagem gratuita (Firebase Hosting)
- ✅ Importação automática dos dados existentes

## 📋 Pré-requisitos

- Node.js instalado (versão 14 ou superior)
- Conta no Google (para Firebase)
- Git instalado

## 🔧 Instalação e Configuração

### 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nomeie seu projeto (ex: "vita-links")
4. Desabilite o Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2. Configurar Firestore Database

1. No menu lateral, vá em "Build" → "Firestore Database"
2. Clique em "Criar banco de dados"
3. Selecione "Modo de produção"
4. Escolha a localização (recomendado: southamerica-east1 - São Paulo)
5. Clique em "Ativar"

### 3. Configurar Firebase Hosting

1. No menu lateral, vá em "Build" → "Hosting"
2. Clique em "Começar"
3. Siga as instruções (as próximas etapas explicam detalhadamente)

### 4. Obter Credenciais do Firebase

1. No menu lateral, clique no ícone de engrenagem ⚙️ → "Configurações do projeto"
2. Role até "Seus aplicativos"
3. Clique no ícone de web `</>`
4. Registre seu app (ex: "VITA Web")
5. Copie o objeto `firebaseConfig` que aparecerá

### 5. Configurar o Projeto Localmente

1. Clone ou baixe este repositório
2. Instale o Firebase CLI:
```bash
npm install -g firebase-tools
```

3. Faça login no Firebase:
```bash
firebase login
```

4. Inicialize o projeto Firebase:
```bash
cd vita-firebase
firebase init
```

Selecione:
- [x] Firestore
- [x] Hosting

Configure conforme abaixo:
- **Firestore**: Use os arquivos existentes (firestore.rules, firestore.indexes.json)
- **Hosting**:
  - Public directory: `public`
  - Configure as single-page app: **No**
  - Set up automatic builds: **No**
  - Não sobrescrever index.html

5. Edite os arquivos JavaScript e adicione suas credenciais Firebase:

**Arquivo: `public/js/app.js`**
```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "seu-app-id"
};
```

**Arquivo: `public/js/admin.js`** (mesma configuração)

### 6. Deploy

```bash
firebase deploy
```

Após o deploy, você receberá 2 URLs:
- **Site público**: `https://seu-projeto.web.app`
- **Firestore**: configurado e funcionando

## 📱 Como Usar

### Primeira vez - Importar Dados

1. Acesse: `https://seu-projeto.web.app/admin.html`
2. Clique no botão "📥 Importar Dados Iniciais"
3. Confirme a importação
4. Todos os links da página original serão importados!

### Painel Administrativo

Acesse: `https://seu-projeto.web.app/admin.html`

**Gerenciar Categorias:**
- Adicionar nova categoria (nome, ícone emoji, ordem)
- Editar categoria existente
- Excluir categoria (remove todos os links associados)

**Gerenciar Links:**
- Adicionar novo link (título, URL, ícone, categoria, estilo, ordem)
- Editar link existente
- Excluir link
- Organizar por ordem numérica

**Estilos de Botão:**
- `Padrão`: Branco com borda
- `Primary`: Gradiente roxo
- `Success`: Gradiente verde
- `Warning`: Gradiente laranja

### Página Pública

Acesse: `https://seu-projeto.web.app`

A página carrega automaticamente todos os links e categorias do Firestore.

## 🎨 Personalização

### Alterar Cores

Edite o arquivo `public/css/style.css` e modifique as variáveis CSS:

```css
:root {
    --primary: #6366f1;      /* Cor principal */
    --secondary: #8b5cf6;    /* Cor secundária */
    --success: #10b981;      /* Verde */
    --warning: #f59e0b;      /* Laranja */
    /* ... */
}
```

### Alterar Logo

Substitua a URL do logo em `public/index.html`:
```html
<img src="SUA_URL_DO_LOGO" alt="VITA Logo">
```

## 🔒 Segurança (Opcional)

### Proteger o Painel Admin

Para proteger o acesso ao painel administrativo, adicione Firebase Authentication:

1. No Firebase Console → "Build" → "Authentication"
2. Clique em "Começar"
3. Ative o método "E-mail/senha"
4. Adicione usuários autorizados

5. Adicione ao código (exemplo básico):

```javascript
// No início de admin.js
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // Redirecionar para login
        window.location.href = 'login.html';
    }
});
```

## 📁 Estrutura do Projeto

```
vita-firebase/
├── public/
│   ├── index.html          # Página principal
│   ├── admin.html          # Painel administrativo
│   ├── css/
│   │   └── style.css       # Estilos
│   └── js/
│       ├── app.js          # Lógica da página principal
│       └── admin.js        # Lógica do admin
├── firebase.json           # Configuração do Firebase
├── firestore.rules         # Regras de segurança do Firestore
├── firestore.indexes.json  # Índices do Firestore
└── README.md              # Este arquivo
```

## 🗄️ Estrutura do Banco de Dados

### Collection: `categories`
```javascript
{
  name: "Nome da Categoria",
  icon: "📁",
  order: 1
}
```

### Collection: `links`
```javascript
{
  categoryId: "cat1",
  title: "Nome do Link",
  url: "https://exemplo.com",
  icon: "🔗",
  style: "primary", // ou "success", "warning", ""
  order: 1
}
```

## 🔄 Atualizar o Site

Sempre que fizer alterações:

```bash
firebase deploy
```

Para atualizar apenas o Firestore:
```bash
firebase deploy --only firestore
```

Para atualizar apenas o Hosting:
```bash
firebase deploy --only hosting
```

## 🆘 Solução de Problemas

**Erro ao carregar dados:**
- Verifique se configurou corretamente as credenciais do Firebase em `app.js` e `admin.js`
- Verifique se o Firestore está ativado no Firebase Console
- Verifique as regras de segurança do Firestore

**Links não aparecem:**
- Certifique-se de importar os dados no painel admin
- Verifique o console do navegador (F12) para erros

**Página não carrega após deploy:**
- Aguarde alguns minutos (pode levar até 10 min para propagar)
- Limpe o cache do navegador (Ctrl+Shift+Delete)

## 📊 Custos

Firebase oferece um plano gratuito (Spark) que inclui:
- ✅ Firestore: 1GB de armazenamento
- ✅ Hosting: 10GB de transferência/mês
- ✅ Firestore: 50k leituras/dia

Para o uso previsto deste projeto, o plano gratuito é mais que suficiente!

## 🎯 Próximos Passos

Sugestões de melhorias:
- [ ] Adicionar autenticação ao painel admin
- [ ] Implementar drag-and-drop para reordenar items
- [ ] Adicionar analytics para rastrear cliques nos links
- [ ] Implementar busca/filtro de links
- [ ] Adicionar modo escuro
- [ ] Backup automático dos dados

## 📝 Licença

Este projeto foi desenvolvido para uso interno.

## 💬 Suporte

Para dúvidas ou problemas:
1. Verifique a seção "Solução de Problemas"
2. Consulte a [documentação do Firebase](https://firebase.google.com/docs)
3. Verifique o console do navegador para mensagens de erro

---

Desenvolvido com ❤️ para facilitar o gerenciamento de links do VITA
