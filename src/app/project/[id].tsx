import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  Box,
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  Send,
  Share2,
  Trash2,
  Zap,
} from 'lucide-react-native';
import { GlowCard, LuxuryButton, StandardsBadge, T } from '../../components/ui';
import { RfqSheet } from '../../components/RfqSheet';
import { haptic } from '../../lib/haptics';
import { buildBom, computeTotals, itemTotalCost } from '../../lib/projectMath';
import { generateProjectPdf } from '../../services/pdfService';
import { useProjectStore } from '../../store/useProjectStore';

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { id, rfq } = useLocalSearchParams<{ id: string; rfq?: string }>();
  const { currentProject, removeRoom, removeAdditionalItem } = useProjectStore();

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showRfqSheet, setShowRfqSheet] = useState(false);

  const project = currentProject;

  useEffect(() => {
    if (rfq === '1' && project && (project.rooms.length > 0 || (project.additionalItems?.length ?? 0) > 0)) {
      setShowRfqSheet(true);
    }
  }, [rfq, project]);

  if (!project || project.id !== id) {
    return (
      <SafeAreaView className="flex-1 bg-[#0e0e0e] justify-center items-center px-6">
        <T variant="h2" className="text-white text-center">
          Project Not Found
        </T>
        <T variant="muted" className="text-xs text-center mt-2 mb-6">
          The requested project may have been removed or not yet synchronised.
        </T>
        <LuxuryButton title="Back to Home" onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  const totals = computeTotals(project.rooms, project.additionalItems ?? []);
  const isSubmitted = project.status === 'submitted';
  const isPendingSend = project.status === 'pending_send';

  // Average power density W/m²
  const totalArea = project.rooms.reduce((acc, r) => acc + r.length * r.width, 0);
  const powerDensity = totalArea > 0 ? (totals.watts / totalArea).toFixed(1) : '0.0';

  const handleGeneratePdf = async () => {
    try {
      haptic.tick();
      setIsGeneratingPdf(true);
      await generateProjectPdf(project);
    } catch (err: any) {
      Alert.alert('PDF Error', err?.message || 'Could not generate the PDF specification.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const hasItems = project.rooms.some((r) => !!r.selectedItem) || (project.additionalItems?.length ?? 0) > 0;

  return (
    <SafeAreaView
      className="flex-1 bg-[#0e0e0e]"
      style={{ flex: 1, height: '100%', maxHeight: '100%', overflow: 'hidden' }}
      edges={['top', 'left', 'right']}
    >
      {/* Top Header */}
      <View className="px-5 py-3 border-b border-white/[0.08] flex-row items-center justify-between bg-[#0e0e0e]">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/[0.06] items-center justify-center mr-2 active:bg-white/[0.12]"
        >
          <ArrowLeft size={18} color="#d9b277" />
        </Pressable>
        <View className="flex-1">
          <T variant="caption" className="text-zinc-400">
            LIGHTING PROJECT
          </T>
          <T variant="bodyMd" numberOfLines={1} className="text-white font-bold">
            {project.projectName}
          </T>
        </View>
        <StandardsBadge label="AS/NZS 1680" highlight />
      </View>

      <ScrollView
        className="flex-1 px-5 pt-3"
        style={{ flex: 1, minHeight: 0 }}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Executive Card */}
        <GlowCard active={isSubmitted} tone="dark" className="p-5 mb-5">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <View
                className={`w-2.5 h-2.5 rounded-full ${
                  isSubmitted ? 'bg-emerald-400' : isPendingSend ? 'bg-amber-400' : 'bg-[#d9b277]'
                }`}
              />
              <T
                variant="caption"
                className={`font-bold uppercase tracking-wider text-[10px] ${
                  isSubmitted
                    ? 'text-emerald-400'
                    : isPendingSend
                    ? 'text-amber-400'
                    : 'text-[#d9b277]'
                }`}
              >
                {isSubmitted
                  ? `RFQ SENT TO QLS · ${project.rfqCode || ''}`
                  : isPendingSend
                  ? `SEND QUEUE · ${project.rfqCode || ''}`
                  : `DRAFT · ${project.id.slice(-6).toUpperCase()}`}
              </T>
            </View>

            {project.rfqCode && (
              <T variant="caption" className="text-zinc-500 text-[10px]">
                {project.rfqCode}
              </T>
            )}
          </View>

          <T variant="display" className="text-2xl text-white">
            {project.projectName}
          </T>

          {project.clientName ? (
            <T variant="bodyMd" className="text-zinc-300 mt-1">
              Client / Firm: {project.clientName}
            </T>
          ) : null}

          {project.projectAddress ? (
            <T variant="caption" className="text-zinc-400 mt-0.5">
              Address: {project.projectAddress}
            </T>
          ) : null}

          {/* Impact KPI Grid */}
          <View className="flex-row items-center justify-between mt-5 pt-4 border-t border-white/10">
            <View>
              <T variant="caption" className="text-zinc-400 text-[10px]">
                POINTS
              </T>
              <T variant="h3" className="text-white mt-0.5">
                {totals.pieces} ea
              </T>
            </View>
            <View>
              <T variant="caption" className="text-zinc-400 text-[10px]">
                LINEAR
              </T>
              <T variant="h3" className="text-white mt-0.5">
                {totals.linearMetres} m
              </T>
            </View>
            <View>
              <T variant="caption" className="text-zinc-400 text-[10px]">
                LOAD
              </T>
              <T variant="h3" className="text-[#d9b277] mt-0.5">
                {totals.watts} W
              </T>
            </View>
            <View>
              <T variant="caption" className="text-zinc-400 text-[10px]">
                EFFICIENCY
              </T>
              <T variant="h3" className="text-emerald-400 mt-0.5">
                {powerDensity} W/m²
              </T>
            </View>
            <View>
              <T variant="caption" className="text-zinc-400 text-[10px]">
                EST. TOTAL
              </T>
              <T variant="h3" className="text-white mt-0.5">
                ${totals.cost.toFixed(0)}
              </T>
            </View>
          </View>
        </GlowCard>

        {/* Disclaimer Notice */}
        <View className="bg-[#141414] border border-white/5 rounded-[14px] p-3 mb-5">
          <T variant="caption" className="text-zinc-400 text-[11px] leading-relaxed">
            <strong>Preliminary Estimate:</strong> Photometric calculation via Lumen Method (AS/NZS 1680). Values subject to stock validation, batch availability and issue of a formal commercial proposal by QLS Lighting.
          </T>
        </View>

        {/* Actions */}
        <View className="gap-3 mb-6">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <LuxuryButton
                title="Add Space"
                variant="primary"
                icon={<Plus size={16} color="#0e0e0e" />}
                onPress={() => {
                  haptic.light();
                  router.push(`/room/new?projectId=${project.id}`);
                }}
              />
            </View>

            <View className="flex-1">
              <LuxuryButton
                title="Export PDF"
                variant="outline"
                loading={isGeneratingPdf}
                disabled={!hasItems}
                icon={<Share2 size={16} color="#f4f2ee" />}
                onPress={handleGeneratePdf}
              />
            </View>
          </View>

          {hasItems && (
            <LuxuryButton
              title={
                isSubmitted
                  ? 'Resend / Update RFQ to QLS'
                  : 'Request Official Quote (RFQ) from QLS'
              }
              variant={isSubmitted ? 'outline' : 'glow'}
              icon={<Send size={16} color={isSubmitted ? '#d9b277' : '#0e0e0e'} />}
              onPress={() => {
                haptic.tick();
                setShowRfqSheet(true);
              }}
            />
          )}
        </View>

        {/* Spaces Schedule */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <T variant="eyebrow" className="text-[#d9b277]">
              ARCHITECTURAL SPACES ({project.rooms.length})
            </T>
          </View>

          {project.rooms.length === 0 ? (
            <GlowCard tone="dark" className="p-6 items-center justify-center">
              <Layers size={28} color="#71717a" />
              <T variant="h3" className="mt-2 text-center text-white text-sm">
                No spaces added
              </T>
              <T variant="muted" className="text-xs text-center mt-1 px-4 leading-relaxed">
                Add rooms to calculate illuminance and generate the bill of materials.
              </T>
            </GlowCard>
          ) : (
            <View className="gap-3">
              {project.rooms.map((room, index) => {
                const item = room.selectedItem;
                const isContinuous = item && item.product.unit === 'm';
                const totalItemPrice = item ? itemTotalCost(item) : 0;

                return (
                  <View
                    key={room.id}
                    className="p-4 rounded-[20px] bg-[#181818] border border-white/10"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-2">
                        <View className="w-5 h-5 rounded-full bg-[#222222] border border-white/15 items-center justify-center">
                          <T variant="caption" className="font-bold text-[#d9b277] text-[10px]">
                            {index + 1}
                          </T>
                        </View>
                        <T variant="h3" className="text-white text-base">
                          {room.name}
                        </T>
                      </View>
                      <Pressable
                        onPress={() => {
                          haptic.light();
                          Alert.alert('Remove Space', `Remove "${room.name}" from the project?`, [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Remove',
                              style: 'destructive',
                              onPress: () => {
                                haptic.tick();
                                removeRoom(room.id);
                              },
                            },
                          ]);
                        }}
                        className="p-1.5 rounded-full bg-white/5 active:bg-white/10"
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </Pressable>
                    </View>

                    <T variant="muted" className="text-xs mb-3">
                      {room.length}m × {room.width}m ({(room.length * room.width).toFixed(1)} m²) · Target: {room.targetLux} Lux
                    </T>

                    {item ? (
                      <View className="bg-[#141414] p-3 rounded-[16px] border border-white/10">
                        <View className="flex-row items-center gap-3">
                          <Image
                            source={{ uri: item.product.imageUrl }}
                            className="w-14 h-14 rounded-[12px] bg-zinc-800"
                          />
                          <View className="flex-1">
                            <T variant="bodyMd" className="font-bold text-white text-sm" numberOfLines={1}>
                              {item.product.name}
                            </T>
                            <T variant="caption" className="text-[#d9b277] mt-0.5">
                              {item.quantity} {isContinuous ? 'linear metres' : 'pieces'} · {item.selectedFinish}
                            </T>
                            <T variant="caption" className="text-zinc-400 mt-0.5">
                              {item.luxAchieved} Lux · ${totalItemPrice.toFixed(2)} AUD
                            </T>
                          </View>
                        </View>

                        {/* Kit summary inside card */}
                        {item.kit && item.kit.length > 0 && (
                          <View className="mt-2.5 pt-2 border-t border-white/[0.06] gap-1">
                            {item.kit.map((k, ki) => (
                              <View key={ki} className="flex-row items-center justify-between">
                                <T variant="caption" className="text-zinc-400 text-[11px]">
                                  + {k.role.toUpperCase()}: {k.product.name}
                                </T>
                                <T variant="caption" className="text-zinc-300 text-[11px] font-medium">
                                  {k.quantity} ea · ${k.subtotal.toFixed(2)}
                                </T>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ) : (
                      <T variant="caption" className="text-amber-400">
                        Awaiting luminaire configuration
                      </T>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Additional Items (Catalogue Add-ons) */}
        {(project.additionalItems?.length ?? 0) > 0 && (
          <View className="mb-6">
            <T variant="eyebrow" className="text-[#d9b277] mb-3">
              ADDITIONAL CATALOGUE ITEMS ({project.additionalItems?.length})
            </T>
            <View className="gap-2.5">
              {project.additionalItems?.map((item) => (
                <View
                  key={item.id}
                  className="p-3.5 rounded-[16px] bg-[#181818] border border-white/10 flex-row items-center justify-between"
                >
                  <View className="flex-1 pr-3">
                    <T variant="bodyMd" className="text-white font-semibold text-sm" numberOfLines={1}>
                      {item.product.name}
                    </T>
                    <T variant="caption" className="text-zinc-400 mt-0.5">
                      {item.quantity} {item.product.unit === 'm' ? 'm' : 'ea'} · SKU: {item.product.sku}
                    </T>
                    <T variant="caption" className="text-[#d9b277] font-medium mt-0.5">
                      ${itemTotalCost(item).toFixed(2)} AUD
                    </T>
                  </View>
                  <Pressable
                    onPress={() => {
                      haptic.light();
                      removeAdditionalItem(item.id);
                    }}
                    className="p-2 rounded-full bg-white/5 active:bg-white/10"
                  >
                    <Trash2 size={14} color="#ef4444" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* RFQ Sheet Modal */}
      <RfqSheet
        visible={showRfqSheet}
        onClose={() => setShowRfqSheet(false)}
        project={project}
      />
    </SafeAreaView>
  );
}
