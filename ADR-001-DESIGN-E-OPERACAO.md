# Decisão Arquitetural e Plano de Execução (ADR-001)

**Título:** Modernização Visual e Operacional do QLS Lighting App (Expo Mobile)  
**Status:** Proposto / Em Avaliação  
**Data:** 2026-10-13  
**Decisores:** Douglas & Antigravity  

---

## 1. Contexto & Problema
O **QLS Lighting App** possui especificações completas de engenharia e regras de negócio para cálculo luminotécnico australiano (**AS/NZS 1680**), fluxo de RFQ (*Request for Quote*) e integração com Supabase e PDF.

No entanto:
1. A interface atual do app React Native / Expo utiliza estilos genéricos escuros (`bg-dark-900`) e carece dos componentes de alto nível visual estabelecidos no [DESIGN_SPEC.md](file:///d:/AplicacoesWeb/qls-app/DESIGN_SPEC.md) (efeito de feixe de luz *GlowCard*, tipografia *Urbanist*, paleta dourada QLS `#c9a84c` / preta `#0a0a0a` e badges luminotécnicos).
2. As imagens do catálogo mock usam links externos genéricos que podem demorar a carregar ou quebrar sem conexão.
3. Precisamos garantir uma experiência tátil, fluida, 100% responsiva e com acabamento de showroom de iluminação arquitetural.

---

## 2. Decisão Arquitetural
1. **Design System & Primitivas Visuais:**
   - Criar diretório `src/components/ui/` contendo:
     - `GlowCard`: Container estilizado com gradiente sutil simulando feixe/reflexo de luz de luminária.
     - `LuxuryButton`: Botões pill-shaped com variantes Gold, Solid Black e Outline Glow.
     - `StandardsBadge`: Badge visual com indicador de conformidade AS/NZS 1680, IRC (CRI 90+ / 97+) e CCT (2700K / 3000K / 4000K).
     - `BeamPreview`: Componente visual interativo que simula graficamente a abertura de facho (`beamAngle` de 36°, 60°, 120°) e intensidade luminosa.
2. **Atualização das Telas Centrais:**
   - **`HomeScreen` (`src/app/index.tsx`)**: Reestruturação com hero imersivo com efeito luminotécnico, estatísticas rápidas, lista elegante de projetos recentes e modal de criação com feedback visual imediato.
   - **`NewRoomScreen` (`src/app/room/new.tsx`)**: Seletor de ambiente com chips visuais e valores de referência das normas australianas exibidos em tempo real.
   - **`RecommendationScreen` (`src/app/room/recommendation.tsx`)**: Os 3 cards de seleção (Recomendado, Premium Darklight e Econômico) redesenhados com os `GlowCards`, destaque dourado para a melhor escolha e gráfico de alcance de lux da norma.
   - **`ProjectDetailScreen` (`src/app/project/[id].tsx`)**: Resumo executivo do projeto, BOM (*Bill of Materials*) elegante, botões de ação com feedback de carregamento para exportação de PDF e envio de RFQ.
3. **Resiliência e Performance:**
   - Armazenamento offline-first persistido via Zustand + AsyncStorage.
   - Fallback gracioso para Supabase com modo convidado sem travas.

---

## 3. Glossário do Domínio

| Termo | Definição |
| :--- | :--- |
| **AS/NZS 1680** | Conjunto oficial de normas australianas e neozelandesas para iluminação interior e locais de trabalho. |
| **Lux ($lx$)** | Medida de iluminância ($1\ lux = 1\ lúmen/m^2$). Nível de luz incidindo sobre uma superfície. |
| **CCT (Correlat. Color Temp.)** | Temperatura de cor expressa em Kelvin (2700K = Branco Quente, 4000K = Branco Neutro). |
| **CRI / IRC** | Índice de Reprodução de Cor (0 a 100). Em iluminação arquitetural premium, busca-se $\ge 90$ ou $\ge 97$. |
| **UGR** | *Unified Glare Rating*. Índice de ofuscamento visual. Projetos de qualidade exigem $UGR < 19$. |
| **RFQ** | *Request for Quote* (Solicitação de Cotação enviada à equipe comercial da QLS para validação e emissão de proposta formal com produtos LEDYi). |
| **BOM** | *Bill of Materials* (Lista quantitativa e discriminada de peças do projeto). |

---

## 4. Plano Passo a Passo de Execução

- [x] **Etapa 1:** Instalar `@expo-google-fonts/urbanist`, `expo-linear-gradient` e `expo-haptics` e configurar tokens no `tailwind.config.js` (`ink`, `paper`, `glow`, `gold`).
- [x] **Etapa 2:** Criar primitivas de UI de alta fidelidade em `src/components/ui/` (`Typography`, `GlowCard`, `LuxuryButton`, `StandardsBadge`, `BeamPreview`).
- [x] **Etapa 3:** Redesenhar a **HomeScreen** (`src/app/index.tsx`) com hero idêntico ao site (`living.jpg`, overlay, tipografia Urbanist, chips técnicos de CCT/CRI/Dimming e seções *How it works* e *Workspace*).
- [x] **Etapa 4:** Redesenhar **NewRoomScreen** (`src/app/room/new.tsx`) com seletor refinado de ambientes, tipo de forro, dimensões dinâmicas e benchmarks AS/NZS 1680.
- [x] **Etapa 5:** Redesenhar **RecommendationScreen** (`src/app/room/recommendation.tsx`) com seletor cromático CCT (2700K / 3000K / 4000K), cards Glow de tripla escolha e simulação ótica de facho.
- [x] **Etapa 6:** Redesenhar **ProjectDetailScreen** (`src/app/project/[id].tsx`) com KPIs de carga e eficiência energética (W/m²), lista de espaços BOM e ações de RFQ e PDF.
- [x] **Etapa 7:** Redesenhar **ProfileScreen** (`src/app/profile.tsx`) com timeline das 4 etapas de RFQ e canais diretos de engenharia (WhatsApp / E-mail).
- [x] **Etapa 8:** Validação de tipos TypeScript (`npx tsc --noEmit`) sem erros.


