#!/bin/bash

# Script para fazer push manual do VITA Firebase
# Use este script no seu PC após baixar o repositório

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║         🚀 Push Manual VITA Firebase                         ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se está na pasta correta
if [ ! -f "public/index.html" ]; then
    echo "❌ ERRO: Execute este script dentro da pasta vita-firebase"
    exit 1
fi

echo "📍 Pasta: vita-firebase/"
echo ""

# Remover remote antigo e adicionar novo
echo "🔧 Configurando remote do GitHub..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/rvservicos/vita-firebase.git

echo "✅ Remote configurado:"
git remote -v
echo ""

# Verificar branch
echo "🌿 Branch atual:"
git branch
echo ""

# Fazer push
echo "🚀 Fazendo push para GitHub..."
echo ""

if git push -u origin main; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║              ✅ PUSH REALIZADO COM SUCESSO! ✅               ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🔗 Seu repositório:"
    echo "   https://github.com/rvservicos/vita-firebase"
    echo ""
else
    echo ""
    echo "❌ Erro ao fazer push"
    echo ""
    echo "💡 Soluções:"
    echo ""
    echo "1. Verificar autenticação GitHub:"
    echo "   git config --global user.name \"Seu Nome\""
    echo "   git config --global user.email \"seu@email.com\""
    echo ""
    echo "2. Usar token de acesso pessoal:"
    echo "   https://github.com/settings/tokens"
    echo ""
    echo "3. Tentar push manual:"
    echo "   git push -u origin main"
    echo ""
fi
