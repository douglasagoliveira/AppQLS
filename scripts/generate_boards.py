"""
Generator script for QLS Lighting App architecture boards:
1. Excalidraw (.excalidraw)
2. FigJam (.svg and .json)
3. Miro (.svg and .json)
4. Interactive HTML Board Preview
"""

import json
import os
import uuid

def gen_id():
    return str(uuid.uuid4())[:8]

def create_excalidraw():
    elements = []
    
    def add_rect(x, y, w, h, bg="#ffffff", stroke="#1e1e1e", fill="solid", roughness=1, stroke_width=2, roundness={"type": 3}):
        el_id = gen_id()
        elements.append({
            "id": el_id,
            "type": "rectangle",
            "x": x, "y": y, "width": w, "height": h,
            "angle": 0,
            "strokeColor": stroke,
            "backgroundColor": bg,
            "fillStyle": fill,
            "strokeWidth": stroke_width,
            "strokeStyle": "solid",
            "roughness": roughness,
            "opacity": 100,
            "groupIds": [],
            "roundness": roundness,
            "seed": int(uuid.uuid4().int % 100000),
            "version": 1,
            "versionNonce": 1,
            "isDeleted": False,
            "boundElements": None,
            "updated": 1,
            "link": None,
            "locked": False
        })
        return el_id

    def add_text(x, y, text, font_size=20, color="#1e1e1e", align="left", font_family=1):
        el_id = gen_id()
        lines = text.split("\n")
        w = max(len(l) for l in lines) * (font_size * 0.58)
        h = len(lines) * (font_size * 1.35)
        elements.append({
            "id": el_id,
            "type": "text",
            "x": x, "y": y, "width": w, "height": h,
            "angle": 0,
            "strokeColor": color,
            "backgroundColor": "transparent",
            "fillStyle": "solid",
            "strokeWidth": 1,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "groupIds": [],
            "roundness": None,
            "seed": int(uuid.uuid4().int % 100000),
            "version": 1,
            "versionNonce": 1,
            "isDeleted": False,
            "boundElements": None,
            "updated": 1,
            "link": None,
            "locked": False,
            "text": text,
            "fontSize": font_size,
            "fontFamily": font_family,
            "textAlign": align,
            "verticalAlign": "top",
            "baseline": font_size
        })
        return el_id

    def add_arrow(x1, y1, x2, y2, stroke="#c9a84c", stroke_width=2):
        el_id = gen_id()
        dx = x2 - x1
        dy = y2 - y1
        elements.append({
            "id": el_id,
            "type": "arrow",
            "x": x1, "y": y1, "width": abs(dx), "height": abs(dy),
            "angle": 0,
            "strokeColor": stroke,
            "backgroundColor": "transparent",
            "fillStyle": "solid",
            "strokeWidth": stroke_width,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "groupIds": [],
            "roundness": {"type": 2},
            "seed": int(uuid.uuid4().int % 100000),
            "version": 1,
            "versionNonce": 1,
            "isDeleted": False,
            "boundElements": None,
            "updated": 1,
            "link": None,
            "locked": False,
            "points": [[0, 0], [dx, dy]],
            "lastCommittedPoint": None,
            "startBinding": None,
            "endBinding": None,
            "startArrowhead": None,
            "endArrowhead": "arrow"
        })
        return el_id

    # 1. HEADER SECTION (Excalidraw Hand-drawn Banner)
    add_rect(40, 40, 2320, 140, bg="#1a1814", stroke="#c9a84c", roughness=1, stroke_width=3)
    add_text(70, 60, "💡 QLS LIGHTING APP — ARQUITETURA DE PRODUTO, UX & ROADMAP", font_size=32, color="#c9a84c")
    add_text(70, 110, "Consultor Luminotécnico com IA (AS/NZS 1680) + Catálogo Digital B2B/B2C RFQ | Documento de Estrutura Inicial", font_size=18, color="#f8f6f2")

    # 2. PROPOSTA DE VALOR & PROBLEMAS QUE RESOLVE (Sticky Notes Style)
    add_rect(40, 220, 720, 460, bg="#fffde6", stroke="#d4b106", fill="solid", roughness=2)
    add_text(60, 240, "📌 PROBLEMAS QUE O APP RESOLVE", font_size=24, color="#533f03")
    add_text(60, 290, 
        "1. Especificadores e Arquitetos perdem horas calculando\n"
        "   lúmens, lux e consultando tabelas complexas.\n\n"
        "2. Clientes finais compram iluminação errada (muito escura\n"
        "   ou ofuscante) por não entenderem de iluminância.\n\n"
        "3. Fábrica QLS sobrecarregada com dúvidas repetitivas\n"
        "   e orçamentos manuais lentos.\n\n"
        "4. Falta de padronização nas normas técnicas australianas\n"
        "   (AS/NZS 1680) no momento da compra.", font_size=17, color="#1e1e1e")

    add_rect(800, 220, 760, 460, bg="#e8f4fd", stroke="#0b6bcb", fill="solid", roughness=2)
    add_text(820, 240, "✨ SOLUÇÃO & PROPOSTA DE VALOR QLS", font_size=24, color="#0b6bcb")
    add_text(820, 290,
        "• Consultor com IA em 3 Passos: Seleciona cômodo, medidas\n"
        "  (C x L x H) e estilo -> cálculo automático de Lux e peças!\n\n"
        "• Recomendação Tripla com Efeito Glow: Melhor Escolha (Best\n"
        "  Match IA), Opção Premium (Alto IRC/UGR) e Opção Econômica.\n\n"
        "• Memorial Descritivo em PDF: Relatório profissional instantâneo\n"
        "  com quantitativo de luminárias, potência e fichas técnicas.\n\n"
        "• Pipeline de RFQ Direto: Cotação oficial enviada com 1 clique.", font_size=17, color="#1e1e1e")

    add_rect(1600, 220, 760, 460, bg="#f3e8ff", stroke="#7e22ce", fill="solid", roughness=2)
    add_text(1620, 240, "👥 PÚBLICO-ALVO & PERSONAS", font_size=24, color="#7e22ce")
    add_text(1620, 290,
        "👤 Especificador B2B (Arquiteto, Lighting Designer, Eletricista):\n"
        "   - Cria projetos com múltiplos cômodos na obra.\n"
        "   - Exporta PDF profissional para clientes e compras.\n\n"
        "👤 Cliente Final B2C (Proprietário de Imóvel):\n"
        "   - Insere medidas da sua casa de forma simples.\n"
        "   - Descobre exatamente quantas luminárias comprar.\n\n"
        "🏭 Fábrica QLS (Comercial & Engenharia):\n"
        "   - Recebe RFQs estruturados e prontos para faturamento.", font_size=17, color="#1e1e1e")

    # 3. ESTRUTURA DE PÁGINAS & NAVEGAÇÃO (User Flow & IA)
    add_rect(40, 720, 2320, 700, bg="#ffffff", stroke="#333333", roughness=1, stroke_width=2)
    add_text(60, 740, "🗺️ MAPA DE ESTRUTURA DE PÁGINAS & FLUXO DE NAVEGAÇÃO", font_size=26, color="#0a0a0a")
    add_text(60, 780, "Fluxo completo desde o primeiro acesso Guest até o fechamento da proposta RFQ", font_size=16, color="#666666")

    # Splash
    add_rect(80, 830, 260, 130, bg="#1a1814", stroke="#c9a84c", roughness=1)
    add_text(100, 850, "📱 1. Splash & Welcome\n• Entrada Imediata\n• Sem Barreira de Login\n• Botão Iniciar Consultor", font_size=14, color="#f8f6f2")

    add_arrow(340, 895, 420, 895)

    # Tab Bar Container
    add_rect(420, 820, 1880, 560, bg="#fafafa", stroke="#999999", stroke_width=1, fill="hachure")
    add_text(440, 835, "BOTTOM TABS PRINCIPAIS (NAVEGAÇÃO GLOBAL)", font_size=18, color="#333333")

    # Tab 1
    add_rect(450, 880, 380, 460, bg="#ffffff", stroke="#0b6bcb", roughness=1)
    add_text(470, 900, "📁 TAB 1: WORKSPACE PROJETOS", font_size=17, color="#0b6bcb")
    add_text(470, 940,
        "• Lista de Projetos Recentes\n"
        "• Resumo de Carga (W/m²)\n"
        "• Status do RFQ (Badge)\n"
        "• Botão [+ Novo Projeto]\n\n"
        "↳ Modal: Criar Projeto\n"
        "   (Nome, Local, Tipo)\n\n"
        "↳ Tela: Painel do Projeto\n"
        "   - Lista de Cômodos\n"
        "   - Memorial Descritivo\n"
        "   - [📄 Gerar PDF]\n"
        "   - [🚀 Enviar RFQ]", font_size=14, color="#222222")

    # Tab 2 (Core)
    add_rect(870, 880, 520, 460, bg="#fffef0", stroke="#c9a84c", roughness=1, stroke_width=3)
    add_text(890, 900, "💡 TAB 2: CONSULTOR IA (CORE ENGINE)", font_size=17, color="#b45309")
    add_text(890, 940,
        "• Wizard em 3 Etapas Rápidas:\n"
        "   1️⃣ Passo 1: Selecionar Cômodo\n"
        "       (Cozinha, Estar, Suíte, Office, Banho, Deck)\n"
        "   2️⃣ Passo 2: Dimensões Táteis (C x L x H)\n"
        "       (Área m², Lux Alvo AS/NZS 1680, Lúmens)\n"
        "   3️⃣ Passo 3: Estilo & Temperatura (CCT)\n"
        "       (2700K Intimista, 3000K Conforto, 4000K Neutro)\n\n"
        "↳ TELA DE RESULTADOS (TRIPLA ESCOLHA GLOW):\n"
        "   ⭐ Opção 1: Best Match IA (Luminária Ideal)\n"
        "   💎 Opção 2: Linha Premium (Design & UGR)\n"
        "   💰 Opção 3: Linha Econômica (Custo-Benefício)\n"
        "   ↳ Seletor de Acabamento & [Adicionar ao Projeto]", font_size=14, color="#111111")

    # Tab 3
    add_rect(1430, 880, 410, 460, bg="#ffffff", stroke="#059669", roughness=1)
    add_text(1450, 900, "📖 TAB 3: CATÁLOGO DIGITAL", font_size=17, color="#059669")
    add_text(1450, 940,
        "• Grid de Produtos com Glow\n"
        "• Filtros por Aplicação:\n"
        "   (Downlights, Pendentes, Trilhos, Fitas)\n"
        "• Busca Textual por SKU\n\n"
        "↳ Tela Detalhes do Produto:\n"
        "   - Simulador CCT Interativo\n"
        "   - Curva Fotométrica e UGR\n"
        "   - Download de Datasheet IES\n"
        "   - [Adicionar a Projeto Existente]", font_size=14, color="#222222")

    # Tab 4
    add_rect(1880, 880, 390, 460, bg="#ffffff", stroke="#7c3aed", roughness=1)
    add_text(1900, 900, "👤 TAB 4: MINHA CONTA & RFQS", font_size=17, color="#7c3aed")
    add_text(1900, 940,
        "• Perfil Profissional (B2B/B2C)\n"
        "• Histórico de Cotações RFQ\n"
        "• Linha do Tempo do Pedido:\n"
        "   1. RFQ Enviado\n"
        "   2. Em Análise Técnica\n"
        "   3. Proposta Comercial Pronta\n"
        "• Download de PDFs Anteriores\n"
        "• Canal Direto WhatsApp Fábrica", font_size=14, color="#222222")

    # 4. WIREFRAME DA FUNÇÃO PRINCIPAL (Consultor Luminotécnico)
    add_rect(40, 1460, 2320, 680, bg="#1a1814", stroke="#c9a84c", roughness=1, stroke_width=2)
    add_text(60, 1480, "📐 WIREFRAME VISUAL: FLUXO DO CONSULTOR LUMINOTÉCNICO (CORE FEATURE)", font_size=26, color="#c9a84c")
    add_text(60, 1520, "Como a inteligência luminotécnica transforma medidas simples em recomendação técnica perfeita", font_size=16, color="#f8f6f2")

    # Wireframe Screen 1
    add_rect(80, 1570, 480, 520, bg="#0a0a0a", stroke="#c9a84c", stroke_width=2)
    add_text(100, 1590, "PASSO 1: AMBIENTE", font_size=18, color="#c9a84c")
    add_text(100, 1630, 
        "Qual espaço será iluminado?\n\n"
        "[🍳 Cozinha / Gourmet] -> SELECIONADO\n"
        "Meta Norma: 240-300 Lux\n\n"
        "[🛋️ Sala de Estar]   [🛏️ Suíte Master]\n"
        "[💻 Home Office]      [🚿 Banheiro/Lavabo]\n\n"
        "------------------------------------\n"
        "[ Avançar para Dimensões -> ] (Gold)", font_size=15, color="#ffffff")

    add_arrow(560, 1830, 620, 1830)

    # Wireframe Screen 2
    add_rect(620, 1570, 520, 520, bg="#0a0a0a", stroke="#c9a84c", stroke_width=2)
    add_text(640, 1590, "PASSO 2: MEDIDAS TÁTEIS", font_size=18, color="#c9a84c")
    add_text(640, 1630,
        "Comprimento (C): [ 4.50 m ]  ---o---\n"
        "Largura (L):     [ 3.20 m ]  -----o-\n"
        "Pé-Direito (H):  [ 2.80 m ]  --o----\n\n"
        "📊 FEEDBACK EM TEMPO REAL:\n"
        "• Área Calculada: 14.40 m²\n"
        "• Meta AS/NZS 1680: 300 Lux\n"
        "• Fluxo Necessário: ~6.000 Lúmens\n\n"
        "Tipo de Teto: (•) Gesso  ( ) Laje  ( ) Madeira\n"
        "------------------------------------\n"
        "[ Avançar para Estilo -> ] (Gold)", font_size=15, color="#ffffff")

    add_arrow(1140, 1830, 1200, 1830)

    # Wireframe Screen 3
    add_rect(1200, 1570, 500, 520, bg="#0a0a0a", stroke="#c9a84c", stroke_width=2)
    add_text(1220, 1590, "PASSO 3: TEMPERATURA & ESTILO", font_size=18, color="#c9a84c")
    add_text(1220, 1630,
        "Escolha a Temperatura de Cor:\n\n"
        "(•) 3000K Warm White (Conforto Elegante)\n"
        "    Tom acolhedor padrão QLS\n\n"
        "( ) 2700K Ultra Warm (Intimista)\n"
        "( ) 4000K Neutral (Foco Técnico)\n\n"
        "Exigências Especiais:\n"
        "[x] UGR < 19 Antiglare (Alto Conforto)\n"
        "[ ] IP44/IP65 Proteção Umidade\n\n"
        "------------------------------------\n"
        "[ ✨ Calcular Iluminação com IA ]", font_size=15, color="#ffffff")

    add_arrow(1700, 1830, 1760, 1830)

    # Wireframe Screen 4 (Result)
    add_rect(1760, 1570, 560, 520, bg="#0a0a0a", stroke="#c9a84c", stroke_width=3)
    add_text(1780, 1590, "RESULTADO: RECOMENDAÇÃO TRIPLA", font_size=18, color="#c9a84c")
    add_text(1780, 1630,
        "[⭐ RECOMENDADA]  [💎 PREMIUM]  [💰 ECONÔMICA]\n\n"
        "✨ AURORA DEEP ARCHITECTURAL 12W\n"
        "------------------------------------\n"
        "• Quantidade: 6x Peças no Teto\n"
        "• Nível Calculado: 312 Lux (Conforme ✅)\n"
        "• IRC > 92 | UGR < 16 | Facho 38°\n"
        "• Acabamentos: [• Preto] [ Branco ] [ Latão ]\n\n"
        "+----------------------------------+\n"
        "|   [ + Selecionar Esta Opção ]    | (Botão Gold)\n"
        "+----------------------------------+\n"
        "[ 📄 Ver Memorial ]  [ 🚀 Enviar RFQ ]", font_size=15, color="#f8f6f2")

    # 5. ROADMAP CRONOLÓGICO DE DESENVOLVIMENTO (FASES 1 A 6)
    add_rect(40, 2180, 2320, 580, bg="#ffffff", stroke="#333333", roughness=1, stroke_width=2)
    add_text(60, 2200, "🗓️ ROADMAP CRONOLÓGICO DE DESENVOLVIMENTO (DO INÍCIO AO LANÇAMENTO)", font_size=26, color="#0a0a0a")
    add_text(60, 2240, "Metodologia ágil dividida em 6 sprints modulares com entregas verificáveis", font_size=16, color="#666666")

    phases = [
        ("FASE 1: Fundação & Design Tokens", "• Paleta QLS Gold/Dark\n• Tipografia Urbanist\n• Primitivas de Botões, Sliders e Cards", "#fef3c7", "#d97706"),
        ("FASE 2: Motor IA & Catálogo", "• Algoritmo AS/NZS 1680\n• Fórmulas de Lux e Lúmens\n• Seed de Produtos QLS", "#e0e7ff", "#4338ca"),
        ("FASE 3: Telas & Navegação UI", "• Bottom Tabs e Stacks\n• Wizard 3 Passos Tátil\n• Cards Glow Tripla Escolha\n• Showroom e Simulador CCT", "#d1fae5", "#059669"),
        ("FASE 4: Backend Supabase & PDF", "• Schema PostgreSQL e RLS\n• Auth Guest-First Progressivo\n• Geração de Memorial PDF\n• Pipeline de RFQ na Fábrica", "#fae8ff", "#9333ea"),
        ("FASE 5: QA & Validação Física", "• Testes Unitários de Lux\n• Testes de Toque (48px)\n• Validação iOS e Android\n• Safe Areas e Haptics", "#ffedd5", "#c2410c"),
        ("FASE 6: Deploy & App Stores", "• Build EAS iOS/Android\n• Submissão TestFlight\n• Publicação Google Play\n• Treinamento da Equipe", "#ecfdf5", "#047857"),
    ]

    for idx, (title, content, bg, stroke) in enumerate(phases):
        px = 80 + idx * 370
        add_rect(px, 2290, 350, 420, bg=bg, stroke=stroke, roughness=1, stroke_width=2)
        add_text(px + 15, 2310, f"SPRINT {idx+1}\n{title}", font_size=16, color=stroke)
        add_text(px + 15, 2370, content, font_size=14, color="#1e1e1e")

    return {
        "type": "excalidraw",
        "version": 2,
        "source": "https://excalidraw.com",
        "elements": elements,
        "appState": {
            "gridSize": None,
            "viewBackgroundColor": "#f8f9fa"
        },
        "files": {}
    }

