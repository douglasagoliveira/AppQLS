# Plano de Execução & Tickets de Implementação (QLS Lighting App)

**Projeto:** QLS Lighting App (Consultor Luminotécnico com IA & Catálogo RFQ)  
**Status:** Em Andamento (Fases 1 a 4 Implementadas e Validadas)  
**Data:** 2026-10-08  
**Documento de Referência:** [`PROJECT_SPEC.md`](./PROJECT_SPEC.md)

---

## 📊 Status de Progresso dos Tickets

| Ticket | Descrição | Status |
| :--- | :--- | :--- |
| **`TICKET-01`** | Setup do Projeto Mobile Expo (React Native + TypeScript + NativeWind) | ✅ **Concluído** |
| **`TICKET-02`** | Modelagem do Banco de Dados & RLS no Supabase (`supabase/migrations/`) | ✅ **Concluído** |
| **`TICKET-03`** | Importador e Seed do Catálogo da Fábrica | ✅ **Concluído** (`src/lib/mockCatalog.ts`) |
| **`TICKET-04`** | Motor de Cálculo Luminotécnico Determinístico (Normas AS/NZS 1680) | ✅ **Concluído** (`src/lib/lightingEngine.ts`) |
| **`TICKET-05`** | Motor de Recomendação Tripla (Recomendada, Premium, Econômica) | ✅ **Concluído** (`src/lib/recommendationEngine.ts`) |
| **`TICKET-06`** | Navegação & Estado Global Guest-First (Zustand + AsyncStorage) | ✅ **Concluído** (`src/store/useProjectStore.ts`) |
| **`TICKET-07`** | Telas de Criação de Projeto & Ambientes (Medidas C x L x H) | ✅ **Concluído** (`src/app/room/new.tsx`) |
| **`TICKET-08`** | Tela de Seleção de Luminárias (3 Opções + Acabamentos) | ✅ **Concluído** (`src/app/room/recommendation.tsx`) |
| **`TICKET-09`** | Painel de Resumo Consolidado do Projeto (BOM & Métricas) | ✅ **Concluído** (`src/app/project/[id].tsx`) |
| **`TICKET-10`** | Autenticação Progressiva & Perfil do Solicitante | ✅ **Concluído** (`src/app/profile.tsx`) |
| **`TICKET-11`** | Gerador de Proposta Técnica Formal em PDF com Memorial | ✅ **Concluído** (`src/services/pdfService.ts`) |
| **`TICKET-12`** | Submissão de RFQ & Sincronização Supabase | ⏳ **Próximo** |
| **`TICKET-13`** | Testes E2E, Validação com Casos Reais & Build Final | ⏳ **A seguir** |
| **`TICKET-14`** | Setup de Bibliotecas Nativas (`expo-document-picker`, `expo-image-picker`) | ⏳ **Próximo** |
| **`TICKET-15`** | Serviço de IA Multimodal (`src/services/aiVisionService.ts` via Gemini Flash + Demo Fallback) | ⏳ **Próximo** |
| **`TICKET-16`** | Card de Upload do Projeto com IA & Seletor de Tipo (`src/app/project/[id].tsx`) | ⏳ **Próximo** |
| **`TICKET-17`** | Modal de Revisão & Ajuste Interativo dos Cômodos Detectados | ⏳ **Próximo** |
| **`TICKET-18`** | Botão 'Escanear Cômodo com IA' no Room Wizard (`src/components/RoomWizard.tsx`) | ⏳ **Próximo** |
| **`TICKET-19`** | Suíte de Testes Unitários da Integração e Cálculos de IA | ⏳ **Próximo** |
