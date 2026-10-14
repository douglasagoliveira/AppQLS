import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertTriangle,
  Award,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Minus,
  Plus,
  Send,
  Sparkles,
  Tag,
  Zap,
} from 'lucide-react-native';
import { BeamPreview, GlowCard, LuxuryButton, StandardsBadge, T } from '../../components/ui';
import { haptic } from '../../lib/haptics';
import { recommendRoomLighting } from '../../lib/recommendationEngine';
import { calculateLuxAchieved } from '../../lib/lightingEngine';
import { buildKit, kitSubtotal } from '../../lib/kitEngine';
import { isContinuousSource } from '../../lib/catalog';
import { useProjectStore } from '../../store/useProjectStore';
import { cctToColor } from '../../theme/tokens';
import { ProductTier, Room, RoomPreferences, RoomType, SelectedRoomItem } from '../../types';

const CCT_OPTIONS = [
  { kelvin: 2700, label: '2700K Warm White', note: 'Ambiance & relaxation' },
  { kelvin: 3000, label: '3000K Soft White', note: 'QLS Architectural Standard' },
  { kelvin: 4000, label: '4000K Neutral White', note: 'Task focus & clarity' },
];

export default function RecommendationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    projectId: string;
    roomType: RoomType;
    roomName: string;
    length: string;
    width: string;
    height: string;
    ceilingType?: string;
    preferences?: string;
  }>();

  const { addOrUpdateRoom, ensureCurrentProject, currentProject } = useProjectStore();

  const lengthNum = parseFloat(params.length || '4.5');
  const widthNum = parseFloat(params.width || '3.2');
  const heightNum = parseFloat(params.height || '2.7');

  const preferences: Partial<RoomPreferences> | undefined = useMemo(() => {
    if (!params.preferences) return undefined;
    try {
      return JSON.parse(params.preferences);
    } catch {
      return undefined;
    }
  }, [params.preferences]);

  // Cálculo luminotécnico com preferências (Modo Guiado ou Profissional)
  const calcResult = useMemo(() => {
    return recommendRoomLighting({
      roomName: params.roomName || 'Custom Room',
      roomType: params.roomType || 'living_room',
      length: lengthNum,
      width: widthNum,
      height: heightNum,
      preferences,
    });
  }, [params.roomName, params.roomType, lengthNum, widthNum, heightNum, preferences]);

  // Nível selecionado (padrão: recommended)
  const [selectedTier, setSelectedTier] = useState<ProductTier>('recommended');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const currentTierData = calcResult.recommendedProducts[selectedTier];
  const [customQty, setCustomQty] = useState(currentTierData.quantity);
  const [selectedFinish, setSelectedFinish] = useState(
    currentTierData.product.finishes[0] || 'Standard'
  );
  const [activeCct, setActiveCct] = useState<number>(
    currentTierData.product.cctKelvin || 3000
  );

  const activeProduct = currentTierData.product;
  const isContinuous = isContinuousSource(activeProduct) || activeProduct.unit === 'm';

  // Kit compatível para fontes contínuas (fitas, neon, wall washer)
  const kitResult = useMemo(() => {
    if (!isContinuous) return null;
    const dimming = activeProduct.dimmingType === 'dali' ? 'dali' : activeProduct.dimmingType === 'triac' ? 'triac' : 'none';
    return buildKit(activeProduct, customQty, { dimming });
  }, [activeProduct, customQty, isContinuous]);

  const handleSelectTier = (tier: ProductTier) => {
    haptic.tick();
    setSelectedTier(tier);
    const tierData = calcResult.recommendedProducts[tier];
    setCustomQty(tierData.quantity);
    setSelectedFinish(tierData.product.finishes[0] || 'Standard');
    setActiveCct(tierData.product.cctKelvin || 3000);
  };

  // Cálculo de lux alcançado usando os coeficientes reais (μ e d) calculados pelo motor
  const currentLux = calculateLuxAchieved(
    customQty * activeProduct.lumens,
    calcResult.areaM2,
    calcResult.utilizationFactor,
    calcResult.maintenanceFactor
  );

  const isCompliant = currentLux >= calcResult.targetLux;
  const kitCost = kitResult ? kitSubtotal(kitResult.lines) : 0;
  const productSubtotal = Math.round(customQty * activeProduct.basePrice * 100) / 100;
  const totalItemCost = Math.round((productSubtotal + kitCost) * 100) / 100;

  const handleConfirm = (requestRfqImmediately = false) => {
    haptic.success();
    const proj = ensureCurrentProject();
    const targetProjectId = params.projectId || proj.id;

    const selectedItem: SelectedRoomItem = {
      id: `item-${Date.now()}`,
      roomId: `room-${Date.now()}`,
      product: {
        ...activeProduct,
        cctKelvin: activeCct,
      },
      quantity: customQty,
      selectedFinish,
      tierType: selectedTier,
      unitPrice: activeProduct.basePrice,
      subtotal: productSubtotal,
      luxAchieved: currentLux,
      kit: kitResult?.lines,
      kitMissing: kitResult?.missing,
    };

    const newRoom: Room = {
      id: `room-${Date.now()}`,
      projectId: targetProjectId,
      name: params.roomName || 'Room',
      roomType: params.roomType || 'living_room',
      length: lengthNum,
      width: widthNum,
      height: heightNum,
      ceilingType: params.ceilingType || 'plasterboard',
      targetLux: calcResult.targetLux,
      requiredLumens: calcResult.totalLumensRequired,
      selectedItem,
      calculation: calcResult,
      createdAt: new Date().toISOString(),
    };

    addOrUpdateRoom(newRoom);

    if (requestRfqImmediately) {
      router.replace(`/project/${targetProjectId}?rfq=1`);
    } else {
      router.replace(`/project/${targetProjectId}`);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#0e0e0e]"
      style={{ flex: 1, height: '100%', maxHeight: '100%', overflow: 'hidden' }}
      edges={['top', 'left', 'right']}
    >
      <View className="flex-1" style={{ flex: 1, minHeight: 0, height: '100%', overflow: 'hidden' }}>
        <ScrollView
          className="flex-1 px-5 pt-3"
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{ paddingBottom: 28 }}
          showsVerticalScrollIndicator={true}
        >
          {/* Header */}
          <View className="mb-4">
            <T variant="eyebrow" className="text-[#d9b277]">
              ESPECIFICAÇÃO PRELIMINAR
            </T>
            <T variant="h1" className="text-white mt-1">
              {calcResult.roomName}
            </T>
            <T variant="muted" className="text-xs mt-0.5">
              {calcResult.areaM2} m² ({lengthNum}m × {widthNum}m) · Pé-direito {heightNum}m
            </T>
          </View>

          {/* Banner de Estimativa Preliminar & Avisos */}
          <View className="p-3.5 rounded-[16px] bg-[#141414] border border-white/10 mb-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Info size={16} color="#d9b277" />
                <T variant="caption" className="text-zinc-200 font-semibold">
                  Método dos Lúmens (AS/NZS 1680)
                </T>
              </View>
              <Pressable
                onPress={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="flex-row items-center gap-1"
              >
                <T variant="caption" className="text-[#d9b277]">
                  {showTechnicalDetails ? 'Ocultar premissas' : 'Ver premissas'}
                </T>
                {showTechnicalDetails ? (
                  <ChevronUp size={14} color="#d9b277" />
                ) : (
                  <ChevronDown size={14} color="#d9b277" />
                )}
              </Pressable>
            </View>

            {showTechnicalDetails && (
              <View className="mt-3 pt-3 border-t border-white/[0.08] gap-1.5">
                <T variant="caption" className="text-zinc-400 font-medium">
                  Premissas de cálculo:
                </T>
                {calcResult.assumptions.map((a, idx) => (
                  <T key={idx} variant="caption" className="text-zinc-400 text-[11px]">
                    • {a}
                  </T>
                ))}

                {calcResult.warnings.length > 0 && (
                  <View className="mt-2 p-2 rounded bg-amber-950/40 border border-amber-500/30">
                    <T variant="caption" className="text-amber-300 font-semibold mb-1">
                      Avisos:
                    </T>
                    {calcResult.warnings.map((w, idx) => (
                      <T key={idx} variant="caption" className="text-amber-200 text-[11px]">
                        • {w}
                      </T>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Target Benchmark Card */}
          <View className="p-4 rounded-[18px] bg-[#181818] border border-white/10 flex-row items-center justify-between mb-5">
            <View>
              <T variant="caption" className="text-zinc-400 font-medium">
                META NORMATIVA
              </T>
              <T variant="h3" className="mt-0.5 text-white">
                {calcResult.targetLux} Lux
              </T>
            </View>
            <View className="items-end">
              <T variant="caption" className="text-zinc-400 font-medium">
                FLUXO REQUERIDO
              </T>
              <T variant="h3" className="mt-0.5 text-[#d9b277]">
                {calcResult.totalLumensRequired} lm
              </T>
            </View>
          </View>

          {/* Triple Choice Tier Cards */}
          <T variant="eyebrow" className="mb-2.5">
            PROPOSTAS DE ILUMINAÇÃO (TRIPLA ESCOLHA)
          </T>
          <View className="flex-row gap-2 mb-4">
            {/* Recommended */}
            <Pressable
              onPress={() => handleSelectTier('recommended')}
              className={`flex-1 p-3.5 rounded-[18px] border ${
                selectedTier === 'recommended'
                  ? 'bg-[#181818] border-[#d9b277]'
                  : 'bg-[#141414] border-white/10'
              }`}
            >
              <View className="flex-row items-center gap-1 mb-1">
                <Sparkles size={13} color="#d9b277" />
                <T variant="caption" className="font-bold text-[#d9b277] text-[10px] uppercase">
                  Recomendado
                </T>
              </View>
              <T variant="bodyMd" numberOfLines={1} className="font-semibold text-white text-xs">
                {calcResult.recommendedProducts.recommended.product.name}
              </T>
              <T variant="caption" className="text-zinc-400 mt-1">
                ${calcResult.recommendedProducts.recommended.product.basePrice}{' '}
                {calcResult.recommendedProducts.recommended.product.unit === 'm' ? '/m' : 'ea'}
              </T>
            </Pressable>

            {/* Premium */}
            <Pressable
              onPress={() => handleSelectTier('premium')}
              className={`flex-1 p-3.5 rounded-[18px] border ${
                selectedTier === 'premium'
                  ? 'bg-[#181818] border-[#d9b277]'
                  : 'bg-[#141414] border-white/10'
              }`}
            >
              <View className="flex-row items-center gap-1 mb-1">
                <Award size={13} color="#d9b277" />
                <T variant="caption" className="font-bold text-[#d9b277] text-[10px] uppercase">
                  Premium CRI
                </T>
              </View>
              <T variant="bodyMd" numberOfLines={1} className="font-semibold text-white text-xs">
                {calcResult.recommendedProducts.premium.product.name}
              </T>
              <T variant="caption" className="text-zinc-400 mt-1">
                ${calcResult.recommendedProducts.premium.product.basePrice}{' '}
                {calcResult.recommendedProducts.premium.product.unit === 'm' ? '/m' : 'ea'}
              </T>
            </Pressable>

            {/* Budget */}
            <Pressable
              onPress={() => handleSelectTier('budget')}
              className={`flex-1 p-3.5 rounded-[18px] border ${
                selectedTier === 'budget'
                  ? 'bg-[#181818] border-[#d9b277]'
                  : 'bg-[#141414] border-white/10'
              }`}
            >
              <View className="flex-row items-center gap-1 mb-1">
                <Tag size={13} color="#d9b277" />
                <T variant="caption" className="font-bold text-[#d9b277] text-[10px] uppercase">
                  Econômico
                </T>
              </View>
              <T variant="bodyMd" numberOfLines={1} className="font-semibold text-white text-xs">
                {calcResult.recommendedProducts.budget.product.name}
              </T>
              <T variant="caption" className="text-zinc-400 mt-1">
                ${calcResult.recommendedProducts.budget.product.basePrice}{' '}
                {calcResult.recommendedProducts.budget.product.unit === 'm' ? '/m' : 'ea'}
              </T>
            </Pressable>
          </View>

          {/* Justificativa do Tier */}
          {calcResult.justifications[selectedTier]?.length > 0 && (
            <View className="bg-[#181818] border border-white/10 rounded-[14px] p-3 mb-5">
              <T variant="caption" className="text-[#d9b277] font-semibold mb-1">
                Por que esta opção foi selecionada:
              </T>
              {calcResult.justifications[selectedTier].map((j, idx) => (
                <T key={idx} variant="caption" className="text-zinc-300 text-xs">
                  • {j}
                </T>
              ))}
            </View>
          )}

          {/* Selected Product Hero Card */}
          <GlowCard className="p-4 mb-5">
            <View className="flex-row gap-4 mb-4">
              <Image
                source={{ uri: activeProduct.imageUrl }}
                className="w-20 h-20 rounded-[12px] bg-zinc-800"
              />
              <View className="flex-1 justify-center">
                <T variant="h3" className="text-white text-base">
                  {activeProduct.name}
                </T>
                <T variant="caption" className="text-zinc-400 mt-1">
                  SKU: {activeProduct.sku} · {activeProduct.brand || 'QLS'}
                </T>
                <View className="flex-row items-center gap-2 mt-2">
                  <View className="px-2 py-0.5 rounded-full bg-white/[0.08]">
                    <T variant="caption" className="text-zinc-300 text-[10px]">
                      {activeProduct.powerWatts} {isContinuous ? 'W/m' : 'W'}
                    </T>
                  </View>
                  <View className="px-2 py-0.5 rounded-full bg-white/[0.08]">
                    <T variant="caption" className="text-zinc-300 text-[10px]">
                      Ra {activeProduct.cri}+
                    </T>
                  </View>
                  <View className="px-2 py-0.5 rounded-full bg-white/[0.08]">
                    <T variant="caption" className="text-zinc-300 text-[10px]">
                      {activeProduct.ipRating}
                    </T>
                  </View>
                </View>
              </View>
            </View>

            {/* Optical Preview */}
            <View className="py-2 items-center border-t border-b border-white/[0.08] my-2">
              <BeamPreview
                beamAngle={activeProduct.beamAngle || 120}
                cctKelvin={activeCct}
                lumens={activeProduct.lumens}
              />
            </View>

            {/* Quantity Stepper (Metres vs Pieces) */}
            <View className="flex-row items-center justify-between pt-2">
              <View>
                <T variant="bodyMd" className="text-white font-medium">
                  {isContinuous ? 'Comprimento Linear' : 'Quantidade de Luminárias'}
                </T>
                <T variant="caption" className="text-zinc-400">
                  {isContinuous ? 'Metros lineares de fita' : 'Peças calculadas'}
                </T>
              </View>

              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={() => {
                    haptic.tick();
                    setCustomQty((q) => Math.max(1, q - 1));
                  }}
                  className="w-9 h-9 rounded-[10px] bg-white/[0.08] items-center justify-center active:bg-white/[0.15]"
                >
                  <Minus size={16} color="#ffffff" />
                </Pressable>
                <T variant="h3" className="text-white min-w-[32px] text-center">
                  {customQty} {isContinuous ? 'm' : 'un'}
                </T>
                <Pressable
                  onPress={() => {
                    haptic.tick();
                    setCustomQty((q) => q + 1);
                  }}
                  className="w-9 h-9 rounded-[10px] bg-[#d9b277]/20 items-center justify-center active:bg-[#d9b277]/30"
                >
                  <Plus size={16} color="#d9b277" />
                </Pressable>
              </View>
            </View>

            {/* Lux Achieved Status */}
            <View className="mt-4 p-3 rounded-[12px] bg-black/40 border border-white/5 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                {isCompliant ? (
                  <CheckCircle2 size={18} color="#22c55e" />
                ) : (
                  <AlertTriangle size={18} color="#eab308" />
                )}
                <T variant="caption" className={isCompliant ? 'text-green-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {currentLux} Lux Alcançado
                </T>
              </View>
              <T variant="caption" className="text-zinc-500">
                Meta: {calcResult.targetLux} Lux
              </T>
            </View>
          </GlowCard>

          {/* Kit Compatível para Fitas LED */}
          {kitResult && (
            <View className="mb-5 bg-[#181818] border border-[#d9b277]/30 rounded-[18px] p-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Box size={16} color="#d9b277" />
                  <T variant="eyebrow" className="text-[#d9b277]">
                    KIT COMPATÍVEL AUTOMÁTICO
                  </T>
                </View>
                <T variant="caption" className="text-zinc-400">
                  +${kitCost.toFixed(2)} AUD
                </T>
              </View>

              <T variant="caption" className="text-zinc-400 mb-3 text-xs">
                Componentes dimensionados para alimentar e acomodar {customQty} metros de fita:
              </T>

              <View className="gap-2">
                {kitResult.lines.map((k, i) => (
                  <View key={i} className="flex-row items-center justify-between py-1.5 border-b border-white/[0.05]">
                    <View className="flex-1 pr-2">
                      <T variant="caption" className="text-white font-semibold">
                        {k.role.toUpperCase()}: {k.product.name}
                      </T>
                      {k.note && (
                        <T variant="caption" className="text-zinc-400 text-[10px]">
                          {k.note}
                        </T>
                      )}
                    </View>
                    <T variant="caption" className="text-zinc-300 font-medium">
                      {k.quantity} un · ${k.subtotal.toFixed(2)}
                    </T>
                  </View>
                ))}
              </View>

              {kitResult.warnings.length > 0 && (
                <View className="mt-3 p-2 rounded bg-amber-950/30 border border-amber-500/20">
                  {kitResult.warnings.map((w, i) => (
                    <T key={i} variant="caption" className="text-amber-300 text-[11px]">
                      • {w}
                    </T>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* CCT Selector */}
          <T variant="eyebrow" className="mb-2">
            TEMPERATURA DE COR (CCT)
          </T>
          <View className="flex-row gap-2 mb-6">
            {CCT_OPTIONS.map((cct) => {
              const active = activeCct === cct.kelvin;
              const swatchColor = cctToColor(cct.kelvin);
              return (
                <Pressable
                  key={cct.kelvin}
                  onPress={() => {
                    haptic.tick();
                    setActiveCct(cct.kelvin);
                  }}
                  className={`flex-1 p-3 rounded-[14px] border ${
                    active ? 'bg-[#181818] border-[#d9b277]' : 'bg-[#141414] border-white/10'
                  }`}
                >
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: swatchColor }}
                    />
                    <T variant="caption" className="text-white font-semibold text-xs">
                      {cct.kelvin}K
                    </T>
                  </View>
                  <T variant="caption" className="text-zinc-400 text-[10px]">
                    {cct.note}
                  </T>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Pinned Bottom Actions */}
        <View className="p-4 bg-[#141414] border-t border-white/[0.08] flex-row gap-3">
          <View className="flex-1">
            <Pressable
              onPress={() => handleConfirm(false)}
              className="py-3.5 px-4 rounded-full bg-white/[0.08] items-center justify-center border border-white/10 active:bg-white/[0.15]"
            >
              <T variant="bodyMd" className="text-white font-semibold text-center">
                Salvar no Projeto
              </T>
            </Pressable>
          </View>

          <View className="flex-1">
            <LuxuryButton
              title="Solicitar Cotação"
              variant="glow"
              icon={<Send size={16} color="#0e0e0e" />}
              onPress={() => handleConfirm(true)}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
