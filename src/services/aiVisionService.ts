import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { AUSTRALIAN_LIGHTING_STANDARDS } from '../lib/standards';
import { recommendRoomLighting } from '../lib/recommendationEngine';
import { PRODUCT_CATALOG } from '../lib/catalog';
import { buildKit } from '../lib/kitEngine';
import {
  AiAnalysisResult,
  AiDetectedProduct,
  AiDetectedRoom,
  AiPlanMode,
  RoomType,
  SelectedRoomItem,
} from '../types';

export interface SelectedFilePayload {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
  base64?: string;
}

/**
 * Permite selecionar arquivo de projeto em PDF ou Imagem.
 */
export async function pickProjectDocument(): Promise<SelectedFilePayload | null> {
  try {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (res.canceled || !res.assets || res.assets.length === 0) {
      return null;
    }

    const asset = res.assets[0];
    return {
      uri: asset.uri,
      name: asset.name || 'project-document.pdf',
      mimeType: asset.mimeType || (asset.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      size: asset.size,
    };
  } catch (err) {
    console.warn('[aiVisionService] DocumentPicker cancelled or failed:', err);
    return null;
  }
}

/**
 * Permite selecionar foto da prancha ou print da galeria.
 */
export async function pickProjectImage(): Promise<SelectedFilePayload | null> {
  try {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
      base64: true,
    });

    if (res.canceled || !res.assets || res.assets.length === 0) {
      return null;
    }

    const asset = res.assets[0];
    const fileName = asset.fileName || `blueprint-${Date.now()}.jpg`;
    return {
      uri: asset.uri,
      name: fileName,
      mimeType: asset.mimeType || 'image/jpeg',
      base64: asset.base64 || undefined,
      size: asset.fileSize,
    };
  } catch (err) {
    console.warn('[aiVisionService] ImagePicker cancelled or failed:', err);
    return null;
  }
}

/**
 * Lê o conteúdo do arquivo como string base64.
 */
