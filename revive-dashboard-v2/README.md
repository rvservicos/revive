# ReVive Dashboard v2

## 🚀 Dashboard Moderno e Personalizável para Gestão de Processos

Versão completamente reformulada do dashboard ReVive com arquitetura modular, Firebase e painel administrativo completo.

---

## 📋 Características Principais

### ✨ Funcionalidades do Dashboard
- **Rankings Dinâmicos** - Consultores de SC e Ceará em tempo real
- **Métricas de Performance** - Total de processos, médias diárias, metas
- **Gráficos Interativos** - Evolução mensal com Chart.js
- **Carrossel Automático** - Múltiplas visualizações com navegação
- **Notificações Animadas** - Alertas de vendas, pagamentos e acordos
- **Filtros Avançados** - Por mês, consultor, tipo de processo

### 🎨 Painel Administrativo
- **Gerenciamento de Eventos** - Adicionar eventos com fotos
- **Configuração de Metas** - Definir metas mensais por tipo de processo
- **Gestão de Consultores** - Adicionar, editar, upload de fotos
- **Personalização Visual** - Temas, cores, logos customizáveis
- **Categorias de Processos** - Criar e organizar categorias
- **Configurações Gerais** - Intervalos, contadores, features

### 🔥 Integração Firebase
- **Firestore** - Banco de dados em tempo real
- **Storage** - Upload de imagens (eventos, consultores)
- **Authentication** - Sistema de login seguro
- **Hosting** - Deploy simples e rápido

---

## 🏗️ Estrutura do Projeto

```
revive-dashboard-v2/
├── index.html              # Dashboard principal
├── admin.html              # Painel administrativo
├── login.html              # Página de autenticação
├── css/
│   ├── main.css           # Estilos do dashboard
│   ├── admin.css          # Estilos da administração
│   └── themes.css         # Sistema de temas
├── js/
│   ├── config.js          # Configuração Firebase
│   ├── auth.js            # Autenticação
│   ├── dashboard.js       # Lógica do dashboard
│   ├── admin.js           # Lógica administrativa
│   ├── firebase-data.js   # Gerenciamento de dados
│   └── utils.js           # Funções auxiliares
├── images/                 # Imagens locais
└── README.md              # Esta documentação
```

---

## 🔧 Configuração Inicial

> **⚠️ IMPORTANTE - REGIÃO DO FIREBASE:**
>
> Ao configurar o Firebase, **SEMPRE selecione a região `southamerica-east1` (São Paulo)** para:
> - ✅ Firestore Database
> - ✅ Storage
> - ✅ Functions (se usar no futuro)
>
> Isso garante menor latência e conformidade com LGPD (dados no Brasil).

### 1. Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nome do projeto: `revive-dashboard`
4. Habilite Google Analytics (opcional)

### 2. Configurar Firestore Database

1. No menu lateral, vá em **Build > Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha modo de produção
4. Selecione a região (southamerica-east1 - São Paulo)

### 3. Habilitar Storage

1. No menu lateral, vá em **Build > Storage**
2. Clique em "Começar"
3. **IMPORTANTE:** Selecione a mesma região (southamerica-east1 - São Paulo)
4. Aceite as regras padrão

### 4. Habilitar Authentication

1. No menu lateral, vá em **Build > Authentication**
2. Clique em "Começar"
3. Habilite o método "E-mail/senha"

### 5. Obter Credenciais

1. Vá em **Configurações do Projeto** (ícone de engrenagem)
2. Em "Seus apps", clique no ícone da web `</>`
3. Registre o app: `revive-dashboard-web`
4. Copie as credenciais do Firebase

### 6. Configurar Credenciais no Código

