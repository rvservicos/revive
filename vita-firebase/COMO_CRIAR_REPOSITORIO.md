# 📦 Como Criar o Repositório no GitHub

## Opção 1: Criar pelo GitHub (Recomendado)

### 1. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. **Repository name:** `vita-firebase` (ou outro nome)
3. **Description:** Sistema VITA modernizado com Firebase
4. **Visibilidade:**
   - **Public** (se quiser compartilhar)
   - **Private** (se quiser manter privado)
5. **NÃO** marque nenhuma opção (README, .gitignore, license)
6. Clique em **"Create repository"**

### 2. Conectar Repositório Local

No terminal, dentro da pasta `vita-firebase`:

```bash
# Inicializar git
git init

# Adicionar arquivos
git add .

# Fazer commit inicial
git commit -m "Projeto VITA modernizado com Firebase

- Página principal responsiva e moderna
- Painel administrativo completo
- Integração com Firebase Firestore
- Importação automática de dados
- Design mobile-first"

# Conectar com o GitHub (substitua SEU_USUARIO e NOME_DO_REPO)
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git

# Enviar para o GitHub
git branch -M main
git push -u origin main
```

### 3. Verificar Upload

Acesse: `https://github.com/SEU_USUARIO/NOME_DO_REPO`

Você deverá ver todos os arquivos!

---

## Opção 2: Upload Manual (Sem Git)

Se não quiser usar Git:

1. Acesse: https://github.com/new
2. Crie o repositório (passo 1 da Opção 1)
3. Na página do repositório, clique em **"uploading an existing file"**
4. Arraste todos os arquivos da pasta `vita-firebase`
5. Clique em **"Commit changes"**

---

## 📁 Arquivos que Serão Enviados

```
vita-firebase/
├── .firebaserc              # Configuração do projeto Firebase
├── .gitignore              # Arquivos ignorados pelo Git
├── firebase.json           # Configuração Firebase
├── firestore.rules         # Regras de segurança
├── firestore.indexes.json  # Índices do Firestore
├── README.md              # Documentação completa
├── INICIO_RAPIDO.md       # Guia rápido
├── COMO_CRIAR_REPOSITORIO.md  # Este arquivo
└── public/
    ├── index.html         # Página principal
    ├── admin.html        # Painel admin
    ├── css/
    │   └── style.css     # Estilos
    └── js/
        ├── app.js        # Lógica principal
        └── admin.js      # Lógica admin
```

---

## 🔐 Segurança das Credenciais

**IMPORTANTE:** As credenciais do Firebase que você vai adicionar nos arquivos `app.js` e `admin.js` podem ser públicas. O Firebase protege seu banco de dados através das regras de segurança (arquivo `firestore.rules`).

Porém, se quiser mais segurança:

1. Mantenha o repositório **Private**
2. Adicione restrições de domínio no Firebase Console:
   - Vá em: Configurações do Projeto → Configurações gerais
   - Em "Restrições de chave de API"
   - Adicione apenas o domínio do seu site

---

## 🌐 Configurar GitHub Pages (Opcional)

Se quiser hospedar também no GitHub Pages (além do Firebase):

1. Vá em: Settings → Pages
2. Source: `main` branch
3. Folder: `/public`
4. Save

Seu site também estará disponível em:
`https://SEU_USUARIO.github.io/NOME_DO_REPO/`

**Nota:** Recomendamos usar o Firebase Hosting (mais rápido e com SSL automático).

---

## ✅ Próximos Passos

Após criar o repositório:

1. ✅ Siga o `INICIO_RAPIDO.md` para fazer deploy
2. ✅ Configure as credenciais do Firebase
3. ✅ Faça o deploy: `firebase deploy`
4. ✅ Importe os dados no painel admin
5. ✅ Compartilhe o link com sua equipe!

---

## 🔄 Atualizações Futuras

Quando fizer alterações no projeto:

```bash
# Adicionar alterações
git add .

# Fazer commit
git commit -m "Descrição da alteração"

# Enviar para o GitHub
git push

# Atualizar no Firebase
firebase deploy
```
