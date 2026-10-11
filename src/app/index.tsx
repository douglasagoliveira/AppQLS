import { useRouter } from 'expo-router';
import { ArrowRight, Building2, CheckCircle2, ChevronRight, FileText, Lightbulb, Plus, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { useProjectStore } from '../store/useProjectStore';

export default function HomeScreen() {
  const router = useRouter();
  const { projectsList, initNewProject, setCurrentProject } = useProjectStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');

  const handleCreateProject = () => {
    if (!projectName.trim()) return;
    const newProj = initNewProject(projectName.trim(), clientName.trim(), projectAddress.trim());
    setIsModalOpen(false);
    setProjectName('');
    setClientName('');
    setProjectAddress('');
    router.push(`/project/${newProj.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Header Branding */}
        <View className="flex-row items-center justify-between pb-6 border-b border-dark-800">
          <View>
            <Text className="text-2xl font-black text-white tracking-tight">QLS LIGHTING</Text>
            <Text className="text-xs font-semibold text-primary-400 uppercase tracking-widest mt-0.5">
              AI Technical Specification Engine
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/profile')}
            className="w-10 h-10 rounded-full bg-dark-800 border border-dark-700 items-center justify-center"
          >
            <Building2 size={18} color="#d4d4d8" />
          </Pressable>
        </View>

        {/* Hero Banner / Quick Action */}
        <View className="mt-6 p-5 rounded-2xl bg-gradient-to-r bg-dark-800 border border-dark-700/80">
          <View className="flex-row items-center gap-2 mb-2">
            <Sparkles size={18} color="#c29223" />
            <Text className="text-xs font-bold uppercase tracking-wider text-primary-400">
              AS/NZS 1680 Compliant
            </Text>
          </View>
          <Text className="text-xl font-bold text-white leading-tight">
            Engineer your lighting project in minutes.
          </Text>
          <Text className="text-sm text-dark-300 mt-2 leading-relaxed">
            Enter room dimensions, receive exact fixture quantities and export an official factory RFQ quote in PDF.
          </Text>

          <Pressable
            onPress={() => setIsModalOpen(true)}
            className="mt-5 flex-row items-center justify-center gap-2 bg-primary-500 active:bg-primary-600 py-3.5 px-5 rounded-xl shadow-lg shadow-primary-500/20"
          >
            <Plus size={20} color="#09090b" strokeWidth={2.5} />
            <Text className="text-dark-900 font-bold text-base">New Lighting Project</Text>
          </Pressable>
        </View>

        {/* Recent Projects Section */}
        <View className="mt-8 mb-10">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-white">Recent Projects</Text>
            <Text className="text-xs text-dark-400">{projectsList.length} Total</Text>
          </View>

          {projectsList.length === 0 ? (
            <View className="p-8 rounded-2xl bg-dark-800/40 border border-dashed border-dark-700 items-center justify-center">
              <View className="w-12 h-12 rounded-full bg-dark-800 items-center justify-center mb-3">
                <Lightbulb size={24} color="#71717a" />
              </View>
              <Text className="text-base font-semibold text-dark-200">No projects yet</Text>
              <Text className="text-xs text-dark-400 text-center mt-1 px-4">
                Tap the button above to create your first Australian standard lighting specification.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {projectsList.map((project) => (
                <Pressable
                  key={project.id}
                  onPress={() => {
                    setCurrentProject(project);
                    router.push(`/project/${project.id}`);
                  }}
                  className="p-4 rounded-xl bg-dark-800/90 border border-dark-700/80 active:border-primary-500/50 flex-row items-center justify-between"
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-base font-bold text-white">{project.projectName}</Text>
                    <Text className="text-xs text-dark-300 mt-1">
                      {project.clientName ? `${project.clientName} · ` : ''}
                      {project.rooms.length} {project.rooms.length === 1 ? 'room' : 'rooms'} · {project.totalFixturesCount} fixtures
                    </Text>
                    <View className="flex-row items-center gap-3 mt-2">
                      <View className="flex-row items-center gap-1">
                        <CheckCircle2 size={12} color="#c29223" />
                        <Text className="text-xs font-semibold text-primary-400">
                          {project.totalPowerWatts}W Load
                        </Text>
                      </View>
                      <Text className="text-xs font-bold text-dark-200">
                        ${project.totalEstimatedCost.toFixed(2)} AUD
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#71717a" />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal: New Project Setup */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-dark-800 rounded-t-3xl p-6 border-t border-dark-700">
            <Text className="text-xl font-bold text-white mb-1">Create Lighting Project</Text>
            <Text className="text-xs text-dark-300 mb-5">
              Set the project identifier for your formal quotation and reports.
            </Text>

            <Text className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
              Project Name *
            </Text>
            <TextInput
              value={projectName}
              onChangeText={setProjectName}
              placeholder="e.g. Bondi Beach Residence / Level 3 Office"
              placeholderTextColor="#71717a"
              className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-3.5 text-white text-base mb-4"
              autoFocus
            />

            <Text className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
              Client / Reference Name (Optional)
            </Text>
            <TextInput
              value={clientName}
              onChangeText={setClientName}
              placeholder="e.g. Smith Architectural Group"
              placeholderTextColor="#71717a"
              className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-3.5 text-white text-base mb-4"
            />

            <Text className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
              Site Address (Optional)
            </Text>
            <TextInput
              value={projectAddress}
              onChangeText={setProjectAddress}
              placeholder="e.g. 142 Campbell Parade, Sydney NSW"
              placeholderTextColor="#71717a"
              className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-3.5 text-white text-base mb-6"
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setIsModalOpen(false)}
                className="flex-1 py-3.5 rounded-xl bg-dark-700 items-center justify-center"
              >
                <Text className="text-dark-200 font-semibold text-base">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleCreateProject}
                disabled={!projectName.trim()}
                className={`flex-1 py-3.5 rounded-xl items-center justify-center ${
                  projectName.trim() ? 'bg-primary-500 active:bg-primary-600' : 'bg-dark-700 opacity-50'
                }`}
              >
                <Text className="text-dark-900 font-bold text-base">Start Project</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
