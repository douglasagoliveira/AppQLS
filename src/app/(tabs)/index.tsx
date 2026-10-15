import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  Plus,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { GlowCard, LuxuryButton, StandardsBadge, T } from '../../components/ui';
import { haptic } from '../../lib/haptics';
import { computeTotals, countListItems } from '../../lib/projectMath';
import { useProjectStore } from '../../store/useProjectStore';

export default function HomeScreen() {
  const router = useRouter();
  const { currentProject, projectsList, initNewProject, setCurrentProject } = useProjectStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');

  const handleCreateProject = () => {
    if (!projectName.trim()) return;
    haptic.success();
    const newProj = initNewProject(projectName.trim(), clientName.trim(), projectAddress.trim());
    setIsModalOpen(false);
    setProjectName('');
    setClientName('');
    setProjectAddress('');
    router.push(`/project/${newProj.id}`);
  };

  const activeTotals = currentProject
    ? computeTotals(currentProject.rooms, currentProject.additionalItems ?? [])
    : null;

  const currentItemCount = countListItems(currentProject);

  return (
    <SafeAreaView className="flex-1 bg-[#0e0e0e]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Header */}
        <View className="px-5 py-4 flex-row items-center justify-between border-b border-white/[0.08] bg-[#0e0e0e]">
          <View className="flex-row items-center gap-3">
            <Image
              source={require('../../../assets/brand/QLS-Logo-Horizontal-White.png')}
              style={{ width: 120, height: 34 }}
              resizeMode="contain"
            />
          </View>

          <Pressable
            onPress={() => {
              haptic.light();
              router.push('/(tabs)/profile');
            }}
            className="flex-row items-center gap-1.5 rounded-full border border-white/15 bg-[#181818] px-3 py-1.5 active:border-[#d9b277]"
          >
            <Building2 size={14} color="#d9b277" />
            <T variant="caption" className="text-white font-medium text-xs">
              My Account
            </T>
          </Pressable>
        </View>

        {/* Hero Section */}
        <View className="relative overflow-hidden border-b border-white/[0.08]">
          <ImageBackground
            source={require('../../../assets/img/living.jpg')}
            style={{ width: '100%', minHeight: 310, justifyContent: 'flex-end' }}
            resizeMode="cover"
          >
            {/* Dark overlay */}
            <View
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(14, 14, 14, 0.76)',
              }}
            />

            <View className="p-5 pt-8">
              <View className="flex-row items-center gap-2 mb-1">
                <T variant="eyebrow" className="text-[#d9b277]">
                  SYDNEY · LEDYI AUTHORISED DEALER
                </T>
              </View>

              <T variant="display" className="text-3xl text-white">
                We don't sell light.{'\n'}We sculpt it.
              </T>

              <T variant="lead" className="mt-2 text-zinc-300 text-xs leading-relaxed">
                Premium architectural lighting and professional LED strips calculated to Australian standards (AS/NZS 1680).
              </T>

              {/* Technical chips */}
              <View className="flex-row gap-2 mt-4 flex-wrap">
                <View className="bg-[#141414]/90 border border-white/15 rounded-[12px] px-3 py-1.5 flex-row items-baseline gap-1.5">
                  <T variant="caption" className="text-zinc-400 text-[10px]">CCT</T>
                  <T variant="caption" className="font-bold text-[#d9b277] text-xs">2700–6500K</T>
                </View>
                <View className="bg-[#141414]/90 border border-white/15 rounded-[12px] px-3 py-1.5 flex-row items-baseline gap-1.5">
                  <T variant="caption" className="text-zinc-400 text-[10px]">Colour Accuracy</T>
                  <T variant="caption" className="font-bold text-[#d9b277] text-xs">CRI 95+</T>
                </View>
                <View className="bg-[#141414]/90 border border-white/15 rounded-[12px] px-3 py-1.5 flex-row items-baseline gap-1.5">
                  <T variant="caption" className="text-zinc-400 text-[10px]">Control</T>
                  <T variant="caption" className="font-bold text-[#d9b277] text-xs">DALI-2 / Triac</T>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* SITUATION 2: RECURRING USER (Active Project) */}
        {currentProject && currentItemCount > 0 && activeTotals && (
          <View className="p-5 bg-[#181818]/60 border-b border-white/[0.08]">
            <View className="flex-row items-center justify-between mb-3">
              <T variant="eyebrow" className="text-[#d9b277]">
                CONTINUE WHERE YOU LEFT OFF
              </T>
              <View className="flex-row items-center gap-1.5">
                <View
                  className={`w-2 h-2 rounded-full ${
                    currentProject.status === 'submitted'
                      ? 'bg-emerald-400'
                      : currentProject.status === 'pending_send'
                      ? 'bg-amber-400'
                      : 'bg-[#d9b277]'
                  }`}
                />
                <T variant="caption" className="text-zinc-400 text-[10px] uppercase font-bold">
                  {currentProject.status === 'submitted'
                    ? 'RFQ Sent'
                    : currentProject.status === 'pending_send'
                    ? 'Awaiting Sync'
                    : 'Draft'}
                </T>
              </View>
            </View>

            <GlowCard active className="p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <T variant="h3" className="text-white text-base">
                    {currentProject.projectName}
                  </T>
                  {currentProject.clientName ? (
                    <T variant="caption" className="text-zinc-400 mt-0.5">
                      {currentProject.clientName}
                    </T>
                  ) : null}
                  <T variant="caption" className="text-zinc-500 text-[11px] mt-1">
                    {currentProject.rooms.length} spaces · {activeTotals.pieces} luminaires · {activeTotals.linearMetres}m strips
                  </T>
                </View>

                <View className="items-end">
                  <T variant="caption" className="text-zinc-400 text-[10px]">
                    PRELIMINARY ESTIMATE
                  </T>
                  <T variant="h3" className="text-[#d9b277] mt-0.5">
                    ${activeTotals.cost.toFixed(0)} AUD
                  </T>
                </View>
              </View>

              <View className="flex-row gap-2.5 mt-4 pt-3 border-t border-white/[0.08]">
                <Pressable
                  onPress={() => {
                    haptic.light();
                    router.push(`/project/${currentProject.id}`);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-[12px] bg-[#d9b277] items-center justify-center flex-row gap-1.5"
                >
                  <T variant="caption" className="text-black font-bold">
                    View Project & BOM
                  </T>
                  <ArrowRight size={14} color="#000" />
                </Pressable>

                <Pressable
                  onPress={() => {
                    haptic.light();
                    router.push(`/room/new?projectId=${currentProject.id}`);
                  }}
                  className="py-2.5 px-3 rounded-[12px] bg-white/[0.08] border border-white/10 items-center justify-center"
                >
                  <T variant="caption" className="text-white font-medium">
                    + Space
                  </T>
                </Pressable>
              </View>
            </GlowCard>
          </View>
        )}

        {/* SITUATION 1 & 3: QUICK ACTIONS (New Project / AI Consultant / Catalogue) */}
        <View className="p-5">
          <T variant="eyebrow" className="text-zinc-400 mb-3">
            WHAT WOULD YOU LIKE TO DO TODAY?
          </T>

          <View className="gap-3">
            {/* Quick Action 1: Iniciar Novo Projeto */}
            <Pressable
              onPress={() => {
                haptic.tick();
                setIsModalOpen(true);
              }}
            >
              <GlowCard className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-10 h-10 rounded-[12px] bg-[#d9b277]/20 items-center justify-center">
                    <Plus size={20} color="#d9b277" />
                  </View>
                  <View className="flex-1">
                    <T variant="bodyMd" className="text-white font-semibold">
                      Start New Project
                    </T>
                    <T variant="caption" className="text-zinc-400 mt-0.5">
                      Create a technical lighting dossier for residential or commercial projects.
                    </T>
                  </View>
                </View>
                <ChevronRight size={18} color="#71717a" />
              </GlowCard>
            </Pressable>

            {/* Quick Action 2: Guided AI Consultant */}
            <Pressable
              onPress={() => {
                haptic.tick();
                router.push('/(tabs)/consultant');
              }}
            >
              <GlowCard className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-10 h-10 rounded-[12px] bg-white/[0.08] items-center justify-center">
                    <Sparkles size={20} color="#d9b277" />
                  </View>
                  <View className="flex-1">
                    <T variant="bodyMd" className="text-white font-semibold">
                      AI Consultant (Quick Calc)
                    </T>
                    <T variant="caption" className="text-zinc-400 mt-0.5">
                      Simulate lux levels and ideal products for any space — no sign-up required.
                    </T>
                  </View>
                </View>
                <ChevronRight size={18} color="#71717a" />
              </GlowCard>
            </Pressable>

            {/* Quick Action 3: LEDYi Lighting Catalogue */}
            <Pressable
              onPress={() => {
                haptic.tick();
                router.push('/(tabs)/catalog');
              }}
            >
              <GlowCard className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-10 h-10 rounded-[12px] bg-white/[0.08] items-center justify-center">
                    <BookOpen size={20} color="#d9b277" />
                  </View>
                  <View className="flex-1">
                    <T variant="bodyMd" className="text-white font-semibold">
                      Browse LEDYi Catalogue
                    </T>
                    <T variant="caption" className="text-zinc-400 mt-0.5">
                      COB strips, Neon Flex, profiles and drivers with CCT simulator.
                    </T>
                  </View>
                </View>
                <ChevronRight size={18} color="#71717a" />
              </GlowCard>
            </Pressable>
          </View>
        </View>

        {/* How It Works (No checkout, direct quoting only) */}
        <View className="p-5 bg-[#181818]/40 border-t border-white/[0.08]">
          <T variant="eyebrow" className="text-[#d9b277]">
            SPECIFICATION PROCESS
          </T>
          <T variant="h2" className="mt-1 text-white text-lg">
            From simulation to formal proposal
          </T>
          <T variant="muted" className="mt-1 text-xs leading-relaxed">
            No generic shopping cart. QLS is LEDYi's official distributor, providing lighting engineering support with every quote.
          </T>

          <View className="mt-4 gap-2.5">
            {[
              {
                step: '1',
                title: 'Define the space and atmosphere',
                desc: 'Select the room or use guided mode to choose the lighting effect.',
              },
              {
                step: '2',
                title: 'Illuminance calculation & kit',
                desc: 'The photometric engine sizes the quantity, profiles and drivers with load margin.',
              },
              {
                step: '3',
                title: 'Direct quote in 1 click',
                desc: 'Send the technical dossier directly to the QLS commercial team for a formal proposal.',
              },
            ].map((item) => (
              <View
                key={item.step}
                className="flex-row items-start gap-3 bg-[#181818] p-3.5 rounded-[16px] border border-white/5"
              >
                <View className="w-7 h-7 rounded-full bg-[#d9b277]/20 border border-[#d9b277]/40 items-center justify-center">
                  <T variant="caption" className="font-bold text-[#d9b277] text-xs">
                    {item.step}
                  </T>
                </View>
                <View className="flex-1">
                  <T variant="bodyMd" className="font-semibold text-white text-xs">
                    {item.title}
                  </T>
                  <T variant="caption" className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                    {item.desc}
                  </T>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* New Project Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-[#141414] rounded-t-[28px] border-t border-white/10 p-6">
            <T variant="eyebrow" className="text-[#d9b277]">
              NEW PROJECT
            </T>
            <T variant="h2" className="text-white mt-1 mb-4">
              Project Details
            </T>

            <View className="gap-3.5 mb-6">
              <View>
                <T variant="caption" className="text-zinc-400 mb-1 font-medium">
                  PROJECT NAME *
                </T>
                <TextInput
                  value={projectName}
                  onChangeText={setProjectName}
                  placeholder="e.g. Vaucluse Residence · Living & Kitchen"
                  placeholderTextColor="#71717a"
                  className="bg-[#181818] border border-white/10 rounded-[14px] px-4 py-3 text-white text-sm"
                />
              </View>

              <View>
                <T variant="caption" className="text-zinc-400 mb-1 font-medium">
                  CLIENT / FIRM (OPTIONAL)
                </T>
                <TextInput
                  value={clientName}
                  onChangeText={setClientName}
                  placeholder="e.g. Marina Architecture Studio"
                  placeholderTextColor="#71717a"
                  className="bg-[#181818] border border-white/10 rounded-[14px] px-4 py-3 text-white text-sm"
                />
              </View>

              <View>
                <T variant="caption" className="text-zinc-400 mb-1 font-medium">
                  ADDRESS / CITY (OPTIONAL)
                </T>
                <TextInput
                  value={projectAddress}
                  onChangeText={setProjectAddress}
                  placeholder="Ex: Sydney, NSW"
                  placeholderTextColor="#71717a"
                  className="bg-[#181818] border border-white/10 rounded-[14px] px-4 py-3 text-white text-sm"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <LuxuryButton
                  title="Cancel"
                  variant="dark"
                  onPress={() => setIsModalOpen(false)}
                />
              </View>

              <View className="flex-1">
                <LuxuryButton
                  title="Create Dossier"
                  variant="primary"
                  disabled={!projectName.trim()}
                  onPress={handleCreateProject}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