def create_figjam_svg():
    # FigJam aesthetic: vibrant pastel colors, pill badges, soft shadows, rounded corners, modern stickers
    svg = '''<svg width="2400" height="2800" viewBox="0 0 2400 2800" fill="none" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif">
    <defs>
        <style>
            .title { font-weight: 800; fill: #111827; }
            .subtitle { font-weight: 500; fill: #4B5563; }
            .section-title { font-weight: 700; fill: #111827; font-size: 24px; }
            .card-title { font-weight: 700; font-size: 18px; }
            .card-body { font-size: 14px; line-height: 1.6; fill: #374151; font-weight: 400; }
            .badge { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            .pill { rx: 20; ry: 20; }
            .shadow { filter: drop-shadow(0px 8px 24px rgba(0, 0, 0, 0.06)); }
            .shadow-sm { filter: drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.04)); }
        </style>
        <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000" flood-opacity="0.07"/>
        </filter>
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
        <linearGradient id="glow-circle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#eab308" stop-opacity="0"/>
        </linearGradient>
    </defs>

    <!-- Canvas Background (FigJam Dot Grid Vibe) -->
    <rect width="2400" height="2800" fill="#F9FAFB"/>
    
    <!-- HEADER HERO SECTION -->
    <g transform="translate(60, 50)">
        <rect width="2280" height="150" rx="24" fill="#111827" filter="url(#card-shadow)"/>
        
        <!-- FigJam Style Sticker Pill -->
        <rect x="40" y="30" width="140" height="32" rx="16" fill="#FBBF24"/>
        <text x="110" y="51" text-anchor="middle" font-size="13" font-weight="800" fill="#78350F">FIGJAM BOARD</text>
        
        <text x="200" y="52" font-size="28" font-weight="800" fill="#FFFFFF">💡 QLS LIGHTING APP — ARQUITETURA DE PRODUTO, UX &amp; ROADMAP</text>
        <text x="40" y="105" font-size="16" fill="#D1D5DB">Consultor Luminotécnico com IA (Normas AS/NZS 1680) + Catálogo Digital B2B/B2C RFQ | Documento de Estrutura Inicial</text>
        
        <!-- Stamp stickers -->
        <rect x="2040" y="35" width="180" height="42" rx="21" fill="#8B5CF6"/>
        <text x="2130" y="61" text-anchor="middle" font-size="14" font-weight="700" fill="#FFFFFF">✨ PRONTO P/ DEV</text>
    </g>

    <!-- SECTION 1: PROBLEMAS & PROPOSTA DE VALOR (STICKY NOTES) -->
    <g transform="translate(60, 240)">
        <rect width="2280" height="460" rx="24" fill="#FFFFFF" filter="url(#card-shadow)"/>
        <text x="40" y="50" class="section-title">📌 1. Visão Geral, Problemas que Resolve &amp; Proposta de Valor</text>
        
        <!-- Sticky Note 1: Problemas (Yellow FigJam Sticky) -->
        <g transform="translate(40, 80)">
            <rect width="700" height="340" rx="16" fill="#FEF08A" filter="url(#card-shadow)"/>
            <rect x="25" y="25" width="110" height="26" rx="13" fill="#EAB308"/>
            <text x="80" y="42" text-anchor="middle" font-size="11" font-weight="800" fill="#713F12">DORES ATUAIS</text>
            <text x="25" y="80" font-size="20" font-weight="800" fill="#713F12">Problemas no Mercado de Iluminação</text>
            <text x="25" y="115" class="card-body">
                <tspan x="25" dy="0">• Especificadores perdem horas calculando lúmens e lux manualmente.</tspan>
                <tspan x="25" dy="28">• Clientes compram LEDs inadequados por falta de consultoria técnica.</tspan>
                <tspan x="25" dy="28">• Fábrica sobrecarregada com dúvidas repetitivas no WhatsApp.</tspan>
                <tspan x="25" dy="28">• Orçamentos manuais lentos geram perda de vendas para concorrentes.</tspan>
                <tspan x="25" dy="28">• Erros de especificação geram devoluções e retrabalho na obra.</tspan>
            </text>
        </g>

        <!-- Sticky Note 2: Solução (Green FigJam Sticky) -->
        <g transform="translate(780, 80)">
            <rect width="720" height="340" rx="16" fill="#BBF7D0" filter="url(#card-shadow)"/>
            <rect x="25" y="25" width="130" height="26" rx="13" fill="#22C55E"/>
            <text x="90" y="42" text-anchor="middle" font-size="11" font-weight="800" fill="#14532D">SOLUÇÃO QLS</text>
            <text x="25" y="80" font-size="20" font-weight="800" fill="#14532D">Consultor Inteligente + Catálogo B2B</text>
            <text x="25" y="115" class="card-body">
                <tspan x="25" dy="0">• Motor IA calcula automaticamente conforme a norma AS/NZS 1680.</tspan>
                <tspan x="25" dy="28">• Entrada tátil em 3 passos: Ambiente, Medidas (C x L x H) e Estilo.</tspan>
                <tspan x="25" dy="28">• Recomendação Tripla Glow: Best Match, Premium e Econômica.</tspan>
                <tspan x="25" dy="28">• Geração instantânea de Memorial Descritivo em PDF profissional.</tspan>
                <tspan x="25" dy="28">• Envio de cotação oficial (RFQ) direto para o comercial da fábrica.</tspan>
            </text>
        </g>

        <!-- Sticky Note 3: Personas (Purple FigJam Sticky) -->
        <g transform="translate(1540, 80)">
            <rect width="700" height="340" rx="16" fill="#E9D5FF" filter="url(#card-shadow)"/>
            <rect x="25" y="25" width="100" height="26" rx="13" fill="#A855F7"/>
            <text x="75" y="42" text-anchor="middle" font-size="11" font-weight="800" fill="#581C87">USUÁRIOS</text>
            <text x="25" y="80" font-size="20" font-weight="800" fill="#581C87">Quem se Beneficia do App?</text>
            <text x="25" y="115" class="card-body">
                <tspan x="25" dy="0"><tspan font-weight="700">👤 Arquitetos &amp; Lighting Designers:</tspan> Agilidade na obra e PDF técnico.</tspan>
                <tspan x="25" dy="28"><tspan font-weight="700">👤 Eletricistas &amp; Construtores:</tspan> Quantitativo exato de peças e fiação.</tspan>
                <tspan x="25" dy="28"><tspan font-weight="700">👤 Clientes Finais (B2C):</tspan> Certeza de iluminação bonita e confortável.</tspan>
                <tspan x="25" dy="28"><tspan font-weight="700">🏭 Equipe Comercial QLS:</tspan> RFQs prontos para fechar pedidos em minutos.</tspan>
            </text>
        </g>
    </g>

    <!-- SECTION 2: MAPA DE NAVEGAÇÃO & ESTRUTURA DE PÁGINAS -->
    <g transform="translate(60, 740)">
        <rect width="2280" height="660" rx="24" fill="#FFFFFF" filter="url(#card-shadow)"/>
        <text x="40" y="50" class="section-title">🗺️ 2. Estrutura de Navegação &amp; Arquitetura de Telas</text>
        <text x="40" y="80" class="subtitle">Hierarquia em 4 Bottom Tabs com fluxo Guest-First (sem barreira de login inicial)</text>

        <!-- Tab 1 Card (Blue) -->
        <g transform="translate(40, 110)">
            <rect width="520" height="510" rx="18" fill="#EFF6FF" stroke="#3B82F6" stroke-width="2"/>
            <rect x="25" y="25" width="120" height="28" rx="14" fill="#3B82F6"/>
            <text x="85" y="44" text-anchor="middle" font-size="12" font-weight="800" fill="#FFFFFF">TAB 1 • HOME</text>
            <text x="25" y="85" font-size="20" font-weight="800" fill="#1E3A8A">📁 Workspace Projetos</text>
            <text x="25" y="125" class="card-body">
                <tspan x="25" dy="0"><tspan font-weight="700">• Tela Principal:</tspan> Cards de projetos ativos</tspan>
                <tspan x="25" dy="24">• Resumo de potência e eficiência (W/m²)</tspan>
                <tspan x="25" dy="24">• Status do RFQ (Em Análise, Aprovado)</tspan>
                <tspan x="25" dy="24">• Botão Flutuante [+ Novo Projeto]</tspan>
                <tspan x="25" dy="32"><tspan font-weight="700">↳ Modal Novo Projeto:</tspan></tspan>
                <tspan x="25" dy="22">   Nome, Endereço, Tipo de Edificação</tspan>
                <tspan x="25" dy="32"><tspan font-weight="700">↳ Painel Consolidado do Projeto:</tspan></tspan>
                <tspan x="25" dy="22">   Lista de Cômodos + Total de Peças</tspan>
                <tspan x="25" dy="22">   [📄 Gerar Memorial PDF Editorial]</tspan>
                <tspan x="25" dy="22">   [🚀 Solicitar Cotação Oficial RFQ]</tspan>
            </text>
        </g>

        <!-- Tab 2 Card (Gold - Core Engine) -->
        <g transform="translate(590, 110)">
            <rect width="550" height="510" rx="18" fill="#FFFBEB" stroke="#D97706" stroke-width="3" filter="url(#card-shadow)"/>
            <rect x="25" y="25" width="150" height="28" rx="14" fill="#D97706"/>
            <text x="100" y="44" text-anchor="middle" font-size="12" font-weight="800" fill="#FFFFFF">TAB 2 • CORE IA</text>
            <text x="25" y="85" font-size="20" font-weight="800" fill="#78350F">💡 Consultor com IA</text>
            <text x="25" y="125" class="card-body">
                <tspan x="25" dy="0"><tspan font-weight="700">• Wizard Tátil em 3 Passos:</tspan></tspan>
                <tspan x="25" dy="24">   1️⃣ <tspan font-weight="600">Ambiente:</tspan> Cozinha, Sala, Suíte, Office...</tspan>
                <tspan x="25" dy="24">   2️⃣ <tspan font-weight="600">Medidas:</tspan> Sliders de C x L x H + Teto</tspan>
                <tspan x="25" dy="24">       ↳ Cálculo em tempo real de Lux e Lúmens</tspan>
                <tspan x="25" dy="24">   3️⃣ <tspan font-weight="600">Estilo:</tspan> 2700K / 3000K / 4000K + UGR/IP</tspan>
                <tspan x="25" dy="32"><tspan font-weight="700">↳ Tela de Resultados (Tripla Recomendação):</tspan></tspan>
                <tspan x="25" dy="22">   ⭐ <tspan font-weight="600">Best Match IA:</tspan> Luminária perfeita calibrada</tspan>
                <tspan x="25" dy="22">   💎 <tspan font-weight="600">Premium Choice:</tspan> Alta arquitetura e conforto</tspan>
                <tspan x="25" dy="22">   💰 <tspan font-weight="600">Smart Eco:</tspan> Eficiência e melhor custo</tspan>
                <tspan x="25" dy="22">   ↳ Seletor de Acabamento &amp; Adicionar ao Projeto</tspan>
            </text>
        </g>

        <!-- Tab 3 Card (Green) -->
        <g transform="translate(1170, 110)">
            <rect width="520" height="510" rx="18" fill="#F0FDF4" stroke="#16A34A" stroke-width="2"/>
            <rect x="25" y="25" width="130" height="28" rx="14" fill="#16A34A"/>
            <text x="90" y="44" text-anchor="middle" font-size="12" font-weight="800" fill="#FFFFFF">TAB 3 • SHOWROOM</text>
            <text x="25" y="85" font-size="20" font-weight="800" fill="#14532D">📖 Catálogo Digital</text>
            <text x="25" y="125" class="card-body">
                <tspan x="25" dy="0"><tspan font-weight="700">• Grid de Luminárias com Efeito Glow</tspan></tspan>
                <tspan x="25" dy="24">• Filtros por Categoria e Aplicação</tspan>
                <tspan x="25" dy="24">• Busca instantânea por SKU ou Nome</tspan>
                <tspan x="25" dy="32"><tspan font-weight="700">↳ Tela de Detalhes do Produto:</tspan></tspan>
                <tspan x="25" dy="22">   • Simulador Visual de Temperatura (CCT)</tspan>
                <tspan x="25" dy="22">   • Especificações Técnicas (lm/W, IRC, UGR)</tspan>
                <tspan x="25" dy="22">   • Furo de Instalação (Cutout) e Drivers</tspan>
                <tspan x="25" dy="22">   • Download de Arquivo IES / Fotometria</tspan>
                <tspan x="25" dy="22">   • [Adicionar Luminária a um Projeto]</tspan>
            </text>
        </g>

        <!-- Tab 4 Card (Purple) -->
        <g transform="translate(1720, 110)">
            <rect width="520" height="510" rx="18" fill="#FAF5FF" stroke="#9333EA" stroke-width="2"/>
            <rect x="25" y="25" width="130" height="28" rx="14" fill="#9333EA"/>
            <text x="90" y="44" text-anchor="middle" font-size="12" font-weight="800" fill="#FFFFFF">TAB 4 • CLIENTE</text>
            <text x="25" y="85" font-size="20" font-weight="800" fill="#581C87">👤 Minha Conta &amp; RFQs</text>
            <text x="25" y="125" class="card-body">
                <tspan x="25" dy="0"><tspan font-weight="700">• Perfil do Usuário &amp; Empresa</tspan></tspan>
                <tspan x="25" dy="24">• Histórico de Propostas Solicitadas</tspan>
                <tspan x="25" dy="32"><tspan font-weight="700">↳ Linha do Tempo da Cotação:</tspan></tspan>
                <tspan x="25" dy="22">   1. RFQ Enviado à Fábrica</tspan>
                <tspan x="25" dy="22">   2. Em Análise de Engenharia</tspan>
                <tspan x="25" dy="22">   3. Proposta com Preços Especiais</tspan>
                <tspan x="25" dy="22">   4. Pedido Faturado / Em Envio</tspan>
                <tspan x="25" dy="32"><tspan font-weight="700">• Suporte Especializado QLS:</tspan></tspan>
                <tspan x="25" dy="22">   Botão direto para WhatsApp da Engenharia</tspan>
            </text>
        </g>
    </g>

    <!-- SECTION 3: WIREFRAME VISUAL DO CONSULTOR (CORE UX) -->
    <g transform="translate(60, 1440)">
        <rect width="2280" height="660" rx="24" fill="#111827" filter="url(#card-shadow)"/>
        <text x="40" y="50" font-size="24" font-weight="800" fill="#FBBF24">📐 3. Wireframe Estrutural: Fluxo da Função Central (Consultor IA)</text>
        <text x="40" y="80" font-size="15" fill="#9CA3AF">Interface tátil e intuitiva com cálculo em tempo real e tripla recomendação com iluminação simulada</text>

        <!-- Step 1 Mobile Mockup -->
        <g transform="translate(40, 110)">
            <rect width="510" height="510" rx="20" fill="#1F2937" stroke="#374151" stroke-width="2"/>
            <rect x="20" y="20" width="120" height="24" rx="12" fill="#F59E0B"/>
            <text x="80" y="36" text-anchor="middle" font-size="11" font-weight="800" fill="#78350F">PASSO 1 DE 3</text>
            <text x="20" y="75" font-size="18" font-weight="800" fill="#FFFFFF">Tipo de Ambiente</text>
            <text x="20" y="100" font-size="13" fill="#9CA3AF">Selecione o espaço para aplicar a norma AS/NZS</text>
            
            <!-- Room Selection Tiles -->
            <rect x="20" y="125" width="225" height="75" rx="12" fill="#D97706" stroke="#FBBF24" stroke-width="2"/>
            <text x="35" y="155" font-size="16" font-weight="700" fill="#FFFFFF">🍳 Cozinha / Gourmet</text>
            <text x="35" y="180" font-size="12" fill="#FEF3C7">Norma: 240-300 Lux ✅</text>

            <rect x="265" y="125" width="225" height="75" rx="12" fill="#374151"/>
            <text x="280" y="155" font-size="16" font-weight="700" fill="#E5E7EB">🛋️ Sala de Estar</text>
            <text x="280" y="180" font-size="12" fill="#9CA3AF">Norma: 150-200 Lux</text>

            <rect x="20" y="215" width="225" height="75" rx="12" fill="#374151"/>
            <text x="35" y="245" font-size="16" font-weight="700" fill="#E5E7EB">🛏️ Suíte Master</text>
            <text x="35" y="270" font-size="12" fill="#9CA3AF">Norma: 100-150 Lux</text>

            <rect x="265" y="215" width="225" height="75" rx="12" fill="#374151"/>
            <text x="280" y="245" font-size="16" font-weight="700" fill="#E5E7EB">💻 Home Office</text>
            <text x="280" y="270" font-size="12" fill="#9CA3AF">Norma: 320-500 Lux</text>

            <!-- Bottom Button -->
            <rect x="20" y="440" width="470" height="48" rx="24" fill="url(#gold-grad)"/>
            <text x="255" y="470" text-anchor="middle" font-size="15" font-weight="700" fill="#111827">Avançar para Dimensões →</text>
        </g>

        <!-- Step 2 Mobile Mockup -->
        <g transform="translate(580, 110)">
            <rect width="520" height="510" rx="20" fill="#1F2937" stroke="#374151" stroke-width="2"/>
            <rect x="20" y="20" width="120" height="24" rx="12" fill="#F59E0B"/>
            <text x="80" y="36" text-anchor="middle" font-size="11" font-weight="800" fill="#78350F">PASSO 2 DE 3</text>
            <text x="20" y="75" font-size="18" font-weight="800" fill="#FFFFFF">Medidas do Cômodo</text>
            
            <text x="20" y="115" font-size="14" fill="#E5E7EB">Comprimento: <tspan font-weight="700" fill="#FBBF24">4.50 metros</tspan></text>
            <rect x="20" y="130" width="480" height="8" rx="4" fill="#374151"/>
            <rect x="20" y="130" width="260" height="8" rx="4" fill="#F59E0B"/>
            <circle cx="280" cy="134" r="10" fill="#FBBF24"/>

            <text x="20" y="175" font-size="14" fill="#E5E7EB">Largura: <tspan font-weight="700" fill="#FBBF24">3.20 metros</tspan></text>
            <rect x="20" y="190" width="480" height="8" rx="4" fill="#374151"/>
            <rect x="20" y="190" width="200" height="8" rx="4" fill="#F59E0B"/>
            <circle cx="220" cy="194" r="10" fill="#FBBF24"/>

            <text x="20" y="235" font-size="14" fill="#E5E7EB">Pé-Direito: <tspan font-weight="700" fill="#FBBF24">2.80 metros</tspan></text>
            <rect x="20" y="250" width="480" height="8" rx="4" fill="#374151"/>
            <rect x="20" y="250" width="160" height="8" rx="4" fill="#F59E0B"/>
            <circle cx="180" cy="254" r="10" fill="#FBBF24"/>

            <!-- Real-time feedback box -->
            <rect x="20" y="285" width="480" height="130" rx="14" fill="#111827" stroke="#F59E0B" stroke-dasharray="4 4"/>
            <text x="35" y="315" font-size="13" font-weight="700" fill="#FBBF24">📊 CÁLCULO LUMINOTÉCNICO EM TEMPO REAL:</text>
            <text x="35" y="345" font-size="13" fill="#E5E7EB">• Área Total: 14.40 m² | Índice do Recinto (K): 1.05</text>
            <text x="35" y="370" font-size="13" fill="#E5E7EB">• Meta Norma AS/NZS 1680: 300 Lux</text>
            <text x="35" y="395" font-size="13" fill="#E5E7EB">• Fluxo Total Requerido: ~6.000 Lúmens</text>

            <rect x="20" y="440" width="480" height="48" rx="24" fill="url(#gold-grad)"/>
            <text x="260" y="470" text-anchor="middle" font-size="15" font-weight="700" fill="#111827">Avançar para Estilo de Luz →</text>
        </g>

        <!-- Step 3 Mobile Mockup -->
        <g transform="translate(1130, 110)">
            <rect width="520" height="510" rx="20" fill="#1F2937" stroke="#374151" stroke-width="2"/>
            <rect x="20" y="20" width="120" height="24" rx="12" fill="#F59E0B"/>
            <text x="80" y="36" text-anchor="middle" font-size="11" font-weight="800" fill="#78350F">PASSO 3 DE 3</text>
            <text x="20" y="75" font-size="18" font-weight="800" fill="#FFFFFF">Temperatura &amp; Estilo</text>
            
            <rect x="20" y="105" width="480" height="65" rx="12" fill="#D97706" stroke="#FBBF24" stroke-width="2"/>
            <text x="35" y="132" font-size="15" font-weight="700" fill="#FFFFFF">✨ 3000K — Warm White (Conforto Elegante)</text>
            <text x="35" y="155" font-size="12" fill="#FEF3C7">Tom acolhedor sofisticado. Padrão QLS.</text>

            <rect x="20" y="185" width="480" height="65" rx="12" fill="#374151"/>
            <text x="35" y="212" font-size="15" font-weight="700" fill="#E5E7EB">🕯️ 2700K — Ultra Warm (Relaxamento)</text>
            <text x="35" y="235" font-size="12" fill="#9CA3AF">Luz intimista ideal para dormitórios e lounges.</text>

            <rect x="20" y="265" width="480" height="65" rx="12" fill="#374151"/>
            <text x="35" y="292" font-size="15" font-weight="700" fill="#E5E7EB">🔬 4000K — Neutral White (Alta Fidelidade)</text>
            <text x="35" y="315" font-size="12" fill="#9CA3AF">Ideal para bancadas de trabalho e escritórios.</text>

            <rect x="20" y="345" width="480" height="70" rx="12" fill="#111827"/>
            <text x="35" y="375" font-size="13" fill="#FBBF24">Exigências Especiais:</text>
            <text x="35" y="400" font-size="13" fill="#E5E7EB">[x] UGR &lt; 19 Antiglare  |  [ ] IP65 Umidade</text>

            <rect x="20" y="440" width="480" height="48" rx="24" fill="url(#gold-grad)"/>
            <text x="260" y="470" text-anchor="middle" font-size="15" font-weight="700" fill="#111827">✨ Calcular Iluminação com IA</text>
        </g>

        <!-- Result Screen Mockup -->
        <g transform="translate(1680, 110)">
            <rect width="560" height="510" rx="20" fill="#1F2937" stroke="#F59E0B" stroke-width="3" filter="url(#card-shadow)"/>
            <rect x="20" y="20" width="160" height="24" rx="12" fill="#F59E0B"/>
            <text x="100" y="36" text-anchor="middle" font-size="11" font-weight="800" fill="#78350F">RESULTADO CALCULADO</text>
            
            <!-- Glow Effect Visual Box -->
            <rect x="20" y="60" width="520" height="150" rx="14" fill="#000000"/>
            <circle cx="260" cy="110" r="60" fill="url(#glow-circle)"/>
            <circle cx="260" cy="110" r="22" fill="#FFFFFF"/>
            <text x="260" y="185" text-anchor="middle" font-size="14" font-weight="800" fill="#FBBF24">AURORA DEEP ARCHITECTURAL 12W</text>

            <text x="20" y="235" font-size="13" font-weight="700" fill="#FBBF24">⭐ RECOMENDAÇÃO PRINCIPAL (BEST MATCH IA):</text>
            <text x="20" y="260" font-size="13" fill="#E5E7EB">• Quantidade Calculada: <tspan font-weight="700" fill="#FBBF24">6x Peças no Teto</tspan></text>
            <text x="20" y="282" font-size="13" fill="#E5E7EB">• Iluminância Entregue: <tspan font-weight="700" fill="#22C55E">312 Lux (Conforme AS/NZS 1680 ✅)</tspan></text>
            <text x="20" y="304" font-size="13" fill="#E5E7EB">• Lúmens: 1050 lm | IRC &gt; 92 | UGR &lt; 16 | Facho: 38°</text>
            <text x="20" y="326" font-size="13" fill="#E5E7EB">• Acabamento: [• Preto Fosco]  [ Branco ]  [ Ouro Latão ]</text>

            <rect x="20" y="350" width="520" height="65" rx="10" fill="#111827"/>
            <text x="35" y="375" font-size="12" fill="#9CA3AF">Opções Alternativas Disponíveis:</text>
            <text x="35" y="398" font-size="12" fill="#E5E7EB">💎 Linha Premium (Darklight)  |  💰 Linha Eco (Slim 9W)</text>

            <rect x="20" y="440" width="520" height="48" rx="24" fill="url(#gold-grad)"/>
            <text x="280" y="470" text-anchor="middle" font-size="15" font-weight="700" fill="#111827">+ Selecionar &amp; Salvar no Projeto</text>
        </g>
    </g>

    <!-- SECTION 4: ROADMAP CRONOLÓGICO DE DESENVOLVIMENTO -->
    <g transform="translate(60, 2140)">
        <rect width="2280" height="580" rx="24" fill="#FFFFFF" filter="url(#card-shadow)"/>
        <text x="40" y="50" class="section-title">🗓️ 4. Roadmap Cronológico da Criação do App (Fases 1 a 6)</text>
        <text x="40" y="80" class="subtitle">Planejamento executivo de desenvolvimento ágil, testes e publicação nas App Stores</text>

        <!-- Sprint 1 -->
        <g transform="translate(40, 110)">
            <rect width="350" height="420" rx="16" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
            <rect x="20" y="20" width="100" height="24" rx="12" fill="#F59E0B"/>
            <text x="70" y="36" text-anchor="middle" font-size="11" font-weight="800" fill="#78350F">SPRINT 1</text>
            <text x="20" y="75" font-size="17" font-weight="800" fill="#78350F">Fundação &amp; Design</text>
            <text x="20" y="115" class="card-body">
                <tspan x="20" dy="0">• Paleta QLS Gold &amp; Dark</tspan>
                <tspan x="20" dy="24">• Tipografia Urbanist</tspan>
                <tspan x="20" dy="24">• Primitivas UI (Button, Input)</tspan>
                <tspan x="20" dy="24">• GlowCard Component</tspan>
                <tspan x="20" dy="24">• Badges de Conformidade</tspan>
            </text>
        </g>

        <!-- Sprint 2 -->
        <g transform="translate(420, 110)">
            <rect width="350" height="420" rx="16" fill="#EFF6FF" stroke="#3B82F6" stroke-width="2"/>
            <rect x="20" y="20" width="100" height="24" rx="12" fill="#3B82F6"/>
            <text x="70" y="36" text-anchor="middle" font-size="11" font-weight="800" fill="#FFFFFF">SPRINT 2</text>
            <text x="20" y="75" font-size="17" font-weight="800" fill="#1E3A8A">Motor IA &amp; Catálogo</text>
            <text x="20" y="115" class="card-body">
                <tspan x="20" dy="0">• Regras AS/NZS 1680</tspan>
                <tspan x="20" dy="24">• Fórmulas Físicas de Lux</tspan>
                <tspan x="20" dy="24">• Índice do Recinto (K)</tspan>
                <tspan x="20" dy="24">• Seed do Catálogo QLS</tspan>
                <tspan x="20" dy="24">• Algoritmo de Tripla Escolha</tspan>
            </text>
        </g>

        <!-- Sprint 3 -->
        <g transform="translate(800, 110)">
            <rect width="350" height="420" rx="16" fill="#F0FDF4" stroke="#16A34A" stroke-width="2"/>
            <rect x="20" y="20" width="100" height="24" rx="12" fill="#16A34A"/>
            <text x="70" y="36" text-anchor="middle" font-size="11" font-weight="800" fill="#FFFFFF">SPRINT 3</text>
            <text x="20" y="75" font-size="17" font-weight="800" fill="#14532D">Telas &amp; Navegação</text>
            <text x="20" y="115" class="card-body">
                <tspan x="20" dy="0">• Bottom Tabs + Stacks</tspan>
                <tspan x="20" dy="24">• Wizard do Consultor IA</tspan>
                <tspan x="20" dy="24">• Cards com Efeito Glow</tspan>
                <tspan x="20" dy="24">• Showroom &amp; Simulador CCT</tspan>
                <tspan x="20" dy="24">• Painel Consolidado</tspan>
            </text>
        </g>

        <!-- Sprint 4 -->
        <g transform="translate(1180, 110)">
            <rect width="350" height="420" rx="16" fill="#FAF5FF" stroke="#9333EA" stroke-width="2"/>
            <rect x="20" y="20" width="100" height="24" rx="12" fill="#9333EA"/>
            <text x="70" y="36" text-anchor="middle" font-size="11" font-weight="800" fill="#FFFFFF">SPRINT 4</text>
            <text x="20" y="75" font-size="17" font-weight="800" fill="#581C87">Backend &amp; Supabase</text>
            <text x="20" y="115" class="card-body">
                <tspan x="20" dy="0">• Tabelas PostgreSQL + RLS</tspan>
                <tspan x="20" dy="24">• Auth Guest-First</tspan>
                <tspan x="20" dy="24">• Gerador de Memorial PDF</tspan>
                <tspan x="20" dy="24">• Pipeline RFQ &amp; Webhooks</tspan>
                <tspan x="20" dy="24">• Storage de Datasheets</tspan>
            </text>
        </g>

        <!-- Sprint 5 -->
        <g transform="translate(1560, 110)">
            <rect width="350" height="420" rx="16" fill="#FFF7ED" stroke="#EA580C" stroke-width="2"/>
            <rect x="20" y="20" width="100" height="24" rx="12" fill="#EA580C"/>
            <text x="70" y="36" text-anchor="middle" font-size="11" font-weight="800" fill="#FFFFFF">SPRINT 5</text>
            <text x="20" y="75" font-size="17" font-weight="800" fill="#7C2D12">QA &amp; Validação</text>
            <text x="20" y="115" class="card-body">
                <tspan x="20" dy="0">• Testes Unitários de Lux</tspan>
                <tspan x="20" dy="24">• Testes E2E de Ponta a Ponta</tspan>
                <tspan x="20" dy="24">• Testes em Aparelhos Reais</tspan>
                <tspan x="20" dy="24">• Toque Mínimo 48px</tspan>
                <tspan x="20" dy="24">• Ajuste de Safe Areas</tspan>
            </text>
        </g>

        <!-- Sprint 6 -->
        <g transform="translate(1940, 110)">
            <rect width="300" height="420" rx="16" fill="#ECFDF5" stroke="#059669" stroke-width="2"/>
            <rect x="20" y="20" width="100" height="24" rx="12" fill="#059669"/>
            <text x="70" y="36" text-anchor="middle" font-size="11" font-weight="800" fill="#FFFFFF">SPRINT 6</text>
            <text x="20" y="75" font-size="17" font-weight="800" fill="#064E3B">Deploy &amp; Stores</text>
            <text x="20" y="115" class="card-body">
                <tspan x="20" dy="0">• Build EAS iOS &amp; Android</tspan>
                <tspan x="20" dy="24">• Apple TestFlight</tspan>
                <tspan x="20" dy="24">• Google Play Internal</tspan>
                <tspan x="20" dy="24">• Publicação Oficial</tspan>
                <tspan x="20" dy="24">• Suporte Comercial</tspan>
            </text>
        </g>
    </g>
</svg>'''
    return svg

