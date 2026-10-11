import { useLocalSearchParams, useRouter } from 'expo-router';
import { Award, Check, ChevronDown, Flame, Info, Layers, Minus, Plus, ShieldCheck, Sparkles, Tag, Zap } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { recommendRoomLighting } from '../../lib/recommendationEngine';
import { useProjectStore } from '../../store/useProjectStore';
import { ProductTier, Room, RoomType, SelectedRoomItem } from '../../types';

export default function RecommendationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    projectId: string;
    roomType: RoomType;
    roomName: string;
    length: string;
    width: string;
    height: string;
  }>();

  const { addOrUpdateRoom } = useProjectStore();

  const lengthNum = parseFloat(params.length || '4.5');
  const widthNum = parseFloat(params.width || '3.2');
  const heightNum = parseFloat(params.height || '2.7');

  // Compute recommendation
  const calcResult = useMemo(() => {
    return recommendRoomLighting({
      roomName: params.roomName || 'Custom Room',
      roomType: params.roomType || 'living_room',
      length: lengthNum,
      width: widthNum,
      height: heightNum,
    });
  }, [params.roomName, params.roomType, lengthNum, widthNum, heightNum]);

  // Selected Tier (default: recommended)
  const [selectedTier, setSelectedTier] = useState<ProductTier>('recommended');
  
  // Current tier product & initial calculation
  const currentTierData = calcResult.recommendedProducts[selectedTier];
  
  // Local quantity adjustment
  const [customQty, setCustomQty] = useState(currentTierData.quantity);
  // Local finish selection
  const [selectedFinish, setSelectedFinish] = useState(
    currentTierData.product.finishes[0] || 'Standard'
  );

  // When tier changes, reset quantity & finish to tier defaults
  const handleSelectTier = (tier: ProductTier) => {
    setSelectedTier(tier);
    const tierData = calcResult.recommendedProducts[tier];
    setCustomQty(tierData.quantity);
    setSelectedFinish(tierData.product.finishes[0] || 'Standard');
  };

  const activeProduct = currentTierData.product;
  const currentLux = Math.round(
    (customQty * activeProduct.lumens * 0.65 * 0.8) / Math.max(1, calcResult.areaM2)
  );

  const handleConfirmSelection = () => {
    const selectedItem: SelectedRoomItem = {
      id: `item-${Date.now()}`,
      roomId: `room-${Date.now()}`,
      product: activeProduct,
      quantity: customQty,
      selectedFinish,
      tierType: selectedTier,
      unitPrice: activeProduct.basePrice,
      subtotal: Math.round(customQty * activeProduct.basePrice * 100) / 100,
      luxAchieved: currentLux,
    };

    const newRoom: Room = {
      id: `room-${Date.now()}`,
      projectId: params.projectId || '',
      name: params.roomName || 'Room',
      roomType: params.roomType || 'living_room',
      length: lengthNum,
      width: widthNum,
      height: heightNum,
      targetLux: calcResult.targetLux,
      requiredLumens: calcResult.totalLumensRequired,
      selectedItem,
      calculation: calcResult,
      createdAt: new Date().toISOString(),
    };

    addOrUpdateRoom(newRoom);
    router.replace(`/project/${params.projectId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <ScrollView className="flex-1 px-5 pt-2">
        {/* Room Photometric Target Header */}
        <View className="bg-dark-800/90 border border-dark-700/80 rounded-2xl p-4 mb-5">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-extrabold text-white">{calcResult.roomName}</Text>
            <Text className="text-xs font-bold text-primary-400">
              {calcResult.areaM2} m² ({lengthNum}m × {widthNum}m)
            </Text>
          </View>
          <Text className="text-xs text-dark-300">
            AS/NZS Target: <Text className="text-white font-bold">{calcResult.targetLux} Lux</Text> · Total Required Flux: <Text className="text-primary-400 font-bold">{calcResult.totalLumensRequired} Lumens</Text>
          </Text>
        </View>

        {/* 3 Tier Selector Tabs */}
        <Text className="text-xs font-extrabold uppercase tracking-wider text-dark-400 mb-2">
          Engineered Options (Select One)
        </Text>
        <View className="flex-row gap-2 mb-5">
          {/* Recommended Option Tab */}
          <Pressable
            onPress={() => handleSelectTier('recommended')}
            className={`flex-1 p-3 rounded-xl border ${
              selectedTier === 'recommended'
                ? 'bg-primary-500/15 border-primary-500'
                : 'bg-dark-800/70 border-dark-700'
            }`}
          >
            <View className="flex-row items-center gap-1 mb-1">
              <Sparkles size={14} color="#c29223" />
              <Text className="text-xs font-bold text-primary-400">Recommended</Text>
            </View>
            <Text className="text-xs text-white font-bold" numberOfLines={1}>
              {calcResult.recommendedProducts.recommended.product.name}
            </Text>
          </Pressable>

          {/* Premium Option Tab */}
          <Pressable
            onPress={() => handleSelectTier('premium')}
            className={`flex-1 p-3 rounded-xl border ${
              selectedTier === 'premium'
                ? 'bg-purple-500/15 border-purple-400'
                : 'bg-dark-800/70 border-dark-700'
            }`}
          >
            <View className="flex-row items-center gap-1 mb-1">
              <Award size={14} color="#c084fc" />
              <Text className="text-xs font-bold text-purple-400">Premium</Text>
            </View>
            <Text className="text-xs text-white font-bold" numberOfLines={1}>
              {calcResult.recommendedProducts.premium.product.name}
            </Text>
          </Pressable>

          {/* Budget Option Tab */}
          <Pressable
            onPress={() => handleSelectTier('budget')}
            className={`flex-1 p-3 rounded-xl border ${
              selectedTier === 'budget'
                ? 'bg-emerald-500/15 border-emerald-400'
                : 'bg-dark-800/70 border-dark-700'
            }`}
          >
            <View className="flex-row items-center gap-1 mb-1">
              <Tag size={14} color="#34d399" />
              <Text className="text-xs font-bold text-emerald-400">Budget</Text>
            </View>
            <Text className="text-xs text-white font-bold" numberOfLines={1}>
              {calcResult.recommendedProducts.budget.product.name}
            </Text>
          </Pressable>
        </View>

        {/* Active Product Detailed Card */}
        <View className="bg-dark-800 border border-dark-700 rounded-2xl p-5 mb-5">
          <Image
            source={{ uri: activeProduct.imageUrl }}
            className="w-full h-44 rounded-xl bg-dark-900 mb-4"
            resizeMode="cover"
          />

          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs font-bold text-primary-400 uppercase tracking-wider">
              SKU: {activeProduct.sku}
            </Text>
            <Text className="text-base font-extrabold text-white">
              ${activeProduct.basePrice.toFixed(2)} AUD <Text className="text-xs text-dark-400 font-normal">/ ea</Text>
            </Text>
          </View>

          <Text className="text-lg font-bold text-white mb-2">{activeProduct.name}</Text>
          <Text className="text-xs text-dark-300 leading-relaxed mb-4">
            {activeProduct.description}
          </Text>

          {/* Technical Specifications Grid */}
          <View className="bg-dark-900/80 rounded-xl p-3.5 border border-dark-700/60 mb-5">
            <View className="flex-row flex-wrap gap-y-3">
              <View className="w-1/2">
                <Text className="text-xs text-dark-400">Flux Output</Text>
                <Text className="text-xs font-bold text-white mt-0.5">{activeProduct.lumens} lm / unit</Text>
              </View>
              <View className="w-1/2">
                <Text className="text-xs text-dark-400">Power Rating</Text>
                <Text className="text-xs font-bold text-white mt-0.5">{activeProduct.powerWatts} Watts</Text>
              </View>
              <View className="w-1/2">
                <Text className="text-xs text-dark-400">Color Temp (CCT)</Text>
                <Text className="text-xs font-bold text-white mt-0.5">{activeProduct.cctKelvin}K Warm White</Text>
              </View>
              <View className="w-1/2">
                <Text className="text-xs text-dark-400">Color Rendering (CRI)</Text>
                <Text className="text-xs font-bold text-primary-400 mt-0.5">Ra {activeProduct.cri}+</Text>
              </View>
              <View className="w-1/2">
                <Text className="text-xs text-dark-400">Beam Angle</Text>
                <Text className="text-xs font-bold text-white mt-0.5">{activeProduct.beamAngle}° Medium</Text>
              </View>
              <View className="w-1/2">
                <Text className="text-xs text-dark-400">Protection Rating</Text>
                <Text className="text-xs font-bold text-white mt-0.5">{activeProduct.ipRating}</Text>
              </View>
            </View>
          </View>

          {/* Finish / Color Selector */}
          <Text className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">
            Select Finish / Body Color
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {activeProduct.finishes.map((f) => {
              const isSelected = selectedFinish === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => setSelectedFinish(f)}
                  className={`py-2 px-3 rounded-lg border flex-row items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary-500/20 border-primary-500'
                      : 'bg-dark-900 border-dark-700'
                  }`}
                >
                  {isSelected && <Check size={12} color="#c29223" />}
                  <Text className={`text-xs font-semibold ${isSelected ? 'text-primary-400' : 'text-dark-300'}`}>
                    {f}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Quantity Controls & Live Photometric Lux */}
          <View className="bg-dark-900 p-4 rounded-xl border border-dark-700 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-dark-400">Suggested Quantity</Text>
              <View className="flex-row items-center gap-3 mt-1.5">
                <Pressable
                  onPress={() => setCustomQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-700 items-center justify-center active:bg-dark-700"
                >
                  <Minus size={16} color="#ffffff" />
                </Pressable>
                <Text className="text-lg font-black text-white">{customQty}</Text>
                <Pressable
                  onPress={() => setCustomQty((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-700 items-center justify-center active:bg-dark-700"
                >
                  <Plus size={16} color="#ffffff" />
                </Pressable>
              </View>
            </View>

            <View className="items-end">
              <Text className="text-xs text-dark-400">Lux Achieved</Text>
              <Text className={`text-lg font-black mt-1 ${currentLux >= calcResult.targetLux ? 'text-primary-400' : 'text-yellow-500'}`}>
                {currentLux} Lux
              </Text>
              <Text className="text-[10px] text-dark-400">
                (Target: {calcResult.targetLux} Lux)
              </Text>
            </View>
          </View>
        </View>

        {/* Confirm Selection Button */}
        <Pressable
          onPress={handleConfirmSelection}
          className="flex-row items-center justify-center gap-2 bg-primary-500 active:bg-primary-600 py-4 px-6 rounded-xl shadow-lg shadow-primary-500/25 mb-10"
        >
          <Check size={18} color="#09090b" strokeWidth={2.5} />
          <Text className="text-dark-900 font-extrabold text-base">
            Confirm for {calcResult.roomName} (${(customQty * activeProduct.basePrice).toFixed(2)} AUD)
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
