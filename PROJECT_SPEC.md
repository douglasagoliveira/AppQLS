# Especificação Completa do Produto: Consultor Luminotécnico com IA (QLS Lighting App)

**Status:** Especificação Consolidada (Pós-Grilling)  
**Mercado-Alvo:** Austrália (Modelo B2B/B2C RFQ - *Request for Quote*)  
**Plataformas:** Mobile iOS e Android (React Native / Expo)  
**Backend & DB:** Supabase (PostgreSQL, Auth, Edge Functions, Storage)  
**Última Atualização:** 2026-10-08

---

## 1. Visão Geral e Proposta de Valor
Aplicativo mobile oficial da **QLS (Quantum Lighting Solutions)** — distribuidora e **revendedora oficial** de iluminação arquitetural na Austrália — que atua como um **consultor luminotécnico inteligente** e catálogo digital de alta conversão. A **QLS não é fabricante**: os produtos comercializados são fabricados pela **[LEDYi Lighting](https://www.ledyilighting.com/pt/)** (catálogo de referência de produtos).

O aplicativo elimina gargalos no processo de especificação técnica e orçamentos: o usuário (especificador B2B ou cliente final com projeto) cadastra seus projetos, insere as medidas dos ambientes e requisitos desejados, e o motor de IA calcula a iluminância conforme as normas australianas (**AS/NZS 1680**), dimensiona a quantidade de peças e recomenda o produto ideal do catálogo LEDYi revendido pela QLS, junto com 2 opções alternativas (Premium e Econômica). O resultado é uma **estimativa preliminar** (Método dos Lúmens), sujeita à validação técnica da QLS.

Ao finalizar, o sistema consolida o projeto completo em um **Memorial Descritivo e Estimativa Preliminar (RFQ Brief) em PDF** e registra o pedido de cotação (**RFQ**) direto na Área do Cliente e no sistema comercial da QLS. A **Proposta Comercial Formal** (preços, estoque, prazos) é emitida pela equipe comercial da QLS após validação técnica — o app nunca apresenta a estimativa como proposta fechada.

---

## 2. Perfis de Usuário (Público-Alvo)

1. **Especificadores B2B (Lighting Designers, Arquitetos, Eletricistas, Construtores):**
   - Criação ágil de projetos com múltiplos cômodos direto no canteiro de obras ou reuniões.
   - Geração instantânea de PDF profissional com quantitativo (BOM), especificações de lúmens/IRC/facho e fichas técnicas para anexar aos projetos executivos.

2. **Clientes Finais / B2C (com medidas do projeto):**
   - Inserção amigável de medidas e intenção de uso do ambiente.
   - Tradução automática de termos cotidianos para parâmetros técnicos de iluminação sem ruídos de comunicação.

---

## 3. Jornada do Usuário & Fluxos de Tela (Core UX)

O aplicativo oferece dois caminhos complementares para iniciar o dimensionamento luminotécnico:
1. **Caminho Primário (Upload com IA):** O usuário envia o projeto completo da residência (PDF, PNG, JPG ou print de prancha/cômodo). A IA interpreta o arquivo, dimensiona/quantifica a iluminação e abre o modal de revisão para confirmação.
2. **Caminho Secundário / Incremental (Cômodo a Cômodo):** Caso não tenha o projeto integral, o usuário adiciona cômodo por cômodo, podendo digitar as medidas manualmente ou usar o botão "Escanear Cômodo com IA" para preenchimento ágil.

```mermaid
flowchart TD
    A["Abertura do App (Acesso Imediato sem Login / Guest Mode)"] --> B["Criar Novo Projeto (ex: Residência Mosman)"]
    B --> C{"Possui arquivo do projeto?"}
    
    %% Fluxo Primário com IA
    C -- "Sim (PDF / Imagem / Print)" --> D1["Upload do Arquivo com IA"]
    D1 --> D2{"Tipo de Arquivo Selecionado"}
    D2 -- "Projeto Luminotécnico Existente" --> D3["IA: Leitura de Prancha, Legendas, Quantificação de Spots e Fitas"]
    D2 -- "Planta Arquitetônica (Cálculo do Zero)" --> D4["IA: Extração de Paredes, Metragens (C x L x H) + Cálculo AS/NZS 1680"]
    D4 --> D5["Opção: Incluir Fitas de LED de Efeito (Sancas, Cortineiros)"]
    D3 --> D6["Modal de Revisão Interativo: Conferir e Ajustar Ambientes Detectados"]
    D5 --> D6
    D6 --> I["Painel Consolidado do Projeto (Total de Peças, Carga W, BOM QLS)"]

    %% Fluxo Secundário Cômodo a Cômodo
    C -- "Não / Manual" --> E1["Adicionar Ambiente / Cômodo"]
    E1 --> E2{"Entrada de Medidas"}
    E2 -- "Digitação Manual" --> E3["Informar C x L x H e Tipo de Uso"]
    E2 -- "Escanear Cômodo com IA" --> E4["Upload de Foto/Planta do Cômodo -> Preenchimento Automático"]
    E4 --> E3
    E3 --> E5["Motor Luminotécnico: Cálculo de Lux Alvo (AS/NZS 1680) e Lúmens Totais"]
    E5 --> E6["Matching de Catálogo: Apresentação de 3 Opções (Recomendada, Premium, Econômica)"]
    E6 --> E7["Usuário Seleciona a Opção e Acabamento Desejado"]
    E7 --> E8{"Deseja Adicionar Mais Cômodos?"}
    E8 -- "Sim" --> E1
    E8 -- "Não / Finalizar" --> I

    %% RFQ & Proposta
    I --> J["Ação: Gerar Proposta PDF / Enviar RFQ"]
    J --> K["Autenticação Progressiva (Login / Cadastro Rápido se for Guest)"]
    K --> L["Proposta em PDF Gerada Instantaneamente + RFQ Salvo na Área do Cliente"]
```

---

## 4. Motor de IA & Cálculo Luminotécnico

### 4.1 Normas de Iluminância Aplicadas (AS/NZS 1680)
O sistema aplica os níveis de iluminância recomendados pelas normas australianas para cada tipo de ambiente:
* **Cozinhas e Áreas Gourmet:** 240 – 300 lux ($IRC \ge 80/90$)
* **Salas de Estar / Jantar:** 150 – 200 lux (2700K – 3000K)
* **Quartos / Dormitórios:** 100 – 150 lux (Luz quente / Conforto visual)
* **Home Office / Escritórios:** 320 – 500 lux ($UGR < 19$, 4000K neutro)
* **Banheiros / Lavabos:** 200 – 300 lux (Área do espelho/bancada: 400 lux, IP44/IP65)
* **Áreas Externas / Varandas:** 100 – 150 lux ($IP65/IP67$)

### 4.2 Fórmulas de Dimensionamento
1. **Área do Ambiente ($m^2$):** $A = C \times L$
2. **Índice do Recinto ($K$):** $K = \frac{C \times L}{h_{util} \times (C + L)}$
3. **Fluxo Luminoso Total ($\Phi_{total}$ em Lúmens):**
   $$\Phi_{total} = \frac{E_{alvo} \times A}{\mu \times d}$$
   *(onde $\mu \approx 0.60$ a $0.75$ é o fator de utilização e $d \approx 0.80$ é o fator de manutenção/depreciação).*
4. **Cálculo da Quantidade de Luminárias ($N$):**
   $$N = \left\lceil \frac{\Phi_{total}}{\text{Fluxo por Peça do SKU}} \right\rceil$$

### 4.3 Motor Multimodal de Visão com IA (Upload de Projetos e Pranchas)
O aplicativo integra o modelo **Google Gemini 2.0 / 1.5 Flash** para leitura visual direta de plantas baixas, desenhos técnicos e memoriais nos formatos PDF, PNG, JPG ou fotos/prints.
* **Modo A (Projeto Luminotécnico Existente):** Identifica símbolos luminotécnicos na prancha, tabela de legendas, circuitos e notas de projeto, quantificando peças pontuais (downlights, spots) e extensões lineares (fitas de LED, perfis), realizando o matching com SKUs correspondentes da QLS/LEDYi.
* **Modo B (Planta Arquitetônica para Cálculo do Zero):** Identifica os contornos e cotas dos ambientes, extraindo tipo de cômodo e dimensões ($C \times L \times H$). Aplica o cálculo determinístico da Seção 4.2 segundo as normas AS/NZS 1680 e permite incluir opcionalmente fitas de LED de efeito para sancas, cortineiros e bancadas.
* **Fluxo de Revisão Obrigatório:** Os dados extraídos não são persistidos às cegas; passam por um modal interativo de conferência onde o usuário valida metragens e produtos antes de confirmar no projeto.

---

## 5. Estrutura do Banco de Dados (Supabase / PostgreSQL)

```mermaid
erDiagram
    PROFILES ||--o{ PROJECTS : "possui"
    PROJECTS ||--o{ ROOMS : "contém"
    ROOMS ||--o{ ROOM_ITEMS : "seleciona"
    PRODUCTS ||--o{ ROOM_ITEMS : "referencia"
    PROJECTS ||--o{ RFQ_SUBMISSIONS : "gera"

    PROFILES {
        uuid id PK
        string full_name
        string company_name
        string email
        string phone
        string user_type
        timestamp created_at
    }

    PRODUCTS {
        uuid id PK
        string sku UK
        string name
        string category
        string mounting_type
        numeric lumens
        numeric power_watts
        numeric cct_kelvin
        numeric cri
        numeric beam_angle
        string ip_rating
        string dimming_type
        string finishes
        numeric base_price
        string image_url
        string datasheet_pdf_url
        boolean is_active
    }

    PROJECTS {
        uuid id PK
        uuid user_id FK
        string project_name
        string client_name
        string project_address
        string status
        numeric total_estimated_cost
        string generated_pdf_url
        timestamp created_at
    }

    ROOMS {
        uuid id PK
        uuid project_id FK
        string room_name
        string room_type
        numeric length_m
        numeric width_m
        numeric height_m
        numeric target_lux
        numeric required_lumens
        timestamp created_at
    }

    ROOM_ITEMS {
        uuid id PK
        uuid room_id FK
        uuid product_id FK
        string tier_type
        integer quantity
        string selected_finish
        numeric unit_price
        numeric subtotal
    }

    RFQ_SUBMISSIONS {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        string rfq_code
        string status
        text notes
        timestamp submitted_at
    }
```

---

## 6. Registro Completo de Decisões de Arquitetura (ADRs)

* **ADR-001 (Catálogo LEDYi revendido pela QLS):** Catálogo indexado e gerenciado via Supabase PostgreSQL, importado a partir do portfólio da LEDYi Lighting efetivamente comercializado pela QLS (SKUs validados com a QLS), com upload de datasheets em PDF para o Supabase Storage.
* **ADR-002 (Cálculo Luminotécnico Determinístico):** Quantidades e lúmens calculados deterministicamente pelo algoritmo luminotécnico calibrado pelas normas AS/NZS 1680, com assistência de IA para refinamento contextual.
* **ADR-003 (Entrada Estruturada de Medidas):** Entrada direta de medidas reais de projeto ($C \times L \times H$) por ambiente, evitando inconsistências de OCR.
* **ADR-004 (Modelo Comercial Australiano - RFQ):** Plataforma focada em geração de proposta e orçamento formal sem transação de checkout de varejo.
* **ADR-005 (Estrutura de Projeto Multi-Ambientes):** Projetos organizados por múltiplos cômodos com consolidação de lista de compras e memorial único.
* **ADR-006 (Recomendação Tripla por Ambiente):** Apresentação da Opção Recomendada + 2 Alternativas (Premium / Alto Conforto e Econômica).
* **ADR-007 (Plataforma Mobile iOS / Android):** Construído em **React Native com Expo Router** para experiência fluida nativa em iOS e Android.
* **ADR-008 (Progressive Profiling / Guest-First):** Criação e cálculo livres sem bloqueio de login; autenticação solicitada apenas ao gerar PDF, salvar projeto ou enviar RFQ.
* **ADR-009 (Backend & Storage Supabase):** PostgreSQL com Row Level Security (RLS), Supabase Auth para controle de acesso e Supabase Storage para armazenamento seguro de PDFs e imagens.
* **ADR-010 (Branding Oficial QLS):** Identidade visual, tipografia e paleta de cores proprietárias da QLS (distribuidora australiana).
* **ADR-011 (Modelo de Revenda LEDYi):** A QLS revende produtos fabricados pela LEDYi Lighting. Textos, PDFs e UI devem referir-se à "QLS" / "equipe comercial QLS", nunca a "fábrica".
* **ADR-012 (RFQ ≠ Proposta Formal):** O app gera RFQ + memorial preliminar; a proposta comercial formal é emitida pela QLS após validação (preço, estoque, prazo, compatibilidade).
* **ADR-013 (Kit Compatível):** Fitas LED só entram no RFQ acompanhadas de perfil, driver dimensionado e controle (ou marcados explicitamente como "a definir").
* **ADR-014 (Upload e Interpretação Multimodal com IA):** Suporte nativo à ingestão de arquivos (PDF, PNG, JPG, prints) para interpretação de pranchas completas ou plantas de cômodos via Gemini Flash. Distingue formalmente "Projeto Luminotécnico Existente" (extração de quantitativos) de "Planta Arquitetônica" (cálculo do zero via AS/NZS 1680), com etapa explícita de revisão pelo usuário antes de salvar.