def create_miro_json_and_svg():
    # Miro enterprise architecture board: frames, grid swimlanes, structured cards, classic Miro stickies
    miro_data = {
        "board": {
            "title": "QLS Lighting App — Enterprise Product Architecture & Roadmap",
            "description": "Consultor Luminotécnico com IA (AS/NZS 1680) + Catálogo Digital RFQ",
            "theme": "enterprise_blue",
            "frames": [
                {
                    "name": "Frame 1: Problem Definition & Value Proposition",
                    "bounds": {"x": 50, "y": 50, "width": 2300, "height": 480},
                    "widgets": [
                        {
                            "type": "sticky_note",
                            "color": "yellow",
                            "title": "Current Market Bottlenecks",
                            "content": "• Hours lost on manual Lumen/Lux calculations.\n• End-clients purchasing incorrect CCT/Glare fixtures.\n• High volume of redundant pre-sales technical support for factory.",
                            "x": 80, "y": 120, "width": 700, "height": 360
                        },
                        {
                            "type": "sticky_note",
                            "color": "green",
                            "title": "QLS Intelligent Solution",
                            "content": "• 3-Step Guided Lighting Consultant with AS/NZS 1680 Compliance.\n• Triple Option Glow Engine: Best Match, Premium & Eco.\n• Instant PDF Bill of Quantities & Direct Factory RFQ Pipeline.",
                            "x": 820, "y": 120, "width": 720, "height": 360
                        },
                        {
                            "type": "sticky_note",
                            "color": "violet",
                            "title": "Target Personas",
                            "content": "• B2B Specifiers (Architects, Lighting Designers, Electricians).\n• B2C Homeowners with room dimensions.\n• QLS Factory Sales & Engineering Teams.",
                            "x": 1580, "y": 120, "width": 720, "height": 360
                        }
                    ]
                },
                {
                    "name": "Frame 2: App Page Structure & Information Architecture",
                    "bounds": {"x": 50, "y": 570, "width": 2300, "height": 680},
                    "widgets": [
                        {
                            "type": "card",
                            "color": "blue",
                            "title": "Tab 1: Projects Workspace",
                            "content": "• Project Directory\n• Total Load & W/m² Efficiency\n• RFQ Status Badges\n• Quick New Project Modal\n• Consolidated Project BOM & PDF Generator",
                            "x": 80, "y": 660, "width": 520, "height": 520
                        },
                        {
                            "type": "card",
                            "color": "orange",
                            "title": "Tab 2: AI Lighting Consultant (Core)",
                            "content": "• Step 1: Room Selector (Kitchen, Living, Master, Office, Bath, Deck)\n• Step 2: Sliders (Length, Width, Height) + Realtime Lux feedback\n• Step 3: Color Temp (2700K / 3000K / 4000K) + UGR/IP\n• Recommendation Screen: Best Match, Premium, Smart Eco",
                            "x": 630, "y": 660, "width": 560, "height": 520
                        },
                        {
                            "type": "card",
                            "color": "green",
                            "title": "Tab 3: Digital Showroom",
                            "content": "• Glow-card Fixture Grid\n• Category Filters (Downlights, Pendants, Track, Linear)\n• Product Details with Interactive CCT Visualizer\n• IES Photometry & Datasheet Downloads",
                            "x": 1220, "y": 660, "width": 520, "height": 520
                        },
                        {
                            "type": "card",
                            "color": "purple",
                            "title": "Tab 4: Account & RFQs",
                            "content": "• Professional Profile\n• Order Tracking Timeline (Submitted -> In Review -> Formal Quote Ready)\n• Previous PDF Archive\n• Direct Factory Engineering WhatsApp Chat",
                            "x": 1770, "y": 660, "width": 520, "height": 520
                        }
                    ]
                },
                {
                    "name": "Frame 3: Core Feature Wireframe (AI Lighting Wizard)",
                    "bounds": {"x": 50, "y": 1290, "width": 2300, "height": 680},
                    "widgets": [
                        {"type": "wireframe_step", "step": 1, "title": "Room Select", "content": "Kitchen / Gourmet (AS/NZS: 240-300 Lux Target)"},
                        {"type": "wireframe_step", "step": 2, "title": "Dimensions", "content": "4.5m x 3.2m x 2.8m (14.4m² -> ~6,000 Lumens Required)"},
                        {"type": "wireframe_step", "step": 3, "title": "CCT & Optics", "content": "3000K Warm White, UGR < 19 Antiglare"},
                        {"type": "wireframe_step", "step": 4, "title": "Calculated Result", "content": "6x Aurora Deep 12W Downlights (312 Lux Delivered - PASS)"}
                    ]
                },
                {
                    "name": "Frame 4: Chronological Delivery Roadmap",
                    "bounds": {"x": 50, "y": 2010, "width": 2300, "height": 620},
                    "widgets": [
                        {"sprint": 1, "name": "Sprint 1: Design Tokens & Primitives", "status": "Completed"},
                        {"sprint": 2, "name": "Sprint 2: AS/NZS 1680 Engine & Fixture Seed", "status": "In Progress"},
                        {"sprint": 3, "name": "Sprint 3: Navigation, Tabs & AI Wizard UI", "status": "Planned"},
                        {"sprint": 4, "name": "Sprint 4: Supabase Backend & PDF Service", "status": "Planned"},
                        {"sprint": 5, "name": "Sprint 5: QA, Unit Tests & Physical Device Tuning", "status": "Planned"},
                        {"sprint": 6, "name": "Sprint 6: EAS Build & Store Submissions", "status": "Planned"}
                    ]
                }
            ]
        }
    }
    
    # SVG representation of Miro Enterprise Board
    svg = '''<svg width="2400" height="2700" viewBox="0 0 2400 2700" fill="none" xmlns="http://www.w3.org/2000/svg" font-family="'Open Sans', 'Segoe UI', Helvetica, Arial, sans-serif">
    <defs>
        <filter id="miro-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.08"/>
        </filter>
    </defs>

    <!-- Miro Board Canvas -->
    <rect width="2400" height="2700" fill="#F4F5F7"/>

    <!-- MIRO BOARD TITLE BAR -->
    <g transform="translate(60, 40)">
        <rect width="2280" height="130" rx="12" fill="#050038" filter="url(#miro-shadow)"/>
        <!-- Miro Logo Tag -->
        <rect x="35" y="30" width="100" height="30" rx="6" fill="#FFD02F"/>
        <text x="85" y="51" text-anchor="middle" font-size="14" font-weight="900" fill="#050038">MIRO</text>
        <text x="155" y="52" font-size="26" font-weight="800" fill="#FFFFFF">QLS Lighting App — Enterprise Architecture &amp; Delivery Board</text>
        <text x="35" y="98" font-size="15" fill="#B3B9C4">Documento Estrutural Oficial para Validação de Engenharia, UX e Roadmap Cronológico</text>
    </g>

    <!-- FRAME 1: PROBLEM & VALUE PROPOSITION -->
    <g transform="translate(60, 200)">
        <!-- Miro Frame Container -->
        <rect width="2280" height="480" rx="12" fill="#FFFFFF" stroke="#D5D9E2" stroke-width="1.5" filter="url(#miro-shadow)"/>
        <rect x="25" y="15" width="220" height="30" rx="6" fill="#EBECF0"/>
        <text x="35" y="35" font-size="13" font-weight="700" fill="#42526E">FRAME 1: PROBLEM &amp; VALUE</text>
        <text x="25" y="75" font-size="22" font-weight="800" fill="#091E42">Visão Geral, Dores do Mercado &amp; Proposta de Valor</text>

        <!-- Sticky Note 1 (Yellow Classic Miro) -->
        <g transform="translate(35, 95)">
            <rect width="700" height="350" rx="8" fill="#FFF9B8" filter="url(#miro-shadow)"/>
            <text x="30" y="45" font-size="18" font-weight="800" fill="#172B4D">⚠️ Problemas que o App Resolve</text>
            <text x="30" y="85" font-size="14" fill="#172B4D" line-height="1.6">
                <tspan x="30" dy="0">1. Especificadores e designers perdem tempo com cálculos manuais.</tspan>
                <tspan x="30" dy="26">2. Clientes finais adquirem iluminárias incorretas (sem conformidade).</tspan>
                <tspan x="30" dy="26">3. Gargalos constantes no atendimento comercial da fábrica QLS.</tspan>
                <tspan x="30" dy="26">4. Falta de padronização nas normas australianas (AS/NZS 1680).</tspan>
                <tspan x="30" dy="26">5. Orçamentos demorados causam perda de leads qualificados.</tspan>
            </text>
        </g>

        <!-- Sticky Note 2 (Green Classic Miro) -->
        <g transform="translate(770, 95)">
            <rect width="720" height="350" rx="8" fill="#D5F692" filter="url(#miro-shadow)"/>
            <text x="30" y="45" font-size="18" font-weight="800" fill="#172B4D">✨ Solução &amp; Proposta de Valor QLS</text>
            <text x="30" y="85" font-size="14" fill="#172B4D">
                <tspan x="30" dy="0">1. Consultor Inteligente em 3 Etapas Rápidas e Táteis.</tspan>
                <tspan x="30" dy="26">2. Motor com Fórmulas Determinísticas AS/NZS 1680.</tspan>
                <tspan x="30" dy="26">3. Recomendação Tripla com Glow: Best Match, Premium e Eco.</tspan>
                <tspan x="30" dy="26">4. Memorial Descritivo em PDF instantâneo com quantitativo (BOM).</tspan>
                <tspan x="30" dy="26">5. Pipeline de RFQ com envio direto ao sistema comercial da fábrica.</tspan>
            </text>
        </g>

        <!-- Sticky Note 3 (Cyan/Violet Classic Miro) -->
        <g transform="translate(1525, 95)">
            <rect width="720" height="350" rx="8" fill="#A6CCF5" filter="url(#miro-shadow)"/>
            <text x="30" y="45" font-size="18" font-weight="800" fill="#091E42">👥 Perfis de Usuário &amp; Benefícios</text>
            <text x="30" y="85" font-size="14" fill="#091E42">
                <tspan x="30" dy="0"><tspan font-weight="700">• Especificador B2B:</tspan> Agilidade na obra e proposta em PDF profissional.</tspan>
                <tspan x="30" dy="26"><tspan font-weight="700">• Cliente Final B2C:</tspan> Segurança de comprar a quantidade e luz exatas.</tspan>
                <tspan x="30" dy="26"><tspan font-weight="700">• Fábrica QLS:</tspan> Automação total do funil de cotação e especificações.</tspan>
                <tspan x="30" dy="26"><tspan font-weight="700">• Eletricistas:</tspan> Informações claras de furação (cutout) e potência.</tspan>
            </text>
        </g>
    </g>

    <!-- FRAME 2: INFORMATION ARCHITECTURE & TABS -->
    <g transform="translate(60, 710)">
        <rect width="2280" height="660" rx="12" fill="#FFFFFF" stroke="#D5D9E2" stroke-width="1.5" filter="url(#miro-shadow)"/>
        <rect x="25" y="15" width="220" height="30" rx="6" fill="#EBECF0"/>
        <text x="35" y="35" font-size="13" font-weight="700" fill="#42526E">FRAME 2: APP STRUCTURE</text>
        <text x="25" y="75" font-size="22" font-weight="800" fill="#091E42">Estrutura de Páginas &amp; Arquitetura de Navegação</text>

        <!-- Tab 1 -->
        <g transform="translate(35, 95)">
            <rect width="530" height="520" rx="10" fill="#FFFFFF" stroke="#0052CC" stroke-width="2"/>
            <rect x="20" y="20" width="130" height="26" rx="4" fill="#0052CC"/>
            <text x="85" y="38" text-anchor="middle" font-size="12" font-weight="700" fill="#FFFFFF">TAB 1: PROJETOS</text>
            <text x="20" y="78" font-size="19" font-weight="800" fill="#091E42">📁 Workspace</text>
            <text x="20" y="115" font-size="14" fill="#172B4D">
                <tspan x="20" dy="0">• Listagem de Projetos do Usuário</tspan>
                <tspan x="20" dy="24">• Resumo de Carga Elétrica e Eficiência</tspan>
                <tspan x="20" dy="24">• Status de RFQ (Badges de Progresso)</tspan>
                <tspan x="20" dy="32"><tspan font-weight="700">Sub-Telas &amp; Modais:</tspan></tspan>
                <tspan x="20" dy="22">↳ Modal Novo Projeto (Nome, Local)</tspan>
                <tspan x="20" dy="22">↳ Painel Consolidado de Cômodos</tspan>
                <tspan x="20" dy="22">↳ Gerador de Memorial Descritivo (PDF)</tspan>
                <tspan x="20" dy="22">↳ Botão de Envio de Cotação (RFQ)</tspan>
            </text>
        </g>

        <!-- Tab 2 -->
        <g transform="translate(595, 95)">
            <rect width="550" height="520" rx="10" fill="#FFFBEB" stroke="#FF991F" stroke-width="2.5"/>
            <rect x="20" y="20" width="160" height="26" rx="4" fill="#FF991F"/>
            <text x="100" y="38" text-anchor="middle" font-size="12" font-weight="700" fill="#FFFFFF">TAB 2: CONSULTOR IA</text>
            <text x="20" y="78" font-size="19" font-weight="800" fill="#091E42">💡 Motor de Iluminação</text>
            <text x="20" y="115" font-size="14" fill="#172B4D">
                <tspan x="20" dy="0"><tspan font-weight="700">Wizard em 3 Passos Táteis:</tspan></tspan>
                <tspan x="20" dy="24">1️⃣ Seleção de Cômodo (Normas AS/NZS)</tspan>
                <tspan x="20" dy="24">2️⃣ Medidas (C x L x H) + Feedback em Tempo Real</tspan>
                <tspan x="20" dy="24">3️⃣ Temperatura de Cor (2700K / 3000K / 4000K)</tspan>
                <tspan x="20" dy="32"><tspan font-weight="700">Tela de Resultados com Glow:</tspan></tspan>
                <tspan x="20" dy="22">⭐ Recomendada (Best Match IA)</tspan>
                <tspan x="20" dy="22">💎 Premium (Alto Conforto UGR &lt; 16)</tspan>
                <tspan x="20" dy="22">💰 Econômica (Smart Cost)</tspan>
                <tspan x="20" dy="22">↳ Seletor de Acabamento &amp; Inclusão no Projeto</tspan>
            </text>
        </g>

        <!-- Tab 3 -->
        <g transform="translate(1175, 95)">
            <rect width="520" height="520" rx="10" fill="#FFFFFF" stroke="#00875A" stroke-width="2"/>
            <rect x="20" y="20" width="140" height="26" rx="4" fill="#00875A"/>
            <text x="90" y="38" text-anchor="middle" font-size="12" font-weight="700" fill="#FFFFFF">TAB 3: SHOWROOM</text>
            <text x="20" y="78" font-size="19" font-weight="800" fill="#091E42">📖 Catálogo Digital</text>
            <text x="20" y="115" font-size="14" fill="#172B4D">
                <tspan x="20" dy="0">• Grid de Luminárias com Efeito Glow</tspan>
                <tspan x="20" dy="24">• Filtros: Downlights, Pendentes, Fitas, Trilhos</tspan>
                <tspan x="20" dy="24">• Busca Instantânea por Nome ou SKU</tspan>
                <tspan x="20" dy="32"><tspan font-weight="700">Tela Detalhes do Produto:</tspan></tspan>
                <tspan x="20" dy="22">↳ Simulador Interativo de Kelvin (CCT)</tspan>
                <tspan x="20" dy="22">↳ Especificações de Engenharia QLS</tspan>
                <tspan x="20" dy="22">↳ Download de Arquivo IES / Fotometria</tspan>
                <tspan x="20" dy="22">↳ Botão [Adicionar ao Projeto]</tspan>
            </text>
        </g>

        <!-- Tab 4 -->
        <g transform="translate(1725, 95)">
            <rect width="520" height="520" rx="10" fill="#FFFFFF" stroke="#6554C0" stroke-width="2"/>
            <rect x="20" y="20" width="140" height="26" rx="4" fill="#6554C0"/>
            <text x="90" y="38" text-anchor="middle" font-size="12" font-weight="700" fill="#FFFFFF">TAB 4: MINHA CONTA</text>
            <text x="20" y="78" font-size="19" font-weight="800" fill="#091E42">👤 Perfil &amp; RFQs</text>
            <text x="20" y="115" font-size="14" fill="#172B4D">
                <tspan x="20" dy="0">• Dados Cadastrais Profissionais (B2B)</tspan>
                <tspan x="20" dy="24">• Histórico Completo de Cotações</tspan>
                <tspan x="20" dy="32"><tspan font-weight="700">Timeline da Cotação:</tspan></tspan>
                <tspan x="20" dy="22">1. RFQ Enviado à Fábrica</tspan>
                <tspan x="20" dy="22">2. Em Análise de Engenharia</tspan>
                <tspan x="20" dy="22">3. Proposta Emitida com Preços Especiais</tspan>
                <tspan x="20" dy="22">4. Pedido em Separação</tspan>
                <tspan x="20" dy="32">• Canal Direto WhatsApp com Engenharia</tspan>
            </text>
        </g>
    </g>

    <!-- FRAME 3: CORE FEATURE WIREFRAME -->
    <g transform="translate(60, 1400)">
        <rect width="2280" height="660" rx="12" fill="#091E42" stroke="#4C9AFF" stroke-width="1.5" filter="url(#miro-shadow)"/>
        <rect x="25" y="15" width="230" height="30" rx="6" fill="#172B4D"/>
        <text x="35" y="35" font-size="13" font-weight="700" fill="#4C9AFF">FRAME 3: CORE WIREFRAME</text>
        <text x="25" y="75" font-size="22" font-weight="800" fill="#FFFFFF">Wireframe Estrutural: Função Central do Consultor Luminotécnico</text>

        <!-- Step 1 Tile -->
        <g transform="translate(35, 95)">
            <rect width="520" height="520" rx="8" fill="#172B4D" stroke="#4C9AFF" stroke-width="1.5"/>
            <text x="25" y="45" font-size="17" font-weight="800" fill="#FFC400">PASSO 1: AMBIENTE</text>
            <text x="25" y="85" font-size="14" fill="#FFFFFF">
                <tspan x="25" dy="0">Selecione o cômodo:</tspan>
                <tspan x="25" dy="30">[🍳 Cozinha / Gourmet] -&gt; ATIVO</tspan>
                <tspan x="25" dy="20">Norma AS/NZS 1680: 240-300 Lux</tspan>
                <tspan x="25" dy="35">[🛋️ Sala de Estar]   [🛏️ Dormitório]</tspan>
                <tspan x="25" dy="30">[💻 Home Office]      [🚿 Banheiro]</tspan>
                <tspan x="25" dy="30">[🌿 Deck Externo]</tspan>
                <tspan x="25" dy="50">----------------------------------</tspan>
                <tspan x="25" dy="30">[ Botão: Avançar para Medidas -&gt; ]</tspan>
            </text>
        </g>

        <!-- Step 2 Tile -->
        <g transform="translate(585, 95)">
            <rect width="540" height="520" rx="8" fill="#172B4D" stroke="#4C9AFF" stroke-width="1.5"/>
            <text x="25" y="45" font-size="17" font-weight="800" fill="#FFC400">PASSO 2: DIMENSÕES TÁTEIS</text>
            <text x="25" y="85" font-size="14" fill="#FFFFFF">
                <tspan x="25" dy="0">Comprimento (C): [ 4.50 m ] ---o---</tspan>
                <tspan x="25" dy="30">Largura (L):     [ 3.20 m ] -----o-</tspan>
                <tspan x="25" dy="30">Pé-Direito (H):  [ 2.80 m ] --o----</tspan>
                <tspan x="25" dy="45">📊 FEEDBACK EM TEMPO REAL:</tspan>
                <tspan x="25" dy="25">• Área Calculada: 14.40 m²</tspan>
                <tspan x="25" dy="25">• Meta Norma: 300 Lux</tspan>
                <tspan x="25" dy="25">• Lúmens Necessários: ~6.000 lm</tspan>
                <tspan x="25" dy="45">----------------------------------</tspan>
                <tspan x="25" dy="30">[ Botão: Avançar para Estilo -&gt; ]</tspan>
            </text>
        </g>

        <!-- Step 3 Tile -->
        <g transform="translate(1155, 95)">
            <rect width="520" height="520" rx="8" fill="#172B4D" stroke="#4C9AFF" stroke-width="1.5"/>
            <text x="25" y="45" font-size="17" font-weight="800" fill="#FFC400">PASSO 3: ESTILO &amp; CCT</text>
            <text x="25" y="85" font-size="14" fill="#FFFFFF">
                <tspan x="25" dy="0">Escolha a Temperatura de Cor:</tspan>
                <tspan x="25" dy="30">(•) 3000K Warm White (Conforto)</tspan>
                <tspan x="25" dy="25">( ) 2700K Ultra Warm (Intimista)</tspan>
                <tspan x="25" dy="25">( ) 4000K Neutral White (Foco)</tspan>
                <tspan x="25" dy="40">Exigências Especiais:</tspan>
                <tspan x="25" dy="25">[x] UGR &lt; 19 Antiglare</tspan>
                <tspan x="25" dy="25">[ ] IP65 Resistência a Umidade</tspan>
                <tspan x="25" dy="45">----------------------------------</tspan>
                <tspan x="25" dy="30">[ ✨ Calcular Iluminação com IA ]</tspan>
            </text>
        </g>

        <!-- Result Tile -->
        <g transform="translate(1705, 95)">
            <rect width="540" height="520" rx="8" fill="#000000" stroke="#FFC400" stroke-width="2.5"/>
            <text x="25" y="45" font-size="17" font-weight="800" fill="#FFC400">RESULTADO: RECOMENDAÇÃO</text>
            <text x="25" y="85" font-size="14" fill="#FFFFFF">
                <tspan x="25" dy="0">[⭐ RECOMENDADA]  [💎 PREMIUM]  [💰 ECO]</tspan>
                <tspan x="25" dy="30"><tspan font-weight="700" fill="#FFC400">AURORA DEEP ARCHITECTURAL 12W</tspan></tspan>
                <tspan x="25" dy="25">• Quantidade Calculada: 6x Peças</tspan>
                <tspan x="25" dy="25">• Iluminância: 312 Lux (Conforme ✅)</tspan>
                <tspan x="25" dy="25">• 1050 lm | IRC &gt; 92 | UGR &lt; 16 | Facho 38°</tspan>
                <tspan x="25" dy="30">Acabamento: [• Preto]  [ Branco ]  [ Ouro ]</tspan>
                <tspan x="25" dy="45">+--------------------------------+</tspan>
                <tspan x="25" dy="25">|  [ + Selecionar Esta Opção ]   | (Gold)</tspan>
                <tspan x="25" dy="25">+--------------------------------+</tspan>
                <tspan x="25" dy="25">[ 📄 Ver Memorial ]  [ 🚀 Enviar RFQ ]</tspan>
            </text>
        </g>
    </g>

    <!-- FRAME 4: CHRONOLOGICAL ROADMAP -->
    <g transform="translate(60, 2090)">
        <rect width="2280" height="560" rx="12" fill="#FFFFFF" stroke="#D5D9E2" stroke-width="1.5" filter="url(#miro-shadow)"/>
        <rect x="25" y="15" width="220" height="30" rx="6" fill="#EBECF0"/>
        <text x="35" y="35" font-size="13" font-weight="700" fill="#42526E">FRAME 4: ROADMAP TIMELINE</text>
        <text x="25" y="75" font-size="22" font-weight="800" fill="#091E42">Cronograma Executivo de Desenvolvimento (Sprints 1 a 6)</text>

        <!-- Sprint Cards -->
        <g transform="translate(35, 95)">
            <rect width="350" height="420" rx="8" fill="#FFF0B3" stroke="#FFAB00" stroke-width="1.5"/>
            <text x="20" y="40" font-size="16" font-weight="800" fill="#172B4D">SPRINT 1: Fundação</text>
            <text x="20" y="80" font-size="13" fill="#172B4D">
                <tspan x="20" dy="0">• Paleta QLS Gold/Dark</tspan>
                <tspan x="20" dy="22">• Fonte Urbanist</tspan>
                <tspan x="20" dy="22">• Primitivas UI</tspan>
                <tspan x="20" dy="22">• GlowCard System</tspan>
                <tspan x="20" dy="22">• Badges Normativas</tspan>
            </text>
        </g>

        <g transform="translate(415, 95)">
            <rect width="350" height="420" rx="8" fill="#DEEBFF" stroke="#0052CC" stroke-width="1.5"/>
            <text x="20" y="40" font-size="16" font-weight="800" fill="#091E42">SPRINT 2: Motor IA</text>
            <text x="20" y="80" font-size="13" fill="#091E42">
                <tspan x="20" dy="0">• Normas AS/NZS 1680</tspan>
                <tspan x="20" dy="22">• Fórmulas Físicas de Lux</tspan>
                <tspan x="20" dy="22">• Índice do Recinto (K)</tspan>
                <tspan x="20" dy="22">• Catálogo Seed QLS</tspan>
                <tspan x="20" dy="22">• Tripla Recomendação</tspan>
            </text>
        </g>

        <g transform="translate(795, 95)">
            <rect width="350" height="420" rx="8" fill="#E3FCEF" stroke="#00875A" stroke-width="1.5"/>
            <text x="20" y="40" font-size="16" font-weight="800" fill="#006644">SPRINT 3: Telas UI</text>
            <text x="20" y="80" font-size="13" fill="#006644">
                <tspan x="20" dy="0">• Bottom Tabs Globais</tspan>
                <tspan x="20" dy="22">• Wizard 3 Passos</tspan>
                <tspan x="20" dy="22">• Cards com Glow</tspan>
                <tspan x="20" dy="22">• Showroom &amp; CCT Slider</tspan>
                <tspan x="20" dy="22">• Painel do Projeto</tspan>
            </text>
        </g>

        <g transform="translate(1175, 95)">
            <rect width="350" height="420" rx="8" fill="#EAE6FF" stroke="#6554C0" stroke-width="1.5"/>
            <text x="20" y="40" font-size="16" font-weight="800" fill="#403294">SPRINT 4: Backend</text>
            <text x="20" y="80" font-size="13" fill="#403294">
                <tspan x="20" dy="0">• Supabase PostgreSQL</tspan>
                <tspan x="20" dy="22">• Políticas RLS &amp; Auth</tspan>
                <tspan x="20" dy="22">• Gerador PDF Editorial</tspan>
                <tspan x="20" dy="22">• Pipeline de RFQs</tspan>
                <tspan x="20" dy="22">• Storage de Datasheets</tspan>
            </text>
        </g>

        <g transform="translate(1555, 95)">
            <rect width="350" height="420" rx="8" fill="#FFE380" stroke="#FF8B00" stroke-width="1.5"/>
            <text x="20" y="40" font-size="16" font-weight="800" fill="#BF2600">SPRINT 5: QA &amp; Testes</text>
            <text x="20" y="80" font-size="13" fill="#BF2600">
                <tspan x="20" dy="0">• Testes Unitários de Lux</tspan>
                <tspan x="20" dy="22">• Testes E2E de Ponta</tspan>
                <tspan x="20" dy="22">• Validação em Celulares</tspan>
                <tspan x="20" dy="22">• Toques Mínimos 48px</tspan>
                <tspan x="20" dy="22">• Safe Areas &amp; Haptics</tspan>
            </text>
        </g>

        <g transform="translate(1935, 95)">
            <rect width="310" height="420" rx="8" fill="#E3FCEF" stroke="#36B37E" stroke-width="1.5"/>
            <text x="20" y="40" font-size="16" font-weight="800" fill="#006644">SPRINT 6: Deploy</text>
            <text x="20" y="80" font-size="13" fill="#006644">
                <tspan x="20" dy="0">• Build EAS iOS/Android</tspan>
                <tspan x="20" dy="22">• Apple TestFlight</tspan>
                <tspan x="20" dy="22">• Google Play Internal</tspan>
                <tspan x="20" dy="22">• Lançamento Oficial</tspan>
                <tspan x="20" dy="22">• Suporte a Vendas</tspan>
            </text>
        </g>
    </g>
</svg>'''
    return miro_data, svg