Edite o arquivo `js/config.js` e adicione suas credenciais:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};
```

---

## 🚀 Como Usar

### Primeiro Acesso

1. Abra `login.html` no navegador
2. Clique em "Criar primeira conta de administrador"
3. Preencha email e senha
4. Você será redirecionado para o painel administrativo

### Painel Administrativo

**URL:** `admin.html`

#### Gerenciar Eventos
1. Vá para a aba "Eventos"
2. Clique em "Adicionar Evento"
3. Preencha: título, data, descrição
4. Faça upload da foto do evento
5. Salve

#### Configurar Metas
1. Vá para a aba "Metas"
2. Selecione o mês
3. Defina valores para cada tipo de processo
4. Salve as alterações

#### Adicionar Consultores
1. Vá para a aba "Consultores"
2. Clique em "Adicionar Consultor"
3. Nome, região (SC/CE), email
4. Upload da foto de perfil
5. Salve

#### Personalizar Tema
1. Vá para a aba "Aparência"
2. Escolha cores primária e secundária
3. Ajuste intervalos do carrossel
4. Ative/desative features

### Dashboard Principal

**URL:** `index.html`

- Visualização automática dos dados
- Carrossel roda automaticamente
- Dados sincronizam com Google Sheets (compatibilidade)
- Novos dados do Firebase sobrescrevem configurações

---

## 📊 Estrutura de Dados Firebase

### Firestore Collections

#### `/config/settings`
```json
{
  "refreshInterval": 30,
  "carouselInterval": 35,
  "baseProcessCount": 20224,
  "autoPlayCarousel": true,
  "companyGoal": 100000
}
```

#### `/goals/{month-year}`
```json
{
  "month": "01-2025",
  "previdenciarios": 600,
  "seguroTerceiro": 35,
  "seguroVida": 100
}
```

#### `/events/{eventId}`
```json
{
  "title": "Evento de Final de Ano",
  "date": "2025-12-20",
  "description": "O maior evento...",
  "imageUrl": "https://firebasestorage...",
  "featured": true,
  "createdAt": "2025-01-17T10:00:00Z"
}
```

#### `/consultants/{consultantId}`
```json
{
  "name": "Alexandre",
  "region": "SC",
  "photoUrl": "https://firebasestorage...",
  "active": true,
  "email": "alexandre@revive.com"
}
```

#### `/processCategories/{categoryId}`
```json
{
  "name": "PREVIDENCIÁRIOS",
  "types": ["BPC", "AUXILIO DOENÇA", "..."],
  "color": "#8b5cf6",
  "icon": "fa-scale-balanced",
  "order": 1
}
```

#### `/themes/active`
```json
{
  "name": "Tema ReVive",
  "primary": "#8b5cf6",
  "secondary": "#10b981",
  "accent": "#ffc107"
}
```

---

## 🔐 Segurança - Regras do Firestore

Copie e cole estas regras no Firebase Console > Firestore > Regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Apenas admins autenticados podem escrever
    match /{document=**} {
      allow read: if true;  // Leitura pública para dashboard
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }

    // Admins podem gerenciar a si mesmos
    match /admins/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🎨 Personalização

### Adicionar Novo Tema

1. Vá em `admin.html` > Aba "Aparência"
2. Escolha as cores:
   - **Primária:** Cor principal do dashboard (ex: roxo #8b5cf6)
   - **Secundária:** Cor secundária (ex: verde #10b981)
   - **Accent:** Destaques (ex: amarelo #ffc107)
3. Clique em "Salvar Tema"
4. O dashboard atualizará automaticamente

### Adicionar Nova Categoria de Processo

1. Vá em `admin.html` > Aba "Categorias"
2. Clique em "Adicionar Categoria"
3. Preencha:
   - Nome da categoria
   - Tipos de processos (separados por vírgula)
   - Cor hexadecimal
   - Ícone Font Awesome (ex: fa-scale-balanced)
4. Salve

---

## 🔄 Compatibilidade com Google Sheets

O sistema mantém compatibilidade total com as planilhas existentes:

- **Ranking:** `1YyyXkC2f3PU7_-IsO0ZgyusKVelyweZ301p63XFDrJ8`
- **Vendas SC:** `1fSTEyMmAEgfMnAFUTdYbJah5dr8OudsEsqjKHnHwFms`
- **Vendas CE:** Mesma planilha, GID diferente
- **Pagamentos, RTM, Acordos:** Planilhas existentes

Os dados do Firebase **complementam** as planilhas, não substituem.

---

## 📱 Responsividade

O dashboard é totalmente responsivo:
- **Desktop:** Layout completo com 2 colunas
- **Tablet:** Layout adaptado com 1 coluna
- **Mobile:** Interface otimizada para touch

---

## 🐛 Solução de Problemas

### Dashboard não carrega dados
- Verifique se o Firebase está configurado corretamente
- Abra o Console do navegador (F12) e veja erros
- Confirme que as regras do Firestore permitem leitura

### Upload de imagens falha
- Verifique se o Storage está habilitado
- Confirme que você está autenticado como admin
- Tamanho máximo: 5MB por imagem

### Login não funciona
- Confirme que Authentication está habilitado
- Verifique se o email/senha estão corretos
- Limpe cache e cookies do navegador

---

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação Firebase: https://firebase.google.com/docs
- Chart.js: https://www.chartjs.org/docs/
- Font Awesome: https://fontawesome.com/icons

---

## 📝 Changelog

### v2.0.0 (Janeiro 2025)
- ✨ Arquitetura modular completa
- 🔥 Integração com Firebase
- 🎨 Painel administrativo
- 📸 Upload de fotos de eventos
- 🎯 Configuração dinâmica de metas
- 🎨 Sistema de temas personalizáveis
- 🔐 Autenticação de usuários
- 📊 Estrutura de dados otimizada

---

## 📄 Licença

Propriedade de **ReVive** - Todos os direitos reservados.

---

**Desenvolvido com 💜 para a equipe ReVive**
