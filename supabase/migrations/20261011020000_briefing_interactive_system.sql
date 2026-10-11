-- ==============================================================================
-- SISTEMA DE BRIEFING INTERATIVO QLS (MULTI-RESPONDENTE & TEMPLATES DINÂMICOS)
-- ==============================================================================

-- 1. Tabela de Templates
CREATE TABLE IF NOT EXISTS public.briefing_templates (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'mobile',
  icon TEXT DEFAULT 'smartphone',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Seções/Blocos do Template
CREATE TABLE IF NOT EXISTS public.briefing_template_sections (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES public.briefing_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0 NOT NULL,
  icon TEXT DEFAULT 'layers'
);

-- 3. Tabela de Perguntas do Template
CREATE TABLE IF NOT EXISTS public.briefing_template_questions (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES public.briefing_template_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  question_type TEXT NOT NULL DEFAULT 'text', -- 'choice', 'multi_choice', 'text', 'textarea', 'rating', 'budget_slider'
  options JSONB DEFAULT '[]'::jsonb,
  placeholder TEXT,
  is_required BOOLEAN DEFAULT true NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL
);

-- 4. Tabela de Projetos de Briefing
CREATE TABLE IF NOT EXISTS public.briefing_projects (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_company TEXT,
  template_id TEXT REFERENCES public.briefing_templates(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' NOT NULL, -- 'active', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Participantes / Submissões de Resposta
CREATE TABLE IF NOT EXISTS public.briefing_submissions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.briefing_projects(id) ON DELETE CASCADE,
  respondent_name TEXT NOT NULL,
  respondent_email TEXT NOT NULL,
  respondent_phone TEXT,
  respondent_role TEXT NOT NULL, -- 'Decisor Principal', 'Diretor de Marketing', 'Tech Lead / CTO', 'Financeiro', 'Arquiteto'
  status TEXT DEFAULT 'draft' NOT NULL, -- 'draft', 'completed'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  summary_notes TEXT
);

-- 6. Tabela de Respostas Pergunta a Pergunta
CREATE TABLE IF NOT EXISTS public.briefing_answers (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES public.briefing_submissions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.briefing_template_questions(id) ON DELETE CASCADE,
  answer_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_submission_question UNIQUE (submission_id, question_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ==============================================================================
ALTER TABLE public.briefing_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefing_template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefing_template_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefing_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefing_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefing_answers ENABLE ROW LEVEL SECURITY;

-- Templates (Leitura pública / anon)
DROP POLICY IF EXISTS "Permitir leitura de templates" ON public.briefing_templates;
CREATE POLICY "Permitir leitura de templates" ON public.briefing_templates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir escrita de templates" ON public.briefing_templates;
CREATE POLICY "Permitir escrita de templates" ON public.briefing_templates FOR ALL USING (true);

-- Seções
DROP POLICY IF EXISTS "Permitir leitura de seções" ON public.briefing_template_sections;
CREATE POLICY "Permitir leitura de seções" ON public.briefing_template_sections FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir escrita de seções" ON public.briefing_template_sections;
CREATE POLICY "Permitir escrita de seções" ON public.briefing_template_sections FOR ALL USING (true);

-- Perguntas
DROP POLICY IF EXISTS "Permitir leitura de perguntas" ON public.briefing_template_questions;
CREATE POLICY "Permitir leitura de perguntas" ON public.briefing_template_questions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir escrita de perguntas" ON public.briefing_template_questions;
CREATE POLICY "Permitir escrita de perguntas" ON public.briefing_template_questions FOR ALL USING (true);

-- Projetos
DROP POLICY IF EXISTS "Permitir acesso total a projetos" ON public.briefing_projects;
CREATE POLICY "Permitir acesso total a projetos" ON public.briefing_projects FOR ALL USING (true);

-- Submissões
DROP POLICY IF EXISTS "Permitir acesso total a submissions" ON public.briefing_submissions;
CREATE POLICY "Permitir acesso total a submissions" ON public.briefing_submissions FOR ALL USING (true);

-- Respostas
DROP POLICY IF EXISTS "Permitir acesso total a answers" ON public.briefing_answers;
CREATE POLICY "Permitir acesso total a answers" ON public.briefing_answers FOR ALL USING (true);

-- ==============================================================================
-- SEED INICIAL: TEMPLATES E PROJETO PADRÃO QLS LIGHTING
-- ==============================================================================

-- 1. Inserir Templates
INSERT INTO public.briefing_templates (id, slug, title, description, category, icon)
VALUES 
  ('tpl-mobile-app', 'app-mobile', 'Aplicativo Mobile & Plataforma Digital', 'Briefing completo para apps iOS & Android de alta performance e hardware/IoT.', 'mobile', 'smartphone'),
  ('tpl-saas-web', 'saas-web', 'Web App SaaS & Portal do Cliente', 'Ideal para plataformas em nuvem, dashboards analíticos e sistemas multi-tenant.', 'web', 'globe'),
  ('tpl-branding', 'branding-luxo', 'Identidade Visual & Branding Corporativo', 'Direcionamento estético de marcas premium, packaging e presença visual.', 'branding', 'award')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

-- 2. Inserir Seções do Template 'app-mobile'
INSERT INTO public.briefing_template_sections (id, template_id, title, description, order_index, icon)
VALUES
  ('sec-mob-1', 'tpl-mobile-app', 'Visão & Objetivos Estratégicos', 'Definição do propósito central do produto e impacto esperado no negócio.', 1, 'target'),
  ('sec-mob-2', 'tpl-mobile-app', 'Usuários & Proposta de Valor', 'Mapeamento do perfil de clientes e necessidades prioritárias.', 2, 'users'),
  ('sec-mob-3', 'tpl-mobile-app', 'Arquitetura & Conectividade Técnica', 'Especificação de integrações, hardware, IoT e sistemas de retaguarda.', 3, 'cpu'),
  ('sec-mob-4', 'tpl-mobile-app', 'Prazos, Orçamento & Expectativas', 'Alinhamento de cronograma, faixa orçamentária e referências estéticas.', 4, 'dollar-sign')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, order_index = EXCLUDED.order_index;

-- 3. Inserir Perguntas da Seção 1 (Visão & Objetivos)
INSERT INTO public.briefing_template_questions (id, section_id, title, subtitle, question_type, options, placeholder, is_required, order_index)
VALUES
  ('q-mob-1', 'sec-mob-1', 'Qual o objetivo principal deste produto digital?', 'Descreva a grande transformação que este aplicativo deve trazer para a empresa e seus clientes.', 'textarea', '[]'::jsonb, 'Ex: Permitir que arquitetos e engenheiros especifiquem e comprem luminárias QLS direto da obra com cálculo de lumens em tempo real.', true, 1),
  ('q-mob-2', 'sec-mob-1', 'Qual é o maior gargalo ou dor crítica no fluxo atual?', 'O que hoje mais toma tempo, gera erros ou faz a empresa perder oportunidades?', 'textarea', '[]'::jsonb, 'Ex: Processo manual via PDF e planilhas, demora no envio de orçamentos e falta de catálogo offline para a equipe de campo.', true, 2),
  ('q-mob-3', 'sec-mob-1', 'Em qual ambiente o produto deve operar prioritariamente?', 'Selecione a plataforma alvo para a primeira versão.', 'choice', '[
    {"label": "iOS (Apple App Store) & Android (Google Play)", "value": "native_both"},
    {"label": "Apenas iOS (iPhone & iPad)", "value": "ios_only"},
    {"label": "Apenas Android", "value": "android_only"},
    {"label": "Web App PWA (Acessível pelo navegador do celular e computador)", "value": "web_pwa"}
  ]'::jsonb, null, true, 3),
  ('q-mob-4', 'sec-mob-1', 'Qual o principal diferencial competitivo em relação aos concorrentes?', 'Por que o cliente ou parceiro vai preferir usar esta ferramenta em vez de qualquer outra?', 'text', '[]'::jsonb, 'Ex: Agilidade de especificação técnica, precisão fotométrica e suporte direto da fábrica.', true, 4)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, question_type = EXCLUDED.question_type, options = EXCLUDED.options;

-- 4. Inserir Perguntas da Seção 2 (Usuários & Proposta de Valor)
INSERT INTO public.briefing_template_questions (id, section_id, title, subtitle, question_type, options, placeholder, is_required, order_index)
VALUES
  ('q-mob-5', 'sec-mob-2', 'Quem são os usuários que mais utilizarão o aplicativo?', 'Selecione todos os perfis estratégicos previstos.', 'multi_choice', '[
    {"label": "Arquitetos e Lighting Designers", "value": "architects"},
    {"label": "Engenheiros Elétricos e Instaladores", "value": "engineers"},
    {"label": "Construtoras e Gestores de Obra", "value": "builders"},
    {"label": "Equipe Interna de Vendas e Representantes QLS", "value": "sales_team"},
    {"label": "Cliente Final Residencial / Corporativo", "value": "end_client"}
  ]'::jsonb, null, true, 1),
  ('q-mob-6', 'sec-mob-2', 'Quais módulos funcionais são inegociáveis para o MVP?', 'Marque as ferramentas que precisam estar ativas no primeiro lançamento.', 'multi_choice', '[
    {"label": "Catálogo Técnico com busca instantânea e filtros por ambiente", "value": "catalog"},
    {"label": "Calculadora Luminotécnica com conformidade AS/NZS 1680", "value": "calculator"},
    {"label": "Montador de Projetos por Cômodos e Ambientes", "value": "project_builder"},
    {"label": "Gerador de Ficha de Especificação e Orçamento em PDF", "value": "pdf_export"},
    {"label": "Visualizador de Luminárias em Realidade Aumentada (AR)", "value": "ar_viewer"},
    {"label": "Controle Inteligente de Luminárias via Bluetooth / Rede", "value": "smart_control"}
  ]'::jsonb, null, true, 2),
  ('q-mob-7', 'sec-mob-2', 'Qual a importância do funcionamento 100% Offline?', 'Avalie a necessidade do aplicativo abrir catálogos e orçamentos sem sinal de internet na obra.', 'choice', '[
    {"label": "Essencial (O usuário frequentemente está em subsolos ou obras sem sinal)", "value": "critical_offline"},
    {"label": "Desejável (Pode ter cache das últimas especificações)", "value": "desirable_offline"},
    {"label": "Baixa (Assume-se que o usuário terá conexão de dados ativa)", "value": "online_only"}
  ]'::jsonb, null, true, 3)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, question_type = EXCLUDED.question_type, options = EXCLUDED.options;

-- 5. Inserir Perguntas da Seção 3 (Arquitetura & Conectividade)
INSERT INTO public.briefing_template_questions (id, section_id, title, subtitle, question_type, options, placeholder, is_required, order_index)
VALUES
  ('q-mob-8', 'sec-mob-3', 'Haverá integração física com hardware ou sistemas de automação?', 'Marque as tecnologias de controle de iluminação que o app precisará suportar.', 'multi_choice', '[
    {"label": "Protocolo DALI / DALI-2 (Automação predial)", "value": "dali"},
    {"label": "Bluetooth Low Energy (BLE) / Casambi / Mesh", "value": "ble"},
    {"label": "Zigbee 3.0 / Matter", "value": "zigbee"},
    {"label": "Wi-Fi Cloud (Tuya / MQTT / Home Assistant)", "value": "wifi_cloud"},
    {"label": "Não haverá controle físico (Apenas software de especificação)", "value": "none"}
  ]'::jsonb, null, true, 1),
  ('q-mob-9', 'sec-mob-3', 'Qual sistema corporativo precisará ser integrado?', 'Identifique os bancos de dados ou ERPs que fornecerão estoque, preços ou cadastro.', 'choice', '[
    {"label": "Supabase / PostgreSQL (Banco próprio moderno em nuvem)", "value": "supabase"},
    {"label": "ERP Corporativo (SAP, Totvs, Bling ou similar via REST API)", "value": "custom_erp"},
    {"label": "Planilhas ou Google Sheets inicialmente", "value": "sheets"},
    {"label": "Nenhum no momento (Gerenciado 100% no painel próprio)", "value": "standalone"}
  ]'::jsonb, null, true, 2),
  ('q-mob-10', 'sec-mob-3', 'Qual o nível de conformidade de segurança e privacidade requerido?', 'Selecione os requisitos de autenticação e proteção.', 'choice', '[
    {"label": "Padrão Corporativo Seguro (Auth JWT, criptografia, RLS e backups diários)", "value": "standard_secure"},
    {"label": "Acesso Rápido sem Senha (Magic Link / SMS / WhatsApp OTP)", "value": "passwordless"},
    {"label": "Alta Segurança (MFA 2FA obrigatório, logs de auditoria detalhados)", "value": "high_security"}
  ]'::jsonb, null, true, 3)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, question_type = EXCLUDED.question_type, options = EXCLUDED.options;

-- 6. Inserir Perguntas da Seção 4 (Prazos, Orçamento & Expectativas)
INSERT INTO public.briefing_template_questions (id, section_id, title, subtitle, question_type, options, placeholder, is_required, order_index)
VALUES
  ('q-mob-11', 'sec-mob-4', 'Qual é a faixa de investimento orçada para esta fase do projeto?', 'O dimensionamento orçamentário direciona a profundidade tecnológica do MVP.', 'choice', '[
    {"label": "R$ 30.000 a R$ 50.000 (MVP Focado e Ágil)", "value": "range_30_50k"},
    {"label": "R$ 50.000 a R$ 100.000 (Solução Completa e Integrada)", "value": "range_50_100k"},
    {"label": "R$ 100.000 a R$ 200.000 (Plataforma Robusta com Hardware/IoT)", "value": "range_100_200k"},
    {"label": "Acima de R$ 200.000 (Ecossistema Multiplataforma Corporativo)", "value": "range_above_200k"}
  ]'::jsonb, null, true, 1),
  ('q-mob-12', 'sec-mob-4', 'Qual o prazo estimado ideal para o lançamento do MVP?', 'Horizonte esperado para início da operação com usuários reais.', 'choice', '[
    {"label": "Até 30 dias (Sprint de lançamento rápido)", "value": "30_days"},
    {"label": "60 a 90 dias (Desenvolvimento padrão com testes aprofundados)", "value": "60_90_days"},
    {"label": "4 a 6 meses (Escopo mais abrangente)", "value": "4_6_months"}
  ]'::jsonb, null, true, 2),
  ('q-mob-13', 'sec-mob-4', 'Quais referências de design ou produtos de tecnologia você mais admira?', 'Cite marcas, aplicativos ou estilos visuais que servem de inspiração para a identidade.', 'textarea', '[]'::jsonb, 'Ex: Apple, Bang & Olufsen, Linear.app, Tesla, Dyson. Linhas minimalistas, preto e dourado sofisticado.', true, 3),
  ('q-mob-14', 'sec-mob-4', 'Observações finais ou pontos de atenção críticos que não foram citados:', 'Compartilhe qualquer detalhe adicional fundamental para o sucesso do projeto.', 'textarea', '[]'::jsonb, 'Digite aqui qualquer comentário extra...', false, 4)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, question_type = EXCLUDED.question_type, options = EXCLUDED.options;

-- 7. Inserir Projeto Piloto QLS
INSERT INTO public.briefing_projects (id, slug, title, client_name, client_company, template_id, status)
VALUES
  ('proj-qls-app', 'qls-lighting-app', 'QLS Lighting Australia — App Mobile Oficial', 'Equipe Executiva & Stakeholders', 'QLS Lighting Australia Pty Ltd', 'tpl-mobile-app', 'active')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, client_name = EXCLUDED.client_name, template_id = EXCLUDED.template_id;