async function getBase64Data(file: SelectedFilePayload): Promise<string> {
  if (file.base64 && file.base64.length > 50) {
    return file.base64;
  }
  return await FileSystem.readAsStringAsync(file.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

/**
 * Gera os dados de simulação/demonstração quando não houver chave de API configurada
 * ou para testes offline.
 */
function generateDemoExtraction(
  fileName: string,
  mode: AiPlanMode,
  includeLinearLighting: boolean
): AiAnalysisResult {
  const isExisting = mode === 'existing_plan';

  const demoRawRooms: Array<{
    name: string;
    type: RoomType;
    l: number;
    w: number;
    h: number;
    existingNotes?: string;
    stripMeters?: number;
  }> = [
    {
      name: 'Kitchen & Gourmet',
      type: 'kitchen',
      l: 4.8,
      w: 3.4,
      h: 2.7,
      existingNotes: isExisting ? '6x Downlights embutidos + 1x ponto pendente bancada' : undefined,
      stripMeters: includeLinearLighting ? 4.2 : 0,
    },
    {
      name: 'Living Room & Lounge',
      type: 'living_room',
      l: 6.2,
      w: 4.5,
      h: 2.8,
      existingNotes: isExisting ? '10x Downlights orientáveis + indicação de fita de sanca' : undefined,
      stripMeters: includeLinearLighting ? 6.0 : 0,
    },
    {
      name: 'Dining Area',
      type: 'dining_room',
      l: 4.0,
      w: 3.5,
      h: 2.7,
      existingNotes: isExisting ? '4x Spots recuados antiglare + ponto central' : undefined,
      stripMeters: 0,
    },
    {
      name: 'Master Suite & Bedroom',
      type: 'bedroom',
      l: 4.2,
      w: 3.8,
      h: 2.6,
      existingNotes: isExisting ? '4x Downlights 2700K conforto' : undefined,
      stripMeters: includeLinearLighting ? 3.5 : 0,
    },
    {
      name: 'Ensuite Bathroom',
      type: 'bathroom',
      l: 2.8,
      w: 2.2,
      h: 2.5,
      existingNotes: isExisting ? '2x Downlights IP65 + espelho iluminado' : undefined,
      stripMeters: 0,
    },
  ];

  const rooms: AiDetectedRoom[] = demoRawRooms.map((raw, idx) => {
    const std = AUSTRALIAN_LIGHTING_STANDARDS[raw.type] || AUSTRALIAN_LIGHTING_STANDARDS.living_room;
    const calc = recommendRoomLighting({
      roomName: raw.name,
      roomType: raw.type,
      length: raw.l,
      width: raw.w,
      height: raw.h,
    });

    const recommendedTier = calc.recommendedProducts.recommended;
    const prod = recommendedTier.product;

    const selectedItem: SelectedRoomItem = {
      id: `ai-item-${idx}-${Date.now()}`,
      product: prod,
      quantity: recommendedTier.quantity,
      selectedFinish: prod.finishes[0] || 'Black',
      tierType: 'recommended',
      unitPrice: prod.basePrice,
      subtotal: recommendedTier.totalCost,
      luxAchieved: recommendedTier.luxAchieved,
      kit: prod.category === 'strip' ? buildKit(prod, recommendedTier.quantity).lines : undefined,
    };

    const suggestedProducts: AiDetectedProduct[] = [
      {
        sku: prod.sku,
        name: prod.name,
        quantity: recommendedTier.quantity,
        unit: prod.unit === 'm' ? 'm' : 'pc',
        category: prod.category,
        reason: isExisting
          ? 'Equivalente QLS para os pontos de luz identificados no projeto'
          : `Dimensionado para atingir ${std.targetLux} Lux (norma AS/NZS 1680)`,
      },
    ];

    if (raw.stripMeters && raw.stripMeters > 0) {
      suggestedProducts.push({
        sku: 'LEDYI-REF-COB-24V-10W',
        name: 'COB LED Strip 24V · 10 W/m (dotless)',
        quantity: raw.stripMeters,
        unit: 'm',
        category: 'strip',
        reason: 'Iluminação linear de destaque para cortineiro/sanca arquitetural',
      });
    }

    return {
      id: `ai-room-${idx}-${Date.now()}`,
      roomName: raw.name,
      roomType: raw.type,
      length: raw.l,
      width: raw.w,
      height: raw.h,
      ceilingType: 'plasterboard',
      targetLux: std.targetLux,
      existingNotes: raw.existingNotes,
      includeLinearStrip: Boolean(raw.stripMeters && raw.stripMeters > 0),
      linearMeters: raw.stripMeters || 0,
      suggestedProducts,
      selectedProductTier: 'recommended',
      calculationResult: calc,
      selectedItem,
    };
  });

  return {
    mode,
    fileName,
    summary: isExisting
      ? `Projeto Luminotécnico interpretado com sucesso: 5 ambientes identificados e quantificados conforme símbolos da prancha.`
      : `Planta Arquitetônica analisada com sucesso: 5 ambientes identificados com cotas e cálculo luminotécnico gerado segundo a norma AS/NZS 1680.`,
    rooms,
    warnings: [
      'Modo de demonstração rápida: para análise via Gemini Flash em nuvem, configure EXPO_PUBLIC_GEMINI_API_KEY no arquivo .env.',
    ],
  };
}

/**
 * Constrói o prompt para a API Gemini de acordo com o modo selecionado.
 */
function buildGeminiPrompt(mode: AiPlanMode, includeLinearLighting: boolean): string {
  const isExisting = mode === 'existing_plan';

  return `
Você é um Engenheiro Luminotécnico e Arquiteto Especialista da QLS (Quantum Lighting Solutions, Austrália).
Sua missão é analisar o documento em anexo (planta arquitetônica ou prancha de projeto de iluminação) e extrair os ambientes e necessidades luminotécnicas.

MODO DE ANÁLISE: ${isExisting ? 'PROJETO LUMINOTÉCNICO EXISTENTE' : 'PLANTA ARQUITETÔNICA (CÁLCULO DO ZERO)'}
INCLUIR FITAS DE LED LINEARES: ${includeLinearLighting ? 'SIM (sancas, cortineiros, bancadas)' : 'NÃO (apenas luminárias gerais)'}

INSTRUÇÕES ESPECÍFICAS:
${
  isExisting
    ? `
- Identifique os ambientes representados (ex: Cozinha, Sala de Estar, Dormitório, Banheiro, etc.).
- Procure símbolos de luminárias (spots embutidos, trilhos, pendentes, arandelas, sancas/fitas de LED) e tabelas de legendas.
- Estime as dimensões de cada ambiente (comprimento, largura e pé-direito em metros).
- Descreva as luminárias existentes encontradas nas notas de cada ambiente.
`
    : `
- Identifique os ambientes representados na planta baixa e leia as cotas métricas (comprimento e largura em metros, pé-direito padrão 2.7m se não especificado).
- Classifique cada cômodo no tipo correspondente (kitchen, living_room, dining_room, bedroom, bathroom, home_office, outdoor_patio, commercial_office, retail).
`
}

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "summary": "Resumo executivo da leitura do projeto",
  "rooms": [
    {
      "roomName": "Nome do ambiente em português (ex: Cozinha & Gourmet)",
      "roomType": "kitchen | living_room | dining_room | bedroom | bathroom | home_office | outdoor_patio | commercial_office | retail",
      "length": 4.5,
      "width": 3.2,
      "height": 2.7,
      "ceilingType": "plasterboard | concrete | timber",
      "existingNotes": "Breve descrição dos pontos identificados no desenho",
      "linearMeters": 0.0
    }
  ]
}
`.trim();
}

/**
 * Analisa o projeto com o modelo Google Gemini Multimodal.
 * Se a chave não existir ou houver erro, ativa o fallback de demonstração elegante.
 */
export async function analyzeProjectPlan(
  file: SelectedFilePayload,
  mode: AiPlanMode,
  includeLinearLighting: boolean = true
): Promise<AiAnalysisResult> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    // Modo simulação / demo realista
    return generateDemoExtraction(file.name, mode, includeLinearLighting);
  }

  try {
    const base64Data = await getBase64Data(file);
    const prompt = buildGeminiPrompt(mode, includeLinearLighting);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: file.mimeType || 'application/pdf',
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.15,
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.warn('[aiVisionService] Gemini API call returned status:', response.status);
      const errText = await response.text();
      console.warn('[aiVisionService] Gemini API error body:', errText);
      // Fallback para não travar a experiência do usuário
      const fallback = generateDemoExtraction(file.name, mode, includeLinearLighting);
      fallback.warnings = [
        `Gemini API HTTP ${response.status}: Ativado modo demonstração realista para continuar o fluxo.`,
      ];
      return fallback;
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return generateDemoExtraction(file.name, mode, includeLinearLighting);
    }

    const parsed = JSON.parse(candidateText);
    const rawRooms = Array.isArray(parsed.rooms) ? parsed.rooms : [];

    if (rawRooms.length === 0) {
      return generateDemoExtraction(file.name, mode, includeLinearLighting);
    }

    const detectedRooms: AiDetectedRoom[] = rawRooms.map((r: any, idx: number) => {
      const type: RoomType = r.roomType || 'living_room';
      const l = Number(r.length) > 0 ? Number(r.length) : 4.0;
      const w = Number(r.width) > 0 ? Number(r.width) : 3.0;
      const h = Number(r.height) > 0 ? Number(r.height) : 2.7;

      const std = AUSTRALIAN_LIGHTING_STANDARDS[type] || AUSTRALIAN_LIGHTING_STANDARDS.living_room;
      const calc = recommendRoomLighting({
        roomName: r.roomName || std.label,
        roomType: type,
        length: l,
        width: w,
        height: h,
      });

      const recommendedTier = calc.recommendedProducts.recommended;
      const prod = recommendedTier.product;

      const selectedItem: SelectedRoomItem = {
        id: `ai-item-${idx}-${Date.now()}`,
        product: prod,
        quantity: recommendedTier.quantity,
        selectedFinish: prod.finishes[0] || 'Black',
        tierType: 'recommended',
        unitPrice: prod.basePrice,
        subtotal: recommendedTier.totalCost,
        luxAchieved: recommendedTier.luxAchieved,
        kit: prod.category === 'strip' ? buildKit(prod, recommendedTier.quantity).lines : undefined,
      };

      const suggestedProducts: AiDetectedProduct[] = [
        {
          sku: prod.sku,
          name: prod.name,
          quantity: recommendedTier.quantity,
          unit: prod.unit === 'm' ? 'm' : 'pc',
          category: prod.category,
          reason:
            mode === 'existing_plan'
              ? 'Correspondência de catálogo para os pontos identificados na prancha'
              : `Cálculo AS/NZS 1680 (Meta: ${std.targetLux} Lux)`,
        },
      ];

      const linearMeters = Number(r.linearMeters) || (includeLinearLighting ? 3.5 : 0);
      if (linearMeters > 0) {
        suggestedProducts.push({
          sku: 'LEDYI-REF-COB-24V-10W',
          name: 'COB LED Strip 24V · 10 W/m (dotless)',
          quantity: linearMeters,
          unit: 'm',
          category: 'strip',
          reason: 'Fita de LED para sanca ou cortineiro decorativo',
        });
      }

      return {
        id: `ai-room-${idx}-${Date.now()}`,
        roomName: r.roomName || std.label,
        roomType: type,
        length: l,
        width: w,
        height: h,
        ceilingType: r.ceilingType || 'plasterboard',
        targetLux: std.targetLux,
        existingNotes: r.existingNotes,
        includeLinearStrip: linearMeters > 0,
        linearMeters,
        suggestedProducts,
        selectedProductTier: 'recommended',
        calculationResult: calc,
        selectedItem,
      };
    });

    return {
      mode,
      fileName: file.name,
      summary: parsed.summary || 'Projeto analisado com sucesso pelo modelo Gemini Flash.',
      rooms: detectedRooms,
    };
  } catch (err: any) {
    console.warn('[aiVisionService] Analysis error, falling back to demo mode:', err);
    const fallback = generateDemoExtraction(file.name, mode, includeLinearLighting);
    fallback.warnings = [
      `Erro na chamada Gemini (${err?.message || 'rede'}): Exibindo demonstração para prosseguir.`,
    ];
    return fallback;
  }
}

/**
 * Escaneia uma imagem/cômodo único para o Room Wizard.
 */
export async function scanSingleRoomWithAi(file: SelectedFilePayload): Promise<{
  roomName: string;
  roomType: RoomType;
  length: number;
  width: number;
  height: number;
  ceilingType: string;
}> {
  const result = await analyzeProjectPlan(file, 'architectural_from_scratch', false);
  const first = result.rooms[0];
  if (!first) {
    return {
      roomName: 'Main Room',
      roomType: 'living_room',
      length: 4.5,
      width: 3.2,
      height: 2.7,
      ceilingType: 'plasterboard',
    };
  }
  return {
    roomName: first.roomName,
    roomType: first.roomType,
    length: first.length,
    width: first.width,
    height: first.height,
    ceilingType: first.ceilingType || 'plasterboard',
  };
}
