@echo off
chcp 65001 >nul
cls

echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║         🚀 DEPLOY VITA FIREBASE - WINDOWS 🚀                ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo 📍 Pasta atual: %CD%
echo.

REM Verificar se está na pasta correta
if not exist "public\index.html" (
    echo ❌ ERRO: Execute este script dentro da pasta vita-firebase
    echo.
    echo Use: cd C:\Users\SeuNome\vita-firebase
    echo      DEPLOY.bat
    pause
    exit /b 1
)

echo ✅ Pasta correta!
echo.

REM Verificar Node.js
echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não instalado!
    echo.
    echo 📥 Baixe em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js instalado!
echo.

REM Verificar Firebase CLI
echo 🔍 Verificando Firebase CLI...
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Firebase CLI não instalado
    echo.
    echo 📦 Instalando Firebase CLI...
    call npm install -g firebase-tools
    echo.
)

echo ✅ Firebase CLI instalado!
echo.

REM Login no Firebase
echo 🔐 Fazendo login no Firebase...
echo (Uma janela do navegador abrirá)
echo.
call firebase login
if errorlevel 1 (
    echo.
    echo ❌ Erro no login
    pause
    exit /b 1
)

echo.
echo ✅ Login realizado!
echo.

REM Inicializar Firebase
echo ⚙️  Inicializando Firebase...
echo.
echo IMPORTANTE:
echo - Selecione: Firestore e Hosting
echo - Public directory: public
echo - Single-page app: n (não)
echo - Não sobrescrever arquivos
echo.
pause

call firebase init

echo.

REM Fazer deploy
echo 🚀 Fazendo deploy...
echo.
call firebase deploy

if errorlevel 1 (
    echo.
    echo ❌ Erro no deploy
    pause
    exit /b 1
)

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║              ✅ DEPLOY REALIZADO COM SUCESSO! ✅             ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Seu site está no ar!
echo.
echo 📍 Próximos passos:
echo    1. Acesse a URL do Firebase Hosting
echo    2. Abra: /admin.html
echo    3. Clique em "Importar Dados Iniciais"
echo    4. Use!
echo.
pause
