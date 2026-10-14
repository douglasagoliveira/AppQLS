import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Layers,
  Maximize2,
  Minus,
  Plus,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { GlowCard, LuxuryButton, StandardsBadge, T } from './ui';
import { haptic } from '../lib/haptics';
import { AUSTRALIAN_LIGHTING_STANDARDS } from '../lib/standards';
import { validateDimensions } from '../lib/lightingEngine';
import {
  GUIDED_INTENTS,
  resolveGuidedPreferences,
} from '../lib/recommendationEngine';
import { RoomPreferences, RoomType } from '../types';

interface RoomOption {
  type: RoomType;
  label: string;
  sub: string;
  lux: string;
}

export const ROOM_OPTIONS: RoomOption[] = [
  { type: 'kitchen', label: 'Kitchen & Gourmet', sub: 'High task visibility', lux: '240–300 Lux' },
  { type: 'living_room', label: 'Living Room & Lounge', sub: 'Warm ambient glow', lux: '150–200 Lux' },
  { type: 'dining_room', label: 'Dining Area', sub: 'Centered intimacy', lux: '150–180 Lux' },
  { type: 'bedroom', label: 'Bedroom & Master Suite', sub: 'Relaxing retreat', lux: '100–150 Lux' },
  { type: 'bathroom', label: 'Bathroom & Ensuite', sub: 'IP44/IP65 wet area', lux: '200–300 Lux' },
  { type: 'home_office', label: 'Home Office & Study', sub: 'Low glare UGR<19', lux: '320–500 Lux' },
  { type: 'outdoor_patio', label: 'Outdoor Patio & Deck', sub: 'IP65 exterior', lux: '100–150 Lux' },
  { type: 'commercial_office', label: 'Commercial Workspace', sub: 'GreenStar & AS 1680.1', lux: '400–500 Lux' },
  { type: 'retail', label: 'Retail & Showroom', sub: 'CRI 95+ vibrant accent', lux: '450–600 Lux' },
];

export const CEILING_TYPES = [
  { id: 'plasterboard', label: 'Plasterboard / Drywall' },
  { id: 'concrete', label: 'Exposed Concrete' },
  { id: 'timber', label: 'Timber / Slat Ceiling' },
];

interface RoomWizardProps {
  projectId?: string;
  onFinished?: (roomData: {
    roomType: RoomType;
    roomName: string;
    length: number;
    width: number;
    height: number;
    ceilingType: string;
    preferences: RoomPreferences;
  }) => void;
}

