#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║         🚀 Push VITA Firebase para GitHub 🚀                 ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se estamos na pasta correta
if [ ! -f "public/index.html" ]; then
    echo "❌ ERRO: Execute este script dentro da pasta vita-firebase"
    echo ""
    echo "Use: cd /home/user/vita-firebase && bash push.sh"
    exit 1
fi

echo "📍 Pasta correta: vita-firebase/"
echo ""

# Verificar status do Git
echo "📊 Status do Git:"
git status --short
echo ""

# Verificar remote
echo "🔗 Remote configurado:"
git remote -v
echo ""

# Confirmar com usuário
echo "⚠️  IMPORTANTE:"
echo "   Certifique-se que criou o repositório no GitHub primeiro!"
echo "   https://github.com/new"
echo ""
read -p "   Já criou o repositório 'vita-firebase' no GitHub? (s/n): " resposta

if [ "$resposta" != "s" ] && [ "$resposta" != "S" ]; then
    echo ""
    echo "❌ Crie o repositório primeiro:"
    echo "   1. Acesse: https://github.com/new"
    echo "   2. Nome: vita-firebase"
    echo "   3. NÃO marque nenhuma opção"
    echo "   4. Clique em 'Create repository'"
    echo "   5. Execute este script novamente"
    echo ""
    exit 0
fi

echo ""
echo "🚀 Fazendo push para o GitHub..."
echo ""

# Fazer push com retry
max_tentativas=4
tentativa=1
delay=2

while [ $tentativa -le $max_tentativas ]; do
    echo "📤 Tentativa $tentativa de $max_tentativas..."

    if git push -u origin main; then
        echo ""
        echo "╔═══════════════════════════════════════════════════════════════╗"
        echo "║                                                               ║"
        echo "║              ✅ PUSH REALIZADO COM SUCESSO! ✅               ║"
        echo "║                                                               ║"
        echo "╚═══════════════════════════════════════════════════════════════╝"
        echo ""
        echo "🔗 Seu repositório está em:"
        echo "   https://github.com/rvservicos/vita-firebase"
        echo ""
        echo "📥 Para baixar no seu PC:"
        echo "   git clone https://github.com/rvservicos/vita-firebase.git"
        echo ""
        echo "🎯 Próximos passos:"
        echo "   1. Baixe o repositório no seu PC"
        echo "   2. Abra: public/index.html"
        echo "   3. Configure Firebase (leia INICIO_RAPIDO.md)"
        echo ""
        exit 0
    else
        echo "⚠️  Falhou. Aguardando ${delay}s antes de tentar novamente..."
        sleep $delay
        delay=$((delay * 2))
        tentativa=$((tentativa + 1))
    fi
done

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║              ❌ ERRO AO FAZER PUSH                           ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "💡 Possíveis soluções:"
echo ""
echo "1️⃣  Verificar se o repositório foi criado:"
echo "   https://github.com/rvservicos/vita-firebase"
echo ""
echo "2️⃣  Tentar manualmente:"
echo "   git push -u origin main --verbose"
echo ""
echo "3️⃣  Verificar permissões:"
echo "   git remote -v"
echo ""
echo "4️⃣  Baixar arquivo compactado:"
echo "   /home/user/vita-firebase.tar.gz"
echo "   Extrair no seu PC e fazer push de lá"
echo ""
echo "📚 Leia: PUSH_GITHUB.md para mais informações"
echo ""

exit 1
