import React, { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Box,
  Check,
  ExternalLink,
  FileText,
  Minus,
  Plus,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { BeamPreview, GlowCard, LuxuryButton, StandardsBadge, T } from '../../components/ui';
import { haptic } from '../../lib/haptics';
import { getProductById, isContinuousSource } from '../../lib/catalog';
import { buildKit, kitSubtotal } from '../../lib/kitEngine';
import { useProjectStore } from '../../store/useProjectStore';
import { cctToColor } from '../../theme/tokens';
import { SelectedRoomItem } from '../../types';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ensureCurrentProject, addAdditionalItem } = useProjectStore();

  const product = getProductById(id as string);

  const [activeCct, setActiveCct] = useState<number>(product?.cctKelvin || 3000);
  const [quantity, setQuantity] = useState<number>(product?.unit === 'm' ? 5 : 1);
  const [selectedFinish, setSelectedFinish] = useState<string>(
    product?.finishes?.[0] || 'Standard'
  );

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-[#0e0e0e] justify-center items-center px-6">
        <T variant="h2" className="text-white text-center">
          Product Not Found
        </T>
        <LuxuryButton title="Back to Catalogue" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const isContinuous = isContinuousSource(product) || product.unit === 'm';

  // Kit calculation if continuous
  const kitResult = isContinuous
    ? buildKit(product, quantity, {
        dimming: product.dimmingType === 'dali' ? 'dali' : product.dimmingType === 'triac' ? 'triac' : 'none',
      })
    : null;

  const kitCost = kitResult ? kitSubtotal(kitResult.lines) : 0;
  const productSubtotal = Math.round(quantity * product.basePrice * 100) / 100;
  const totalCost = Math.round((productSubtotal + kitCost) * 100) / 100;

  const handleAddToProject = (requestQuoteImmediately = false) => {
    haptic.success();
    const proj = ensureCurrentProject();

    const additionalItem: SelectedRoomItem = {
      id: `add-item-${Date.now()}`,
      product: {
        ...product,
        cctKelvin: activeCct,
      },
      quantity,
      selectedFinish,
      tierType: 'recommended',
      unitPrice: product.basePrice,
      subtotal: productSubtotal,
      luxAchieved: 0,
      kit: kitResult?.lines,
      kitMissing: kitResult?.missing,
    };

    addAdditionalItem(additionalItem);

    if (requestQuoteImmediately) {
      router.push(`/project/${proj.id}?rfq=1`);
    } else {
      Alert.alert(
        'Item Added!',
        `"${product.name}" (${quantity} ${product.unit === 'm' ? 'm' : 'ea'}) has been added to project "${proj.projectName}".`,
        [
          { text: 'Continue Browsing', style: 'cancel' },
          {
            text: 'View Project',
            onPress: () => router.push(`/project/${proj.id}`),
          },
        ]
      );
    }
  };

  const handleOpenSourceUrl = () => {
    const url = product.sourceUrl || product.datasheetUrl || 'https://www.ledyilighting.com/';
    Linking.openURL(url);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0e0e0e]">
      {/* Top Header */}
      <View className="px-5 py-3 border-b border-white/[0.08] flex-row items-center justify-between bg-[#0e0e0e]">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/[0.06] items-center justify-center mr-2 active:bg-white/[0.12]"
        >
          <ArrowLeft size={18} color="#d9b277" />
        </Pressable>
        <View className="flex-1 pr-2">
          <T variant="caption" className="text-[#d9b277] text-[10px] font-bold uppercase">
            {product.brand || 'LEDYi Lighting'}
          </T>
          <T variant="bodyMd" numberOfLines={1} className="text-white font-bold text-sm">
            {product.name}
          </T>
        </View>
        <StandardsBadge label={product.unit === 'm' ? 'Linear' : 'Luminaire'} highlight />
      </View>

      <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Product Image */}
        <View className="rounded-[22px] overflow-hidden bg-[#181818] border border-white/10 mb-4 aspect-[4/3]">
          <Image
            source={{ uri: product.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Title & Brand */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between">
            <T variant="caption" className="text-zinc-400 text-xs">
              SKU: {product.sku}
            </T>
            <T variant="h2" className="text-[#d9b277] text-xl">
              ${product.basePrice.toFixed(2)} AUD {product.unit === 'm' ? '/m' : 'ea'}
            </T>
          </View>
          <T variant="h2" className="text-white text-xl mt-1">
            {product.name}
          </T>
          {product.description ? (
            <T variant="muted" className="text-xs mt-2 leading-relaxed">
              {product.description}
            </T>
          ) : null}
        </View>

        {/* Optical & CCT Simulator */}
        <View className="bg-[#181818] border border-white/10 rounded-[18px] p-4 mb-5">
          <View className="flex-row items-center justify-between mb-2">
            <T variant="eyebrow" className="text-[#d9b277]">
              BEAM & CCT SIMULATOR
            </T>
            <T variant="caption" className="text-zinc-400">
              {activeCct}K
            </T>
          </View>

          <View className="py-2 items-center">
            <BeamPreview
              beamAngle={product.beamAngle || 120}
              cctKelvin={activeCct}
              lumens={product.lumens}
            />
          </View>

          <View className="flex-row gap-2 mt-3">
            {[2700, 3000, 4000, 6500].map((k) => {
              const active = activeCct === k;
              return (
                <Pressable
                  key={k}
                  onPress={() => {
                    haptic.tick();
                    setActiveCct(k);
                  }}
                  className={`flex-1 py-2 rounded-[10px] border items-center flex-row justify-center gap-1.5 ${
                    active ? 'bg-[#d9b277] border-[#d9b277]' : 'bg-[#141414] border-white/10'
                  }`}
                >
                  <View
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cctToColor(k) }}
                  />
                  <T
                    variant="caption"
                    className={`text-[11px] font-semibold ${
                      active ? 'text-black font-bold' : 'text-zinc-300'
                    }`}
                  >
                    {k}K
                  </T>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Quantity Stepper */}
        <View className="bg-[#181818] border border-white/10 rounded-[18px] p-4 mb-5 flex-row items-center justify-between">
          <View>
            <T variant="bodyMd" className="text-white font-medium">
              {isContinuous ? 'Linear Length' : 'Quantity'}
            </T>
            <T variant="caption" className="text-zinc-400 text-xs">
              {isContinuous ? 'Metres of continuous strip' : 'Units for quotation'}
            </T>
          </View>

          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => {
                haptic.tick();
                setQuantity((q) => Math.max(1, q - 1));
              }}
              className="w-9 h-9 rounded-[10px] bg-white/[0.08] items-center justify-center active:bg-white/[0.15]"
            >
              <Minus size={16} color="#ffffff" />
            </Pressable>
            <T variant="h3" className="text-white min-w-[32px] text-center">
              {quantity} {product.unit === 'm' ? 'm' : 'ea'}
            </T>
            <Pressable
              onPress={() => {
                haptic.tick();
                setQuantity((q) => q + 1);
              }}
              className="w-9 h-9 rounded-[10px] bg-[#d9b277]/20 items-center justify-center active:bg-[#d9b277]/30"
            >
              <Plus size={16} color="#d9b277" />
            </Pressable>
          </View>
        </View>

        {/* Compatible Kit Box for Strips */}
        {kitResult && (
          <View className="bg-[#181818] border border-[#d9b277]/30 rounded-[18px] p-4 mb-5">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <Box size={16} color="#d9b277" />
                <T variant="eyebrow" className="text-[#d9b277]">
                  RECOMMENDED COMPATIBLE KIT
                </T>
              </View>
              <T variant="caption" className="text-zinc-400">
                +${kitCost.toFixed(2)} AUD
              </T>
            </View>

            <View className="gap-2 mt-2">
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
                    {k.quantity} ea · ${k.subtotal.toFixed(2)}
                  </T>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Technical Specifications Table */}
        <View className="mb-5">
          <T variant="eyebrow" className="text-[#d9b277] mb-2.5">
            TECHNICAL SPECIFICATIONS
          </T>

          <View className="bg-[#181818] border border-white/10 rounded-[18px] p-4 gap-2.5">
            {[
              { label: 'Brand / Origin', val: `${product.brand || 'LEDYi'} (QLS Authorised Distribution)` },
              { label: 'Supply Voltage', val: product.voltage ? `${product.voltage}V DC` : '220–240V AC' },
              { label: 'Power Consumption', val: `${product.powerWatts} ${isContinuous ? 'W/m' : 'W'}` },
              { label: 'Luminous Flux', val: `${product.lumens} lm ${isContinuous ? '/m' : 'each'}` },
              { label: 'Colour Rendering (CRI)', val: product.cri ? `Ra ${product.cri}+` : 'N/A' },
              { label: 'Beam Angle', val: product.beamAngle ? `${product.beamAngle}°` : 'Diffused' },
              { label: 'Ingress Protection', val: product.ipRating || 'IP20' },
              { label: 'Dimming Type', val: (product.dimmingType || 'none').toUpperCase() },
              ...(product.widthMm ? [{ label: 'PCB / Profile Width', val: `${product.widthMm} mm` }] : []),
              ...(product.ugr ? [{ label: 'Glare Rating (UGR)', val: `≤ ${product.ugr}` }] : []),
            ].map((row, idx) => (
              <View key={idx} className="flex-row items-center justify-between py-1 border-b border-white/[0.04]">
                <T variant="caption" className="text-zinc-400">
                  {row.label}
                </T>
                <T variant="caption" className="text-white font-semibold">
                  {row.val}
                </T>
              </View>
            ))}
          </View>
        </View>

        {/* Datasheet Link */}
        <Pressable
          onPress={handleOpenSourceUrl}
          className="p-3.5 rounded-[14px] bg-[#181818] border border-white/10 flex-row items-center justify-between mb-6"
        >
          <View className="flex-row items-center gap-2.5">
            <ExternalLink size={16} color="#d9b277" />
            <T variant="bodyMd" className="text-white text-xs font-medium">
              View full specifications on ledyilighting.com
            </T>
          </View>
          <T variant="caption" className="text-[#d9b277]">
            Open
          </T>
        </Pressable>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-[#0e0e0e]/95 border-t border-white/[0.08] flex-row gap-3">
        <View className="flex-1">
          <Pressable
            onPress={() => handleAddToProject(false)}
            className="py-3.5 px-4 rounded-[14px] bg-white/[0.08] items-center justify-center border border-white/10 active:bg-white/[0.15]"
          >
            <T variant="bodyMd" className="text-white font-semibold text-center text-xs">
              + Add to Project (${totalCost.toFixed(2)})
            </T>
          </Pressable>
        </View>

        <View className="flex-1">
          <LuxuryButton
            title="Request Quote"
            icon={<Send size={16} color="#0e0e0e" />}
            onPress={() => handleAddToProject(true)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
