import React from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { RoomWizard } from '../../components/RoomWizard';
import { T } from '../../components/ui';
import { useProjectStore } from '../../store/useProjectStore';

export default function NewRoomScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { currentProject } = useProjectStore();

  const targetProjectId = projectId || currentProject?.id || '';

  return (
    <SafeAreaView
      className="flex-1 bg-[#0e0e0e]"
      style={{ flex: 1, height: '100%', maxHeight: '100%', overflow: 'hidden' }}
      edges={['top', 'left', 'right']}
    >
      {/* Top Bar with Close button */}
      <View className="px-5 py-3 border-b border-white/[0.08] bg-[#0e0e0e] flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <T variant="eyebrow" className="text-[#d9b277]">
            QLS LIGHTING
          </T>
          <T variant="caption" className="text-zinc-600">
            ·
          </T>
          <T variant="h3" className="text-white text-base">
            Add Space
          </T>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/[0.06] items-center justify-center active:bg-white/[0.12]"
        >
          <X size={18} color="#a1a1aa" />
        </Pressable>
      </View>

      <View style={{ flex: 1, minHeight: 0, height: '100%', overflow: 'hidden' }}>
        <RoomWizard projectId={targetProjectId} />
      </View>
    </SafeAreaView>
  );
}