export function RoomWizard({ projectId, onFinished }: RoomWizardProps) {
  const router = useRouter();

  // 3-step wizard
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Room type & name
  const [roomType, setRoomType] = useState<RoomType>('kitchen');
  const [customName, setCustomName] = useState('Kitchen & Gourmet');

  // Step 2: Dimensions & ceiling
  const [ceilingType, setCeilingType] = useState('plasterboard');
  const [length, setLength] = useState('4.5');
  const [width, setWidth] = useState('3.2');
  const [height, setHeight] = useState('2.7');
  const [dimErrors, setDimErrors] = useState<string[]>([]);

  // Step 3: Lighting Mode & Preferences
  const [mode, setMode] = useState<'guided' | 'professional'>('guided');
  const [guidedIntentId, setGuidedIntentId] = useState('elegant');

  // Professional Mode options
  const [proCct, setProCct] = useState<number | undefined>(3000);
  const [proLowGlare, setProLowGlare] = useState(false);
  const [proIpRating, setProIpRating] = useState<string | undefined>(undefined);
  const [proSourceKind, setProSourceKind] = useState<'point' | 'continuous' | 'any'>('any');

  const selectedStandard = AUSTRALIAN_LIGHTING_STANDARDS[roomType];

  const handleSelectRoomType = (type: RoomType, defaultLabel: string) => {
    haptic.tick();
    if (roomType === type) {
      handleGoToStep2();
      return;
    }
    setRoomType(type);
    setCustomName(defaultLabel);
  };

  const adjustDimension = (setter: React.Dispatch<React.SetStateAction<string>>, current: string, delta: number) => {
    haptic.tick();
    const val = parseFloat(current.replace(',', '.')) || 0;
    const next = Math.max(1, Math.round((val + delta) * 10) / 10);
    setter(next.toFixed(1));
  };

  const validateCurrentDimensions = (): { valid: boolean; l: number; w: number; h: number } => {
    const l = parseFloat(length.replace(',', '.'));
    const w = parseFloat(width.replace(',', '.'));
    const h = parseFloat(height.replace(',', '.')) || 2.7;

    const res = validateDimensions(l, w, h);
    if (!res.valid) {
      setDimErrors(res.errors);
      return { valid: false, l: 0, w: 0, h: 0 };
    }
    setDimErrors([]);
    return { valid: true, l, w, h };
  };

  const handleGoToStep2 = () => {
    haptic.light();
    setStep(2);
  };

  const handleGoToStep3 = () => {
    const check = validateCurrentDimensions();
    if (!check.valid) {
      haptic.warning();
      return;
    }
    haptic.light();
    setStep(3);
  };

  const handleCalculate = () => {
    const check = validateCurrentDimensions();
    if (!check.valid) {
      Alert.alert('Invalid Dimensions', dimErrors.join('\n') || 'Please review space dimensions.');
      setStep(2);
      return;
    }

    haptic.success();
    const name = customName.trim() || selectedStandard.label;

    let finalPreferences: RoomPreferences;

    if (mode === 'guided') {
      const resolution = resolveGuidedPreferences(roomType, guidedIntentId);
      finalPreferences = resolution.preferences;
    } else {
      finalPreferences = {
        mode: 'professional',
        cct: proCct ?? selectedStandard.recommendedCCT,
        lowGlare: proLowGlare,
        minIP: proIpRating,
        sourceKind: proSourceKind,
      };
    }

    if (onFinished) {
      onFinished({
        roomType,
        roomName: name,
        length: check.l,
        width: check.w,
        height: check.h,
        ceilingType,
        preferences: finalPreferences,
      });
      return;
    }

    router.push({
      pathname: '/room/recommendation',
      params: {
        projectId: projectId || '',
        roomType,
        roomName: name,
        length: check.l.toString(),
        width: check.w.toString(),
        height: check.h.toString(),
        ceilingType,
        preferences: JSON.stringify(finalPreferences),
      },
    });
  };

  const parsedL = parseFloat(length.replace(',', '.')) || 0;
  const parsedW = parseFloat(width.replace(',', '.')) || 0;
  const estimatedArea = (parsedL * parsedW).toFixed(1);
  const guidedResolution = resolveGuidedPreferences(roomType, guidedIntentId);

  return (
    <View className="flex-1 bg-[#0e0e0e]" style={{ flex: 1, minHeight: 0, height: '100%', overflow: 'hidden' }}>
      {/* Stepper Header */}
      <View className="px-5 py-3 border-b border-white/[0.08] bg-[#141414] flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {step > 1 && (
            <Pressable
              onPress={() => {
                haptic.light();
                setStep((s) => (s === 3 ? 2 : 1) as 1 | 2);
              }}
              className="w-8 h-8 rounded-full bg-white/[0.06] items-center justify-center mr-1"
            >
              <ArrowLeft size={16} color="#d9b277" />
            </Pressable>
          )}
          <View>
            <T variant="eyebrow" className="text-[#d9b277]">
              STEP {step} OF 3
            </T>
            <T variant="h3" className="text-white text-base">
              {step === 1 && 'Space Type'}
              {step === 2 && 'Dimensions & Ceiling'}
              {step === 3 && 'Lighting Mode & Profile'}
            </T>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {[1, 2, 3].map((s) => (
            <Pressable
              key={s}
              hitSlop={8}
              onPress={() => {
                if (s === 1) setStep(1);
                else if (s === 2) handleGoToStep2();
                else if (s === 3) handleGoToStep3();
              }}
              className={`h-2 rounded-full ${
                step === s ? 'w-7 bg-[#d9b277]' : step > s ? 'w-3 bg-[#d9b277]/60' : 'w-3 bg-white/20'
              }`}
            />
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        style={{ flex: 1, minHeight: 0 }}
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* ================= STEP 1: Space Type ================= */}
        {step === 1 && (
          <View className="pt-4">
            <T variant="lead" className="text-zinc-400 mb-4">
              Select the area to configure AS/NZS 1680 compliant illuminance.
            </T>

            <View className="mb-4">
              <T variant="caption" className="text-zinc-400 mb-1.5 font-medium">
                SPACE NAME
              </T>
              <TextInput
                value={customName}
                onChangeText={setCustomName}
                placeholder="e.g. Master Chef Kitchen"
                placeholderTextColor="#71717a"
                className="bg-[#181818] border border-white/10 rounded-[14px] px-4 py-3 text-white text-sm"
              />
            </View>

            <View className="gap-2.5">
              {ROOM_OPTIONS.map((opt) => {
                const isSelected = roomType === opt.type;
                return (
                  <Pressable key={opt.type} onPress={() => handleSelectRoomType(opt.type, opt.label)}>
                    <GlowCard active={isSelected} className="p-4 flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <T variant="bodyMd" className={isSelected ? 'text-white font-semibold' : 'text-zinc-300'}>
                          {opt.label}
                        </T>
                        <T variant="caption" className="text-zinc-500 mt-0.5">
                          {opt.sub}
                        </T>
                      </View>
                      <View className="items-end gap-1">
                        <StandardsBadge label="TARGET" value={opt.lux} highlight={isSelected} />
                        {isSelected && (
                          <View className="flex-row items-center gap-1 mt-1">
                            <T variant="caption" className="text-[#d9b277] text-[11px] font-semibold">
                              Toque para avançar
                            </T>
                            <ArrowRight size={12} color="#d9b277" />
                          </View>
                        )}
                      </View>
                    </GlowCard>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ================= STEP 2: Dimensions & Ceiling ================= */}
        {step === 2 && (
          <View className="pt-4">
            {/* Live Area Card */}
            <View className="bg-[#181818] border border-[#d9b277]/30 rounded-[20px] p-4 mb-5 flex-row items-center justify-between">
              <View>
                <T variant="eyebrow" className="text-[#d9b277]">
                  {customName.toUpperCase()}
                </T>
                <T variant="h2" className="text-white mt-1">
                  {estimatedArea} m²
                </T>
                <T variant="caption" className="text-zinc-400">
                  Target: {selectedStandard.targetLux} Lux (AS/NZS 1680)
                </T>
              </View>
              <View className="w-12 h-12 rounded-full bg-[#d9b277]/10 items-center justify-center">
                <Maximize2 size={22} color="#d9b277" />
              </View>
            </View>

            {dimErrors.length > 0 && (
              <View className="bg-red-950/40 border border-red-500/40 rounded-[14px] p-3 mb-4">
                {dimErrors.map((err, i) => (
                  <T key={i} variant="caption" className="text-red-300">
                    • {err}
                  </T>
                ))}
              </View>
            )}

            {/* Steppers */}
            <View className="gap-3.5 mb-6">
              {[
                { label: 'LENGTH (M)', val: length, set: setLength, step: 0.5 },
                { label: 'WIDTH (M)', val: width, set: setWidth, step: 0.5 },
                { label: 'CEILING HEIGHT (M)', val: height, set: setHeight, step: 0.1 },
              ].map((d, i) => (
                <View key={i} className="bg-[#181818] border border-white/10 rounded-[18px] p-3.5 flex-row items-center justify-between">
                  <View className="flex-1">
                    <T variant="caption" className="text-zinc-400 font-medium">
                      {d.label}
                    </T>
                    <TextInput
                      value={d.val}
                      onChangeText={d.set}
                      keyboardType="decimal-pad"
                      className="text-white text-xl font-bold mt-0.5 p-0"
                    />
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Pressable
                      onPress={() => adjustDimension(d.set, d.val, -d.step)}
                      className="w-10 h-10 rounded-[12px] bg-white/[0.08] items-center justify-center active:bg-white/[0.15]"
                    >
                      <Minus size={18} color="#ffffff" />
                    </Pressable>
                    <Pressable
                      onPress={() => adjustDimension(d.set, d.val, d.step)}
                      className="w-10 h-10 rounded-[12px] bg-[#d9b277]/20 items-center justify-center active:bg-[#d9b277]/30"
                    >
                      <Plus size={18} color="#d9b277" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            {/* Ceiling Type */}
            <T variant="eyebrow" className="text-zinc-400 mb-2.5">
              CEILING ARCHITECTURE
            </T>
            <View className="gap-2">
              {CEILING_TYPES.map((c) => {
                const active = ceilingType === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      haptic.tick();
                      setCeilingType(c.id);
                    }}
                  >
                    <GlowCard active={active} className="p-3.5 flex-row items-center justify-between">
                      <T variant="bodyMd" className={active ? 'text-white font-semibold' : 'text-zinc-300'}>
                        {c.label}
                      </T>
                      {active && <Check size={18} color="#d9b277" />}
                    </GlowCard>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ================= STEP 3: Mode & Preferences ================= */}
        {step === 3 && (
          <View className="pt-4">
            {/* Mode Switcher */}
            <View className="flex-row bg-[#181818] p-1 rounded-[16px] border border-white/10 mb-5">
              <Pressable
                onPress={() => {
                  haptic.tick();
                  setMode('guided');
                }}
                className={`flex-1 py-2.5 rounded-[12px] items-center flex-row justify-center gap-2 ${
                  mode === 'guided' ? 'bg-[#d9b277]' : ''
                }`}
              >
                <Sparkles size={16} color={mode === 'guided' ? '#0e0e0e' : '#a1a1aa'} />
                <T
                  variant="bodyMd"
                  className={mode === 'guided' ? 'text-black font-bold' : 'text-zinc-400'}
                  style={mode === 'guided' ? { color: '#0e0e0e' } : undefined}
                >
                  Consultor Guiado
                </T>
              </Pressable>

              <Pressable
                onPress={() => {
                  haptic.tick();
                  setMode('professional');
                }}
                className={`flex-1 py-2.5 rounded-[12px] items-center flex-row justify-center gap-2 ${
                  mode === 'professional' ? 'bg-[#d9b277]' : ''
                }`}
              >
                <Sliders size={16} color={mode === 'professional' ? '#0e0e0e' : '#a1a1aa'} />
                <T
                  variant="bodyMd"
                  className={mode === 'professional' ? 'text-black font-bold' : 'text-zinc-400'}
                  style={mode === 'professional' ? { color: '#0e0e0e' } : undefined}
                >
                  Modo Pro
                </T>
              </Pressable>
            </View>

            {/* GUIDED MODE */}
            {mode === 'guided' && (
              <View>
                <T variant="lead" className="text-zinc-400 mb-3 text-sm">
                  Escolha o efeito luminoso e atmosfera desejados para este ambiente:
                </T>

                <View className="gap-2.5 mb-5">
                  {GUIDED_INTENTS.map((intent) => {
                    const isSelected = guidedIntentId === intent.id;
                    return (
                      <Pressable
                        key={intent.id}
                        onPress={() => {
                          haptic.tick();
                          setGuidedIntentId(intent.id);
                        }}
                      >
                        <GlowCard active={isSelected} className="p-4">
                          <View className="flex-row items-center justify-between">
                            <T variant="bodyMd" className={isSelected ? 'text-white font-bold' : 'text-zinc-200'}>
                              {intent.label}
                            </T>
                            {isSelected && <Check size={18} color="#d9b277" />}
                          </View>
                          <T variant="caption" className="text-zinc-400 mt-1">
                            {intent.description}
                          </T>
                        </GlowCard>
                      </Pressable>
                    );
                  })}
                </View>

                {/* AI Explanation preview */}
                <View className="bg-[#181818] border border-[#d9b277]/20 rounded-[18px] p-4">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Compass size={16} color="#d9b277" />
                    <T variant="eyebrow" className="text-[#d9b277]">
                      CONFIGURAÇÃO TÉCNICA RESOLVIDA
                    </T>
                  </View>
                  {guidedResolution.explanation.map((exp, i) => (
                    <T key={i} variant="caption" className="text-zinc-300 mb-1">
                      • {exp}
                    </T>
                  ))}
                </View>
              </View>
            )}

            {/* PROFESSIONAL MODE */}
            {mode === 'professional' && (
              <View className="gap-5">
                {/* CCT */}
                <View>
                  <T variant="caption" className="text-zinc-400 mb-2 font-medium">
                    COLOUR TEMPERATURE (CCT)
                  </T>
                  <View className="flex-row gap-2">
                    {[
                      { label: 'Qualquer', val: undefined },
                      { label: '2700K (Warm)', val: 2700 },
                      { label: '3000K (Soft)', val: 3000 },
                      { label: '4000K (Cool)', val: 4000 },
                    ].map((c) => {
                      const active = proCct === c.val;
                      return (
                        <Pressable
                          key={c.label}
                          onPress={() => {
                            haptic.tick();
                            setProCct(c.val);
                          }}
                          className={`flex-1 py-2.5 rounded-[12px] border items-center ${
                            active
                              ? 'bg-[#d9b277] border-[#d9b277]'
                              : 'bg-[#181818] border-white/10'
                          }`}
                        >
                          <T
                            variant="caption"
                            className={active ? 'text-black font-bold' : 'text-zinc-300'}
                            style={active ? { color: '#0e0e0e' } : undefined}
                          >
                            {c.label}
                          </T>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Glare Control */}
                <Pressable
                  onPress={() => {
                    haptic.tick();
                    setProLowGlare(!proLowGlare);
                  }}
                >
                  <GlowCard active={proLowGlare} className="p-3.5 flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                      <T variant="bodyMd" className={proLowGlare ? 'text-white font-bold' : 'text-zinc-200'}>
                        Anti-Ofuscamento (UGR ≤ 19)
                      </T>
                      <T variant="caption" className="text-zinc-400 mt-0.5">
                        Filtra apenas luminárias com óptica recuada e baixo índice de ofuscamento.
                      </T>
                    </View>
                    <View
                      className={`w-6 h-6 rounded-[8px] items-center justify-center border ${
                        proLowGlare ? 'bg-[#d9b277] border-[#d9b277]' : 'border-white/20'
                      }`}
                    >
                      {proLowGlare && <Check size={14} color="#0e0e0e" />}
                    </View>
                  </GlowCard>
                </Pressable>

                {/* IP Rating */}
                <View>
                  <T variant="caption" className="text-zinc-400 mb-2 font-medium">
                    PROTEÇÃO CONTRA ÁGUA / UMIDADE
                  </T>
                  <View className="flex-row gap-2">
                    {[
                      { label: 'Padrão (IP20)', val: undefined },
                      { label: 'IP44 (Áreas Úmidas)', val: 'IP44' },
                      { label: 'IP65+ (Externo)', val: 'IP65' },
                    ].map((ip) => {
                      const active = proIpRating === ip.val;
                      return (
                        <Pressable
                          key={ip.label}
                          onPress={() => {
                            haptic.tick();
                            setProIpRating(ip.val);
                          }}
                          className={`flex-1 py-2.5 rounded-[12px] border items-center ${
                            active
                              ? 'bg-[#d9b277] border-[#d9b277]'
                              : 'bg-[#181818] border-white/10'
                          }`}
                        >
                          <T
                            variant="caption"
                            className={active ? 'text-black font-bold' : 'text-zinc-300'}
                            style={active ? { color: '#0e0e0e' } : undefined}
                          >
                            {ip.label}
                          </T>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Source Kind */}
                <View>
                  <T variant="caption" className="text-zinc-400 mb-2 font-medium">
                    TIPO DE FONTE DE LUZ
                  </T>
                  <View className="flex-row gap-2">
                    {[
                      { label: 'Qualquer', val: 'any' as const },
                      { label: 'Luminárias Pontuais', val: 'point' as const },
                      { label: 'Linear / Fitas LED', val: 'continuous' as const },
                    ].map((k) => {
                      const active = proSourceKind === k.val;
                      return (
                        <Pressable
                          key={k.label}
                          onPress={() => {
                            haptic.tick();
                            setProSourceKind(k.val);
                          }}
                          className={`flex-1 py-2.5 rounded-[12px] border items-center ${
                            active
                              ? 'bg-[#d9b277] border-[#d9b277]'
                              : 'bg-[#181818] border-white/10'
                          }`}
                        >
                          <T
                            variant="caption"
                            className={active ? 'text-black font-bold' : 'text-zinc-300'}
                            style={active ? { color: '#0e0e0e' } : undefined}
                          >
                            {k.label}
                          </T>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Pinned Bottom Navigation Bar */}
      <View className="p-4 px-5 bg-[#141414] border-t border-white/[0.08]">
        {step === 1 && (
          <LuxuryButton
            title="Avançar: Dimensões"
            icon={<ArrowRight size={18} color="#0e0e0e" />}
            onPress={handleGoToStep2}
          />
        )}
        {step === 2 && (
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => {
                haptic.light();
                setStep(1);
              }}
              accessibilityRole="button"
              accessibilityLabel="Voltar ao passo anterior"
              className="w-12 h-12 rounded-full bg-white/[0.06] items-center justify-center border border-white/10 active:bg-white/[0.12]"
            >
              <ArrowLeft size={18} color="#f4f2ee" />
            </Pressable>
            <View className="flex-1">
              <LuxuryButton
                title="Avançar: Modo de Iluminação"
                icon={<ArrowRight size={18} color="#0e0e0e" />}
                onPress={handleGoToStep3}
              />
            </View>
          </View>
        )}
        {step === 3 && (
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => {
                haptic.light();
                setStep(2);
              }}
              accessibilityRole="button"
              accessibilityLabel="Voltar ao passo anterior"
              className="w-12 h-12 rounded-full bg-white/[0.06] items-center justify-center border border-white/10 active:bg-white/[0.12]"
            >
              <ArrowLeft size={18} color="#f4f2ee" />
            </Pressable>
            <View className="flex-1">
              <LuxuryButton
                title="Calcular Especificação com IA"
                variant="glow"
                icon={<Sparkles size={18} color="#0e0e0e" />}
                onPress={handleCalculate}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