def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 1. Generate Excalidraw
    excal_data = create_excalidraw()
    excal_path = os.path.join(root, "qls-app-architecture.excalidraw")
    with open(excal_path, "w", encoding="utf-8") as f:
        json.dump(excal_data, f, indent=2, ensure_ascii=False)
    print(f"Generated: {excal_path}")

    # 2. Generate FigJam (SVG + JSON)
    figjam_svg = create_figjam_svg()
    figjam_svg_path = os.path.join(root, "qls-app-architecture-figjam.svg")
    with open(figjam_svg_path, "w", encoding="utf-8") as f:
        f.write(figjam_svg)
    print(f"Generated: {figjam_svg_path}")

    figjam_json_path = os.path.join(root, "qls-app-architecture-figjam.json")
    figjam_data = {
        "format": "figjam",
        "title": "QLS Lighting App — FigJam Product Structure Board",
        "description": "FigJam Board export for QLS App Architecture, Navigation Flow & Chronological Roadmap",
        "svgFile": "qls-app-architecture-figjam.svg"
    }
    with open(figjam_json_path, "w", encoding="utf-8") as f:
        json.dump(figjam_data, f, indent=2, ensure_ascii=False)
    print(f"Generated: {figjam_json_path}")

    # 3. Generate Miro (JSON + SVG)
    miro_data, miro_svg = create_miro_json_and_svg()
    miro_json_path = os.path.join(root, "qls-app-architecture-miro.json")
    with open(miro_json_path, "w", encoding="utf-8") as f:
        json.dump(miro_data, f, indent=2, ensure_ascii=False)
    print(f"Generated: {miro_json_path}")

    miro_svg_path = os.path.join(root, "qls-app-architecture-miro.svg")
    with open(miro_svg_path, "w", encoding="utf-8") as f:
        f.write(miro_svg)
    print(f"Generated: {miro_svg_path}")

if __name__ == "__main__":
    main()
