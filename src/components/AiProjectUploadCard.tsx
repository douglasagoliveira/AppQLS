import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Switch,
  View,
} from 'react-native';
import {
  Camera,
  CheckCircle2,
  FileText,
  FileUp,
  Image as ImageIcon,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { GlowCard, LuxuryButton, StandardsBadge, T } from './ui';
import { haptic } from '../lib/haptics';
import {
  analyzeProjectPlan,
  pickProjectDocument,
  pickProjectImage,
  SelectedFilePayload,
} from '../services/aiVisionService';
import { AiAnalysisResult, AiPlanMode } from '../types';
import { AiReviewModal } from './AiReviewModal';

interface AiProjectUploadCardProps {
  projectId: string;
  onImportComplete?: () => void;
}

export function AiProjectUploadCard({ projectId, onImportComplete }: AiProjectUploadCardProps) {
  const [mode, setMode] = useState<AiPlanMode>('existing_plan');
  const [includeLinearLighting, setIncludeLinearLighting] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleProcessFile = async (file: SelectedFilePayload) => {
    try {
      haptic.tick();
      setIsAnalyzing(true);
      setStatusMessage('Lendo arquivo e interpretando prancha com IA...');

      const result = await analyzeProjectPlan(file, mode, includeLinearLighting);

      haptic.success();
      setIsAnalyzing(false);
      setStatusMessage('');
      setAnalysisResult(result);
      setShowReviewModal(true);
    } catch (err: any) {
      setIsAnalyzing(false);
      setStatusMessage('');
      haptic.warning();
      Alert.alert('Erro na Análise', err?.message || 'Não foi possível analisar o arquivo enviado.');
    }
  };

  const handlePickDocument = async () => {
    haptic.light();
    const file = await pickProjectDocument();
    if (file) {
      await handleProcessFile(file);
    }
  };

  const handlePickImage = async () => {
    haptic.light();
    const file = await pickProjectImage();
    if (file) {
      await handleProcessFile(file);
    }
  };

  return (
    <>
      <GlowCard active tone="dark" className="p-4 mb-6 border border-[#d9b277]/30 bg-[#161616]">
        {/* Card Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-full bg-[#d9b277]/20 border border-[#d9b277]/40 items-center justify-center">
              <Sparkles size={16} color="#d9b277" />
            </View>
            <View>
              <T variant="eyebrow" className="text-[#d9b277]">
                UPLOAD INTELIGENTE COM IA
              </T>
              <T variant="h3" className="text-white text-base">
                Importar Projeto (PDF / Imagem)
              </T>
            </View>
          </View>

          <StandardsBadge label="GEMINI FLASH" highlight />
        </View>

        <T variant="muted" className="text-xs mb-4 leading-relaxed">
          Envie o PDF, foto ou print do seu projeto. A IA lê e interpreta as cotas e legendas,
          calculando as luminárias e fitas de LED recomendadas.
        </T>

        {/* Seletor de Tipo de Arquivo */}
        <T variant="caption" className="text-zinc-400 text-[10px] uppercase font-bold mb-2">
          1. Selecione o Tipo do seu Arquivo:
        </T>

        <View className="flex-row gap-2 mb-3">
          {/* Opção A: Projeto Luminotécnico Existente */}
          <Pressable
            onPress={() => {
              haptic.tick();
              setMode('existing_plan');
            }}
            className={`flex-1 p-3 rounded-[12px] border ${
              mode === 'existing_plan'
                ? 'bg-[#d9b277]/15 border-[#d9b277]'
                : 'bg-white/[0.04] border-white/10 active:border-white/20'
            }`}
          >
            <T
              variant="caption"
              className={`font-bold text-xs ${
                mode === 'existing_plan' ? 'text-[#d9b277]' : 'text-zinc-300'
              }`}
            >
              Projeto Luminotécnico
            </T>
            <T variant="caption" className="text-zinc-400 text-[10px] mt-1 leading-snug">
              Já possui pontos de luz/símbolos desenhados na prancha.
            </T>
          </Pressable>

          {/* Opção B: Planta Arquitetônica (Cálculo do Zero) */}
          <Pressable
            onPress={() => {
              haptic.tick();
              setMode('architectural_from_scratch');
            }}
            className={`flex-1 p-3 rounded-[12px] border ${
              mode === 'architectural_from_scratch'
                ? 'bg-[#d9b277]/15 border-[#d9b277]'
                : 'bg-white/[0.04] border-white/10 active:border-white/20'
            }`}
          >
            <T
              variant="caption"
              className={`font-bold text-xs ${
                mode === 'architectural_from_scratch' ? 'text-[#d9b277]' : 'text-zinc-300'
              }`}
            >
              Planta Arquitetônica
            </T>
            <T variant="caption" className="text-zinc-400 text-[10px] mt-1 leading-snug">
              Sem iluminação. A IA calcula tudo do zero via AS/NZS 1680.
            </T>
          </Pressable>
        </View>

        {/* Toggle de Iluminação Linear / Fitas de LED (apenas no modo cálculo do zero) */}
        {mode === 'architectural_from_scratch' && (
          <View className="p-3 mb-4 rounded-[12px] bg-white/[0.03] border border-white/5 flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <T variant="caption" className="text-white font-medium text-xs">
                Incluir fitas de LED de efeito
              </T>
              <T variant="caption" className="text-zinc-400 text-[10px]">
                Adiciona iluminação linear para cortineiros, bancadas ou sancas.
              </T>
            </View>
            <Switch
              value={includeLinearLighting}
              onValueChange={(val) => {
                haptic.tick();
                setIncludeLinearLighting(val);
              }}
              trackColor={{ false: '#262626', true: '#d9b277' }}
              thumbColor={includeLinearLighting ? '#000000' : '#888888'}
            />
          </View>
        )}

        {/* Loading State durante a análise */}
        {isAnalyzing ? (
          <View className="py-5 items-center justify-center bg-[#121212] rounded-[14px] border border-[#d9b277]/30">
            <ActivityIndicator size="small" color="#d9b277" />
            <T variant="bodyMd" className="text-white text-xs font-semibold mt-3">
              {statusMessage || 'Analisando projeto com IA...'}
            </T>
            <T variant="caption" className="text-zinc-400 text-[11px] mt-1 px-4 text-center">
              Lendo cômodos, cotas métricas e calculando o memorial luminotécnico...
            </T>
          </View>
        ) : (
          /* Botões de Ação de Upload */
          <View className="flex-row gap-2.5">
            <View className="flex-1">
              <LuxuryButton
                title="Subir PDF"
                variant="glow"
                icon={<FileUp size={16} color="#000" />}
                onPress={handlePickDocument}
              />
            </View>

            <View className="flex-1">
              <LuxuryButton
                title="Foto / Print"
                variant="outline"
                icon={<Camera size={16} color="#f4f2ee" />}
                onPress={handlePickImage}
              />
            </View>
          </View>
        )}
      </GlowCard>

      {/* Modal de Revisão Interativo */}
      <AiReviewModal
        visible={showReviewModal}
        analysisResult={analysisResult}
        projectId={projectId}
        onClose={() => setShowReviewModal(false)}
        onImportComplete={onImportComplete}
      />
    </>
  );
}
