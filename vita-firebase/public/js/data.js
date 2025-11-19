// ═══════════════════════════════════════════════════════════
// VITA - Sistema de Múltiplas Versões
// Cada versão pode ter suas próprias categorias e links
// ═══════════════════════════════════════════════════════════

const VITA_VERSIONS = {
    // ═══ Versão Normal (Padrão) ═══
    normal: {
        id: 'normal',
        name: 'VITA Normal',
        description: 'Versão padrão para equipe geral',
        categories: [
            {
                id: 'cat1',
                name: 'Documentos e Contratos',
                icon: '📄',
                order: 1
            },
            {
                id: 'cat2',
                name: 'Controle e Sistemas Santa Catarina',
                icon: '📠',
                order: 2
            },
            {
                id: 'cat3',
                name: 'Controle e Sistemas CEARÁ',
                icon: '☀️',
                order: 3
            },
            {
                id: 'cat4',
                name: 'Gestão e Controle Geral',
                icon: '📊',
                order: 4
            },
            {
                id: 'cat5',
                name: 'Ferramentas e Análises',
                icon: '🛠️',
                order: 5
            },
            {
                id: 'cat6',
                name: 'Suporte e Informações',
                icon: '💬',
                order: 6
            }
        ],
        links: [
            // Categoria 1: Documentos e Contratos
            {
                id: 'link1',
                categoryId: 'cat1',
                title: 'Envio de Documentos',
                url: 'https://docs.google.com/forms/d/e/1FAIpQLSdbNodbYHu5CNR_LbtsAl50oE9RCk1WMEtEz7NTHuMij7VGBw/viewform?usp=dialog',
                icon: '📤',
                style: '',
                order: 1
            },
            {
                id: 'link2',
                categoryId: 'cat1',
                title: 'Consulta Documentos',
                url: 'https://script.google.com/macros/s/AKfycbzDyV-5s3GveaSauq1TPnm83ZUAGaQsgW2HBqWz6XuPtpKpZcNwO926ZaNSk5dtqQLs6g/exec?page=consulta',
                icon: '🔍',
                style: '',
                order: 2
            },

            // Categoria 2: Santa Catarina
            {
                id: 'link3',
                categoryId: 'cat2',
                title: 'Novo Contrato SC',
                url: 'https://app.zapsign.com.br/verificar/doc/9088c21f-820c-4a1f-9ea9-c5fb749579c1',
                icon: '📝',
                style: 'warning',
                order: 1
            },
            {
                id: 'link4',
                categoryId: 'cat2',
                title: 'Contrato Menor',
                url: 'https://app.zapsign.com.br/verificar/doc/ce1d102e-ad07-4c94-938c-85c3bfc51372',
                icon: '👶',
                style: 'warning',
                order: 2
            },
            {
                id: 'link5',
                categoryId: 'cat2',
                title: 'Kit Maba',
                url: 'https://app.zapsign.com.br/verificar/doc/81a57629-96c9-4d0b-9704-526cf05f5e6f',
                icon: '🤵',
                style: 'warning',
                order: 3
            },
            {
                id: 'link6',
                categoryId: 'cat2',
                title: 'Novo Feedback SC',
                url: 'https://script.google.com/macros/s/AKfycby8fytlrrk6KNsN7iF2PBWHzKRqVav-hWkS5Eyq1YwmckHg_GZ8gaqOB0TIUYdlO-EN/exec',
                icon: '✅',
                style: 'warning',
                order: 4
            },
            {
                id: 'link7',
                categoryId: 'cat2',
                title: 'Gerenciar Leads SC',
                url: 'https://script.google.com/macros/s/AKfycbyqapC88zgvJpu1DkEAtnMRcIplK9e7nDj_SnlIMvm38f0y3Y9RJ9TVEwP4fqWOWIXB/exec',
                icon: '📋',
                style: 'warning',
                order: 5
            },

            // Categoria 3: Ceará
            {
                id: 'link8',
                categoryId: 'cat3',
                title: 'Novo Contrato CEARÁ',
                url: 'https://app.zapsign.com.br/verificar/doc/9b3c87e3-0892-400e-914f-3fc034521e7a',
                icon: '📝',
                style: 'success',
                order: 1
            },
            {
                id: 'link9',
                categoryId: 'cat3',
                title: 'Contrato Menor',
                url: 'https://app.zapsign.com.br/verificar/doc/ed12719f-ef85-418e-883c-d28ace4eabe0',
                icon: '👶',
                style: 'success',
                order: 2
            },
            {
                id: 'link10',
                categoryId: 'cat3',
                title: 'Gerenciar Leads CEARÁ',
                url: 'https://script.google.com/macros/s/AKfycbxeiKfvVeTjt_8eQYj4z-m0Xoj09g2MTZ6rzIhNEKi9cfoVmx7NAFEAkaggJwGbipGv/exec',
                icon: '📋',
                style: 'success',
                order: 3
            },
            {
                id: 'link11',
                categoryId: 'cat3',
                title: 'Novo Feedback CEARÁ',
                url: 'https://script.google.com/macros/s/AKfycbzM5TdlOlmyOcAVw49Jkrj3I1cdwvRBhyUq0zzc-zDB36UXtTHoFq0A_j_yUWsf8JZjYg/exec',
                icon: '✅',
                style: 'success',
                order: 4
            },

            // Categoria 4: Gestão e Controle Geral
            {
                id: 'link12',
                categoryId: 'cat4',
                title: 'Novo Fechamento',
                url: 'https://docs.google.com/forms/d/e/1FAIpQLSd-MBnLLIhgIPpSSVA9e0Vnbk2qw2UZ5N_ap7xvsFYmW_gRlA/viewform',
                icon: '🆕',
                style: 'primary',
                order: 1
            },
            {
                id: 'link13',
                categoryId: 'cat4',
                title: 'Controle Fechamento',
                url: 'https://script.google.com/macros/s/AKfycbwzr191Adr1TMlWVU24TEaiXXLx4iUkaWw2B1CnsbdwvAa2Gp6bWodLFkdt7N4lau7x1Q/exec?page=consultor',
                icon: '📈',
                style: 'primary',
                order: 2
            },
            {
                id: 'link14',
                categoryId: 'cat4',
                title: 'Controle de Frota',
                url: 'https://script.google.com/macros/s/AKfycbw3JToBXkDA7GNNLYx7PRjXr6K1NvEvkN3hmcZDeNHX9mHBchVqTF8ryK_cZw3JjU-f/exec',
                icon: '🚗',
                style: 'primary',
                order: 3
            },
            {
                id: 'link15',
                categoryId: 'cat4',
                title: 'Despesas',
                url: 'https://script.google.com/macros/s/AKfycbxTCA8NNU_fB1UCAJmWSFu-2AMgbuwc51qNdw5JbVibrOsNeXRVOTD4VUFE-NqIPAR6QA/exec',
                icon: '💰',
                style: 'primary',
                order: 4
            },
            {
                id: 'link16',
                categoryId: 'cat4',
                title: 'Controle de Taxa RTM',
                url: 'https://script.google.com/macros/s/AKfycbyunSScP4z43CAR0Q-KKhXd20vcya_nTastdVXp6dlzbFj7Cnl05IKfaoEl3IbnOGSJRQ/exec?page=consultor',
                icon: '🏥',
                style: 'primary',
                order: 5
            },

            // Categoria 5: Ferramentas e Análises
            {
                id: 'link17',
                categoryId: 'cat5',
                title: 'Ranking de Vendas',
                url: 'https://rvservicos.github.io/revive/ranking.html',
                icon: '🏆',
                style: '',
                order: 1
            },
            {
                id: 'link18',
                categoryId: 'cat5',
                title: 'Cálculo de Contribuição INSS',
                url: 'https://claude.ai/public/artifacts/c4fe1983-7805-4627-9cb4-74c3b8be05c5',
                icon: '✏️',
                style: '',
                order: 2
            },
            {
                id: 'link19',
                categoryId: 'cat5',
                title: 'Análise de Direitos',
                url: 'https://rvservicos.github.io/revive/analise.html',
                icon: '⚖️',
                style: '',
                order: 3
            },
            {
                id: 'link20',
                categoryId: 'cat5',
                title: 'Empresas com Vida',
                url: 'https://script.google.com/macros/s/AKfycbwMA2gdR5lNuJfEHpvQniu1veYy0EMKn8_a4rSNPWxdRRflqXQsVcHlvgF68HJbYUl3/exec',
                icon: '🛡️',
                style: '',
                order: 4
            },

            // Categoria 6: Suporte e Informações
            {
                id: 'link21',
                categoryId: 'cat6',
                title: 'Processos',
                url: 'https://rvservicos.github.io/revive/index.html',
                icon: '⚖️',
                style: '',
                order: 1
            },
            {
                id: 'link22',
                categoryId: 'cat6',
                title: 'Documentação',
                url: 'https://rvservicos.github.io/revive/index.html',
                icon: '📑',
                style: '',
                order: 2
            }
        ]
    },

    // ═══ Versão ADM (Administrativa) ═══
    adm: {
        id: 'adm',
        name: 'VITA ADM',
        description: 'Versão administrativa com ferramentas de gestão',
        categories: [
            {
                id: 'catAdm1',
                name: 'Gestão Administrativa',
                icon: '⚙️',
                order: 1
            },
            {
                id: 'catAdm2',
                name: 'Relatórios e Análises',
                icon: '📊',
                order: 2
            },
            {
                id: 'catAdm3',
                name: 'Controles Financeiros',
                icon: '💼',
                order: 3
            },
            {
                id: 'catAdm4',
                name: 'Recursos Humanos',
                icon: '👥',
                order: 4
            }
        ],
        links: [
            // Categoria 1: Gestão Administrativa
            {
                id: 'linkAdm1',
                categoryId: 'catAdm1',
                title: 'Painel de Controle',
                url: '#',
                icon: '🎛️',
                style: 'primary',
                order: 1
            },
            {
                id: 'linkAdm2',
                categoryId: 'catAdm1',
                title: 'Configurações do Sistema',
                url: '#',
                icon: '⚙️',
                style: 'primary',
                order: 2
            },

            // Categoria 2: Relatórios e Análises
            {
                id: 'linkAdm3',
                categoryId: 'catAdm2',
                title: 'Relatório de Vendas',
                url: '#',
                icon: '📈',
                style: 'success',
                order: 1
            },
            {
                id: 'linkAdm4',
                categoryId: 'catAdm2',
                title: 'Análise de Performance',
                url: '#',
                icon: '📊',
                style: 'success',
                order: 2
            },

            // Categoria 3: Controles Financeiros
            {
                id: 'linkAdm5',
                categoryId: 'catAdm3',
                title: 'Fluxo de Caixa',
                url: '#',
                icon: '💵',
                style: 'warning',
                order: 1
            },
            {
                id: 'linkAdm6',
                categoryId: 'catAdm3',
                title: 'Contas a Pagar',
                url: '#',
                icon: '💳',
                style: 'warning',
                order: 2
            },

            // Categoria 4: Recursos Humanos
            {
                id: 'linkAdm7',
                categoryId: 'catAdm4',
                title: 'Gestão de Equipe',
                url: '#',
                icon: '👔',
                style: '',
                order: 1
            },
            {
                id: 'linkAdm8',
                categoryId: 'catAdm4',
                title: 'Folha de Pagamento',
                url: '#',
                icon: '💰',
                style: '',
                order: 2
            }
        ]
    }
};

// Compatibilidade com código legado
const VITA_DATA = VITA_VERSIONS.normal;

// Função auxiliar para obter versão
function getVitaVersion(versionId = 'normal') {
    return VITA_VERSIONS[versionId] || VITA_VERSIONS.normal;
}
