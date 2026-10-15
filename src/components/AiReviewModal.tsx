import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Layers,
  Minus,
  Plus,
  Sparkles,
  Trash2,
  X,
  Zap,
} from 'lucide-react-native';
import { GlowCard, LuxuryButton, StandardsBadge, T } from './ui';
import { haptic } from '../lib/haptics';
import { recommendRoomLighting } from '../lib/recommendationEngine';
import { buildKit } from '../lib/kitEngine';
import { AiAnalysisResult, AiDetectedRoom, ProductTier, Room, SelectedRoomItem } from '../types';
import { useProjectStore } from '../store/useProjectStore';

interface AiReviewModalProps {
  visible: boolean;
  analysisResult: AiAnalysisResult | null;
  projectId: string;
  onClose: () => void;
  onImportComplete?: () => void;
}

export function AiReviewModal({
  visible,
  analysisResult,
  projectId,
  onClose,
  onImportComplete,
}: AiReviewModalProps) {
  const { addOrUpdateRoom } = useProjectStore();

  const [rooms, setRooms] = useState<AiDetectedRoom[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(new Set());
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);

  // Sincroniza estado quando analysisResult muda
  React.useEffect(() => {
    if (analysisResult && analysisResult.rooms.length > 0) {
      setRooms(analysisResult.rooms);
      setSelectedRoomIds(new Set(analysisResult.rooms.map((r) => r.id)));
      setExpandedRoomId(analysisResult.rooms[0]?.id || null);
    }
  }, [analysisResult]);

  if (!analysisResult) return null;

  const toggleRoomSelection = (roomId: string) => {
    haptic.tick();
    setSelectedRoomIds((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      return next;
    });
  };

  const handleUpdateDimensions = (roomId: string, field: 'length' | 'width' | 'height', delta: number) => {
    haptic.tick();
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const currentVal = r[field];
        const nextVal = Math.max(1, Math.round((currentVal + delta) * 10) / 10);
        const updated = { ...r, [field]: nextVal };

        // Recalcula fotometria e luminárias
        const newCalc = recommendRoomLighting({
          roomName: updated.roomName,
          roomType: updated.roomType,
          length: updated.length,
          width: updated.width,
          height: updated.height,
        });

        const recTier = newCalc.recommendedProducts.recommended;
        const prod = recTier.product;

        const updatedItem: SelectedRoomItem = {
          id: `ai-item-${updated.id}`,
          product: prod,
          quantity: recTier.quantity,
          selectedFinish: prod.finishes[0] || 'Black',
          tierType: 'recommended',
          unitPrice: prod.basePrice,
          subtotal: recTier.totalCost,
          luxAchieved: recTier.luxAchieved,
          kit: prod.category === 'strip' ? buildKit(prod, recTier.quantity).lines : undefined,
        };

        return {
          ...updated,
          calculationResult: newCalc,
          selectedItem: updatedItem,
        };
      })
    );
  };

  const handleConfirmImport = () => {
    const selectedRooms = rooms.filter((r) => selectedRoomIds.has(r.id));
    if (selectedRooms.length === 0) {
      Alert.alert('Nenhum cômodo selecionado', 'Por favor, marque ao menos um cômodo para importar.');
      return;
    }

    haptic.success();

    // Converte e salva cada cômodo na store
    selectedRooms.forEach((detected) => {
      const targetLux = detected.calculationResult?.targetLux || detected.targetLux || 300;
      const requiredLumens = detected.calculationResult?.totalLumensRequired || 3500;

      const newRoom: Room = {
        id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        projectId,
        name: detected.roomName,
        roomType: detected.roomType,
        length: detected.length,
        width: detected.width,
        height: detected.height,
        ceilingType: detected.ceilingType || 'plasterboard',
        targetLux,
        requiredLumens,
        selectedItem: detected.selectedItem,
        calculation: detected.calculationResult,
        createdAt: new Date().toISOString(),
      };

      addOrUpdateRoom(newRoom);
    });

    onClose();
    if (onImportComplete) {
      onImportComplete();
    }
  };

  const selectedCount = selectedRoomIds.size;
  const totalCost = rooms
    .filter((r) => selectedRoomIds.has(r.id))
    .reduce((acc, r) => acc + (r.selectedItem?.subtotal || 0), 0);

  const totalPieces = rooms
    .filter((r) => selectedRoomIds.has(r.id))
    .reduce((acc, r) => acc + (r.selectedItem?.quantity || 0), 0);

  const isExistingPlan = analysisResult.mode === 'existing_plan';

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View className="flex-1 bg-[#0e0e0e]">
        {/* Top Header */}
        <View className="px-5 py-4 border-b border-white/[0.08] flex-row items-center justify-between bg-[#141414]">
          <View className="flex-row items-center gap-2.5 flex-1 pr-3">
            <View className="w-9 h-9 rounded-full bg-[#d9b277]/20 border border-[#d9b277]/40 items-center justify-center">
              <Sparkles size={18} color="#d9b277" />
            </View>
            <View className="flex-1">
              <T variant="eyebrow" className="text-[#d9b277]">
                QLS AI ARCHITECT
              </T>
              <T variant="h3" className="text-white text-base" numberOfLines={1}>
                Revisão do Projeto por IA
              </T>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            onPress={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.08] items-center justify-center active:bg-white/[0.15]"
          >
            <X size={18} color="#a1a1aa" />
          </Pressable>
        </View>

        {/* Subheader com informações do arquivo */}
        <View className="px-5 py-3 bg-[#181818] border-b border-white/[0.08] flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1 pr-2">
            <FileText size={15} color="#d9b277" />
            <T variant="caption" className="text-zinc-300 font-medium text-xs" numberOfLines={1}>
              {analysisResult.fileName}
            </T>
          </View>
          <StandardsBadge
            label={isExistingPlan ? 'PROJETO LUMINOTÉCNICO' : 'PLANTA ARQUITETÔNICA'}
            highlight
          />
        </View>

        {/* Mensagem de resumo / warnings */}
        {analysisResult.warnings && analysisResult.warnings.length > 0 && (
          <View className="mx-5 mt-3 p-3 rounded-[12px] bg-amber-950/30 border border-amber-500/30 flex-row items-start gap-2.5">
            <AlertTriangle size={16} color="#f59e0b" className="mt-0.5" />
            <T variant="caption" className="text-amber-200/90 text-[11px] leading-relaxed flex-1">
              {analysisResult.warnings[0]}
            </T>
          </View>
        )}

        <ScrollView
          className="flex-1 px-5 pt-3"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={true}
        >
          <View className="flex-row items-center justify-between mb-3 mt-1">
            <T variant="eyebrow" className="text-zinc-400">
              AMBIENTES IDENTIFICADOS ({rooms.length})
            </T>
            <T variant="caption" className="text-[#d9b277] text-xs">
              {selectedCount} selecionado(s)
            </T>
          </View>

          {/* Cards dos cômodos */}
          <View className="gap-3">
            {rooms.map((room, index) => {
              const isSelected = selectedRoomIds.has(room.id);
              const isExpanded = expandedRoomId === room.id;
              const area = Math.round(room.length * room.width * 10) / 10;
              const item = room.selectedItem;

              return (
                <View
                  key={room.id}
                  className={`rounded-[18px] border transition-all ${
                    isSelected
                      ? 'bg-[#181818] border-[#d9b277]/40'
                      : 'bg-[#121212] border-white/5 opacity-60'
                  }`}
                >
                  {/* Top Bar do Cômodo com Checkbox */}
                  <Pressable
                    onPress={() => toggleRoomSelection(room.id)}
                    className="p-4 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                      <View
                        className={`w-6 h-6 rounded-md items-center justify-center border ${
                          isSelected
                            ? 'bg-[#d9b277] border-[#d9b277]'
                            : 'bg-white/5 border-white/20'
                        }`}
                      >
                        {isSelected && <Check size={14} color="#000" strokeWidth={3} />}
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <T variant="caption" className="text-[#d9b277] font-bold text-[10px]">
                            #{index + 1}
                          </T>
                          <T variant="h3" className="text-white text-sm" numberOfLines={1}>
                            {room.roomName}
                          </T>
                        </View>
                        <T variant="caption" className="text-zinc-400 text-[11px] mt-0.5">
                          {room.length}m × {room.width}m ({area} m²) · Alvo: {room.targetLux} Lux
                        </T>
                      </View>
                    </View>

                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        haptic.light();
                        setExpandedRoomId(isExpanded ? null : room.id);
                      }}
                      className="w-8 h-8 rounded-full bg-white/5 items-center justify-center"
                    >
                      {isExpanded ? (
                        <ChevronUp size={16} color="#d9b277" />
                      ) : (
                        <ChevronDown size={16} color="#71717a" />
                      )}
                    </Pressable>
                  </Pressable>

                  {/* Detalhes expansíveis do cômodo */}
                  {isExpanded && (
                    <View className="px-4 pb-4 pt-1 border-t border-white/[0.06]">
                      {/* Notas de leitura original */}
                      {room.existingNotes ? (
                        <View className="mb-3 p-2.5 rounded-[10px] bg-white/[0.04]">
                          <T variant="caption" className="text-zinc-400 text-[10px] leading-relaxed">
                            <strong>Leitura da Prancha:</strong> {room.existingNotes}
                          </T>
                        </View>
                      ) : null}

                      {/* Ajuste tátil de dimensões */}
                      <T variant="caption" className="text-zinc-400 text-[10px] uppercase font-bold mb-2">
                        Ajustar Medidas do Ambiente:
                      </T>
                      <View className="flex-row gap-2 mb-3">
                        {/* Comprimento */}
                        <View className="flex-1 bg-[#141414] p-2 rounded-[10px] border border-white/5 items-center">
                          <T variant="caption" className="text-zinc-500 text-[9px]">
                            COMPRIMENTO
                          </T>
                          <T variant="bodyMd" className="text-white font-bold my-0.5">
                            {room.length.toFixed(1)} m
                          </T>
                          <View className="flex-row gap-1">
                            <Pressable
                              onPress={() => handleUpdateDimensions(room.id, 'length', -0.5)}
                              className="w-6 h-6 rounded bg-white/10 items-center justify-center active:bg-white/20"
                            >
                              <Minus size={12} color="#fff" />
                            </Pressable>
                            <Pressable
                              onPress={() => handleUpdateDimensions(room.id, 'length', +0.5)}
                              className="w-6 h-6 rounded bg-white/10 items-center justify-center active:bg-white/20"
                            >
                              <Plus size={12} color="#fff" />
                            </Pressable>
                          </View>
                        </View>

                        {/* Largura */}
                        <View className="flex-1 bg-[#141414] p-2 rounded-[10px] border border-white/5 items-center">
                          <T variant="caption" className="text-zinc-500 text-[9px]">
                            LARGURA
                          </T>
                          <T variant="bodyMd" className="text-white font-bold my-0.5">
                            {room.width.toFixed(1)} m
                          </T>
                          <View className="flex-row gap-1">
                            <Pressable
                              onPress={() => handleUpdateDimensions(room.id, 'width', -0.5)}
                              className="w-6 h-6 rounded bg-white/10 items-center justify-center active:bg-white/20"
                            >
                              <Minus size={12} color="#fff" />
                            </Pressable>
                            <Pressable
                              onPress={() => handleUpdateDimensions(room.id, 'width', +0.5)}
                              className="w-6 h-6 rounded bg-white/10 items-center justify-center active:bg-white/20"
                            >
                              <Plus size={12} color="#fff" />
                            </Pressable>
                          </View>
                        </View>

                        {/* Pé-direito */}
                        <View className="flex-1 bg-[#141414] p-2 rounded-[10px] border border-white/5 items-center">
                          <T variant="caption" className="text-zinc-500 text-[9px]">
                            PÉ-DIREITO
                          </T>
                          <T variant="bodyMd" className="text-white font-bold my-0.5">
                            {room.height.toFixed(1)} m
                          </T>
                          <View className="flex-row gap-1">
                            <Pressable
                              onPress={() => handleUpdateDimensions(room.id, 'height', -0.1)}
                              className="w-6 h-6 rounded bg-white/10 items-center justify-center active:bg-white/20"
                            >
                              <Minus size={12} color="#fff" />
                            </Pressable>
                            <Pressable
                              onPress={() => handleUpdateDimensions(room.id, 'height', +0.1)}
                              className="w-6 h-6 rounded bg-white/10 items-center justify-center active:bg-white/20"
                            >
                              <Plus size={12} color="#fff" />
                            </Pressable>
                          </View>
                        </View>
                      </View>

                      {/* Produtos Calculados */}
                      {item ? (
                        <View className="bg-[#141414] p-3 rounded-[12px] border border-white/5">
                          <View className="flex-row items-center justify-between mb-1">
                            <T variant="caption" className="text-[#d9b277] font-bold text-[10px]">
                              PRODUTO RECOMENDADO QLS
                            </T>
                            <T variant="caption" className="text-emerald-400 font-bold text-[10px]">
                              {item.luxAchieved} Lux atingidos
                            </T>
                          </View>
                          <T variant="bodyMd" className="text-white text-xs font-semibold">
                            {item.quantity}x {item.product.name}
                          </T>
                          <T variant="caption" className="text-zinc-400 text-[10px] mt-0.5">
                            SKU: {item.product.sku} · {item.product.lumens} lm/un · {item.product.powerWatts}W
                          </T>

                          {/* Se tiver fita de LED inclusa */}
                          {room.linearMeters && room.linearMeters > 0 ? (
                            <View className="mt-2 pt-2 border-t border-white/5">
                              <T variant="caption" className="text-zinc-300 text-[11px]">
                                + {room.linearMeters}m Fita LED COB 24V (Sanca/Cortineiro) com Kit
                              </T>
                            </View>
                          ) : null}

                          <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-white/5">
                            <T variant="caption" className="text-zinc-400 text-[10px]">
                              Subtotal Estimado:
                            </T>
                            <T variant="h3" className="text-[#d9b277] text-xs">
                              ${item.subtotal.toFixed(0)} AUD
                            </T>
                          </View>
                        </View>
                      ) : null}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Bar com Totais e Ações */}
        <View className="absolute bottom-0 left-0 right-0 bg-[#141414] border-t border-white/10 px-5 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <T variant="caption" className="text-zinc-400 text-[10px]">
                AMBIENTES SELECIONADOS
              </T>
              <T variant="h3" className="text-white text-sm">
                {selectedCount} de {rooms.length} cômodos
              </T>
            </View>

            <View className="items-end">
              <T variant="caption" className="text-zinc-400 text-[10px]">
                EST. TOTAL DOS CÔMODOS
              </T>
              <T variant="h3" className="text-[#d9b277] text-base font-bold">
                ${totalCost.toFixed(0)} AUD
              </T>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="w-1/3">
              <LuxuryButton title="Cancelar" variant="outline" onPress={onClose} />
            </View>
            <View className="flex-1">
              <LuxuryButton
                title={`Confirmar e Importar (${selectedCount})`}
                variant="glow"
                disabled={selectedCount === 0}
                icon={<CheckCircle2 size={16} color="#000" />}
                onPress={handleConfirmImport}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
