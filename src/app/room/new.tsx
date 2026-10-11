import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight, Check, Compass, Home, Info, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { AUSTRALIAN_LIGHTING_STANDARDS } from '../../lib/standards';
import { RoomType } from '../../types';

const ROOM_OPTIONS: { type: RoomType; label: string; iconName: string }[] = [
  { type: 'kitchen', label: 'Kitchen / Gourmet', iconName: 'Chef' },
  { type: 'living_room', label: 'Living Room / Lounge', iconName: 'Tv' },
  { type: 'dining_room', label: 'Dining Area', iconName: 'Utensils' },
  { type: 'bedroom', label: 'Bedroom / Suite', iconName: 'Bed' },
  { type: 'bathroom', label: 'Bathroom / Ensuite', iconName: 'Bath' },
  { type: 'home_office', label: 'Home Office / Study', iconName: 'Briefcase' },
  { type: 'outdoor_patio', label: 'Outdoor Patio / Deck (IP65)', iconName: 'Sun' },
  { type: 'commercial_office', label: 'Commercial Office Space', iconName: 'Building' },
  { type: 'retail', label: 'Retail / Showroom', iconName: 'ShoppingBag' },
  { type: 'warehouse', label: 'Warehouse / Garage', iconName: 'Box' },
];

export default function NewRoomScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

  const [roomType, setRoomType] = useState<RoomType>('kitchen');
  const [customName, setCustomName] = useState('');
  const [length, setLength] = useState('4.5');
  const [width, setWidth] = useState('3.2');
  const [height, setHeight] = useState('2.7');

  const selectedStandard = AUSTRALIAN_LIGHTING_STANDARDS[roomType];

  const handleProceed = () => {
    const l = parseFloat(length.replace(',', '.'));
    const w = parseFloat(width.replace(',', '.'));
    const h = parseFloat(height.replace(',', '.')) || 2.7;

    if (isNaN(l) || l <= 0 || isNaN(w) || w <= 0) {
      Alert.alert('Invalid Dimensions', 'Please provide valid length and width in meters.');
      return;
    }

    const name = customName.trim() || selectedStandard.label;

    router.push({
      pathname: '/room/recommendation',
      params: {
        projectId: projectId || '',
        roomType,
        roomName: name,
        length: l.toString(),
        width: w.toString(),
        height: h.toString(),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <ScrollView className="flex-1 px-5 pt-4">
        <Text className="text-xl font-black text-white">Select Space Type</Text>
        <Text className="text-xs text-dark-300 mt-0.5 mb-4">
          Each space type is automatically calibrated to Australian Standard AS/NZS 1680.
        </Text>

        {/* Room Type Selector Grid */}
        <View className="flex-row flex-wrap gap-2.5 mb-6">
          {ROOM_OPTIONS.map((opt) => {
            const isSelected = roomType === opt.type;
            return (
              <Pressable
                key={opt.type}
                onPress={() => {
                  setRoomType(opt.type);
                  if (!customName) setCustomName(opt.label);
                }}
                className={`py-3 px-3.5 rounded-xl border flex-row items-center gap-2 ${
                  isSelected
                    ? 'bg-primary-500/10 border-primary-500'
                    : 'bg-dark-800/80 border-dark-700/80 active:bg-dark-700'
                }`}
              >
                <View
                  className={`w-3.5 h-3.5 rounded-full border items-center justify-center ${
                    isSelected ? 'border-primary-500 bg-primary-500' : 'border-dark-500'
                  }`}
                >
                  {isSelected && <View className="w-1.5 h-1.5 rounded-full bg-dark-900" />}
                </View>
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? 'text-primary-400' : 'text-dark-200'
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Standard Info Banner */}
        <View className="bg-dark-800/80 border border-dark-700 p-4 rounded-xl mb-6 flex-row items-start gap-3">
          <Info size={18} color="#c29223" className="mt-0.5" />
          <View className="flex-1">
            <Text className="text-xs font-bold text-primary-400 uppercase tracking-wider">
              AS/NZS 1680 Requirement
            </Text>
            <Text className="text-xs text-dark-300 mt-1 leading-relaxed">
              Target: <Text className="font-bold text-white">{selectedStandard.targetLux} Lux</Text> · Min CRI: <Text className="font-bold text-white">{selectedStandard.minCRI}+</Text> · Rating: <Text className="font-bold text-white">{selectedStandard.minIPRating}</Text>
            </Text>
          </View>
        </View>

        {/* Custom Room Name */}
        <Text className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
          Room Name / Label
        </Text>
        <TextInput
          value={customName}
          onChangeText={setCustomName}
          placeholder={selectedStandard.label}
          placeholderTextColor="#71717a"
          className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3.5 text-white text-base mb-6"
        />

        {/* Dimension Inputs */}
        <Text className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
          Room Dimensions (Meters)
        </Text>
        <View className="flex-row gap-3 mb-8">
          <View className="flex-1">
            <Text className="text-xs text-dark-400 mb-1">Length (m)</Text>
            <TextInput
              value={length}
              onChangeText={setLength}
              keyboardType="decimal-pad"
              className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3.5 text-white text-base font-bold"
            />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-dark-400 mb-1">Width (m)</Text>
            <TextInput
              value={width}
              onChangeText={setWidth}
              keyboardType="decimal-pad"
              className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3.5 text-white text-base font-bold"
            />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-dark-400 mb-1">Ceiling H (m)</Text>
            <TextInput
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3.5 text-white text-base font-bold"
            />
          </View>
        </View>

        {/* Calculate & Recommend Button */}
        <Pressable
          onPress={handleProceed}
          className="flex-row items-center justify-center gap-2 bg-primary-500 active:bg-primary-600 py-4 px-6 rounded-xl shadow-lg shadow-primary-500/25 mb-10"
        >
          <Sparkles size={18} color="#09090b" strokeWidth={2.5} />
          <Text className="text-dark-900 font-extrabold text-base">Calculate & Recommend</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
