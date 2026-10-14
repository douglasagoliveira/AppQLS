import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { RoomWizard } from '../../components/RoomWizard';
import { T } from '../../components/ui';
import { useProjectStore } from '../../store/useProjectStore';

export default function ConsultantTabScreen() {
  const { currentProject, ensureCurrentProject } = useProjectStore();
  const project = currentProject || ensureCurrentProject();

  return (
    <SafeAreaView className="flex-1 bg-[#0e0e0e]">
      {/* Top Header */}
      <View className="px-5 py-3 border-b border-white/[0.08] flex-row items-center justify-between bg-[#0e0e0e]">
        <View className="flex-row items-center gap-2">
          <Sparkles size={18} color="#d9b277" />
          <T variant="h3" className="text-white">
            Consultor IA QLS
          </T>
        </View>
        <T variant="caption" className="text-zinc-500">
          AS/NZS 1680
        </T>
      </View>

      <RoomWizard projectId={project.id} />
    </SafeAreaView>
  );
}
