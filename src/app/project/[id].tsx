import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Building2, CheckCircle2, ChevronRight, Download, FileText, Layers, Plus, Send, Share2, Sparkles, Trash2, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { generateProjectPdf } from '../../services/pdfService';
import { submitRfqToSupabase } from '../../services/supabaseService';
import { useProjectStore } from '../../store/useProjectStore';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentProject, removeRoom, projectsList, userProfile, setProjectStatus } = useProjectStore();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSubmittingRfq, setIsSubmittingRfq] = useState(false);

  const project = currentProject?.id === id ? currentProject : projectsList.find((p) => p.id === id);

  if (!project) {
    return (
      <SafeAreaView className="flex-1 bg-dark-900 items-center justify-center p-6">
        <Text className="text-white text-lg font-bold">Project not found</Text>
        <Pressable
          onPress={() => router.replace('/')}
          className="mt-4 bg-primary-500 py-3 px-6 rounded-xl"
        >
          <Text className="text-dark-900 font-bold">Return Home</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleGeneratePdf = async () => {
    if (project.rooms.length === 0) {
      Alert.alert('Empty Project', 'Please add at least one room before generating a proposal.');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      await generateProjectPdf(project);
    } catch (err: any) {
      Alert.alert('PDF Generation Error', err?.message || 'Could not export proposal PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSubmitRfq = async () => {
    if (project.rooms.length === 0) {
      Alert.alert('Incomplete Project', 'Please add at least one room with fixtures before submitting an RFQ.');
      return;
    }

    try {
      setIsSubmittingRfq(true);
      const res = await submitRfqToSupabase(project, userProfile);
      setProjectStatus('submitted');
      Alert.alert(
        'RFQ Submitted to Factory! 🚀',
        `Your Request for Quote (${res.rfqCode || 'RFQ-' + project.id.slice(-6).toUpperCase()}) has been registered and synced with QLS engineering. You can also export the proposal PDF.`,
        [{ text: 'Awesome!' }]
      );
    } catch (err: any) {
      Alert.alert('RFQ Submission Notice', err?.message || 'RFQ logged locally.');
    } finally {
      setIsSubmittingRfq(false);
    }
  };

  const isSubmitted = project.status === 'submitted';

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <ScrollView className="flex-1 px-5 pt-2">
        {/* Project Header Info */}
        <View className="bg-dark-800/90 border border-dark-700/90 rounded-2xl p-5 mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <View className={`w-2.5 h-2.5 rounded-full ${isSubmitted ? 'bg-green-500' : 'bg-primary-500'}`} />
              <Text className={`text-xs font-bold uppercase tracking-widest ${isSubmitted ? 'text-green-400' : 'text-primary-400'}`}>
                {isSubmitted ? 'RFQ SUBMITTED' : `RFQ-${project.id.slice(-6).toUpperCase()}`}
              </Text>
            </View>
            <Text className="text-xs text-dark-400">
              {new Date(project.createdAt).toLocaleDateString('en-AU')}
            </Text>
          </View>

          <Text className="text-2xl font-black text-white">{project.projectName}</Text>
          {project.clientName ? (
            <Text className="text-sm font-semibold text-dark-300 mt-1">
              Client: {project.clientName}
            </Text>
          ) : null}
          {project.projectAddress ? (
            <Text className="text-xs text-dark-400 mt-0.5">{project.projectAddress}</Text>
          ) : null}

          {/* Quick Metrics */}
          <View className="flex-row items-center justify-between mt-5 pt-4 border-t border-dark-700/70">
            <View>
              <Text className="text-xs text-dark-400">Total Rooms</Text>
              <Text className="text-lg font-extrabold text-white mt-0.5">
                {project.rooms.length} Spaces
              </Text>
            </View>
            <View>
              <Text className="text-xs text-dark-400">Total Fixtures</Text>
              <Text className="text-lg font-extrabold text-white mt-0.5">
                {project.totalFixturesCount} pcs
              </Text>
            </View>
            <View>
              <Text className="text-xs text-dark-400">Connected Load</Text>
              <Text className="text-lg font-extrabold text-primary-400 mt-0.5">
                {project.totalPowerWatts} W
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons: Add Room, Export PDF & Submit RFQ */}
        <View className="gap-3 mb-6">
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push(`/room/new?projectId=${project.id}`)}
              className="flex-1 flex-row items-center justify-center gap-2 bg-primary-500 active:bg-primary-600 py-3.5 px-4 rounded-xl shadow-lg shadow-primary-500/20"
            >
              <Plus size={18} color="#09090b" strokeWidth={2.5} />
              <Text className="text-dark-900 font-bold text-sm">Add Room</Text>
            </Pressable>

            <Pressable
              onPress={handleGeneratePdf}
              disabled={isGeneratingPdf || project.rooms.length === 0}
              className={`flex-1 flex-row items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-dark-700 ${
                project.rooms.length > 0 ? 'bg-dark-800 active:bg-dark-700' : 'bg-dark-800/40 opacity-50'
              }`}
            >
              {isGeneratingPdf ? (
                <ActivityIndicator size="small" color="#c29223" />
              ) : (
                <>
                  <Share2 size={18} color="#f4f4f5" />
                  <Text className="text-white font-bold text-sm">Export PDF</Text>
                </>
              )}
            </Pressable>
          </View>

          {project.rooms.length > 0 && (
            <Pressable
              onPress={handleSubmitRfq}
              disabled={isSubmittingRfq}
              className={`flex-row items-center justify-center gap-2 py-3.5 px-4 rounded-xl border ${
                isSubmitted 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-primary-500/10 border-primary-500/30 active:bg-primary-500/20'
              }`}
            >
              {isSubmittingRfq ? (
                <ActivityIndicator size="small" color="#c29223" />
              ) : isSubmitted ? (
                <>
                  <CheckCircle2 size={18} color="#22c55e" />
                  <Text className="text-green-400 font-bold text-sm">RFQ Submitted & Synced</Text>
                </>
              ) : (
                <>
                  <Send size={18} color="#c29223" />
                  <Text className="text-primary-400 font-bold text-sm">Submit RFQ to Factory (Cloud Sync)</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* Room Specifications List */}
        <View className="mb-10">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-white">Engineered Spaces</Text>
            <Text className="text-xs text-dark-400">{project.rooms.length} configured</Text>
          </View>

          {project.rooms.length === 0 ? (
            <View className="p-8 rounded-2xl bg-dark-800/40 border border-dashed border-dark-700 items-center justify-center">
              <Layers size={28} color="#71717a" />
              <Text className="text-base font-semibold text-dark-200 mt-2">No rooms added yet</Text>
              <Text className="text-xs text-dark-400 text-center mt-1">
                Tap "Add Room" to enter space dimensions and receive AS/NZS 1680 compliant recommendations.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {project.rooms.map((room, index) => {
                const item = room.selectedItem;
                return (
                  <View
                    key={room.id}
                    className="p-4 rounded-xl bg-dark-800/90 border border-dark-700/80"
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center gap-2">
                        <View className="w-6 h-6 rounded-full bg-dark-700 items-center justify-center">
                          <Text className="text-xs font-bold text-dark-300">{index + 1}</Text>
                        </View>
                        <Text className="text-base font-bold text-white">{room.name}</Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          Alert.alert('Remove Room', `Remove "${room.name}" from project?`, [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Remove', style: 'destructive', onPress: () => removeRoom(room.id) },
                          ]);
                        }}
                        className="p-1.5 rounded-lg bg-dark-700/60"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </Pressable>
                    </View>

                    <Text className="text-xs text-dark-400 mb-3">
                      {room.length}m × {room.width}m ({(room.length * room.width).toFixed(1)} m²) · Ceiling H: {room.height}m · Target: {room.targetLux} Lux
                    </Text>

                    {item ? (
                      <View className="flex-row items-center gap-3 bg-dark-900/80 p-3 rounded-xl border border-dark-700/50">
                        <Image
                          source={{ uri: item.product.imageUrl }}
                          className="w-14 h-14 rounded-lg bg-dark-800"
                        />
                        <View className="flex-1">
                          <Text className="text-sm font-bold text-white" numberOfLines={1}>
                            {item.product.name}
                          </Text>
                          <Text className="text-xs text-primary-400 font-semibold mt-0.5">
                            {item.quantity} units · {item.selectedFinish}
                          </Text>
                          <Text className="text-xs text-dark-400 mt-0.5">
                            {item.luxAchieved} Lux Achieved · ${(item.subtotal).toFixed(2)} AUD
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Text className="text-xs text-yellow-500 font-semibold">
                        Awaiting product selection
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
