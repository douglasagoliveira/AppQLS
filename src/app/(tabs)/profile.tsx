import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Layers,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  Trash2,
  User,
} from 'lucide-react-native';
import { GlowCard, LuxuryButton, StandardsBadge, T } from '../../components/ui';
import { haptic } from '../../lib/haptics';
import { BUYER_TYPES, BuyerType } from '../../lib/rfq';
import { flushRfqOutbox, getOutboxCount } from '../../services/supabaseService';
import { useProjectStore } from '../../store/useProjectStore';

const RFQ_STAGES = [
  { step: 1, title: 'Received by QLS', desc: 'Preliminary dossier received by the technical team' },
  { step: 2, title: 'Engineering Validation', desc: 'Verification of photometry, drivers and LEDYi compatibility' },
  { step: 3, title: 'Formal Commercial Proposal', desc: 'Official issue of final prices, lead times and taxes' },
  { step: 4, title: 'Order & Invoicing', desc: 'Client approval and release for dispatch' },
];

export default function ProfileTabScreen() {
  const router = useRouter();
  const {
    userProfile,
    setUserProfile,
    projectsList,
    currentProject,
    setCurrentProject,
    duplicateProject,
    removeProject,
    rfqHistory,
    markRfqSent,
    setProjectStatusById,
  } = useProjectStore();

  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [companyName, setCompanyName] = useState(userProfile?.companyName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [buyerType, setBuyerType] = useState<BuyerType>(
    (userProfile?.userType as BuyerType) || 'architect'
  );
  const [isSaved, setIsSaved] = useState(false);

  const [outboxCount, setOutboxCount] = useState(0);
  const [isFlushing, setIsFlushing] = useState(false);

  useEffect(() => {
    getOutboxCount().then(setOutboxCount).catch(() => {});
  }, []);

  const handleSaveProfile = () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Required Fields', 'Please fill in at least your full name and email.');
      return;
    }

    haptic.success();
    setUserProfile({
      id: userProfile?.id || `user-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      companyName: companyName.trim(),
      phone: phone.trim(),
      userType: buyerType,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleFlushOutbox = async () => {
    setIsFlushing(true);
    haptic.tick();
    try {
      const sentCodes = await flushRfqOutbox();
      if (sentCodes.length > 0) {
        sentCodes.forEach((code: string) => {
          markRfqSent(code);
        });
        haptic.success();
        Alert.alert('Sync Complete', `${sentCodes.length} RFQ(s) sent to QLS successfully!`);
      } else {
        Alert.alert('Send Queue', 'No pending RFQs to send at the moment.');
      }
      const count = await getOutboxCount();
      setOutboxCount(count);
    } catch {
      Alert.alert('Error', 'Failed to sync the send queue.');
    } finally {
      setIsFlushing(false);
    }
  };

  const handleOpenSupport = (type: 'whatsapp' | 'email' | 'catalog') => {
    haptic.light();
    if (type === 'whatsapp') {
      Linking.openURL('https://wa.me/61412345678?text=Hello%20QLS%20Lighting%20I%27d%20like%20to%20quote%20LEDYi%20products');
    } else if (type === 'email') {
      Linking.openURL('mailto:trade@qlslighting.com.au?subject=QLS%20LEDYi%20Technical%20Enquiry');
    } else {
      Linking.openURL('https://www.ledyilighting.com/');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0e0e0e]">
      {/* Top Header */}
      <View className="px-5 py-3 border-b border-white/[0.08] flex-row items-center justify-between bg-[#0e0e0e]">
        <T variant="h3" className="text-white">
          My Account & Projects
        </T>
        <StandardsBadge label="QLS Trade" highlight />
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Outbox Pending Banner */}
        {outboxCount > 0 && (
          <View className="mb-5 p-4 rounded-[16px] bg-amber-950/40 border border-amber-500/30 flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <T variant="caption" className="text-amber-300 font-bold">
                {outboxCount} RFQ(S) AWAITING SEND
              </T>
              <T variant="caption" className="text-amber-200 text-xs mt-0.5">
                Saved offline. Tap to resend to QLS now.
              </T>
            </View>
            <Pressable
              onPress={handleFlushOutbox}
              disabled={isFlushing}
              className="py-2 px-3 rounded-[10px] bg-amber-500 items-center justify-center flex-row gap-1"
            >
              <RefreshCw size={14} color="#000" className={isFlushing ? 'animate-spin' : ''} />
              <T variant="caption" className="text-black font-bold">
                Resend
              </T>
            </Pressable>
          </View>
        )}

        {/* User Card */}
        <View className="items-center pb-5 border-b border-white/10 mb-5">
          <View className="w-16 h-16 rounded-full bg-[#181818] border border-[#d9b277]/40 items-center justify-center mb-2">
            <User size={28} color="#d9b277" />
          </View>
          <T variant="h2" className="text-white text-center text-lg">
            {fullName || 'Professional / Specifier'}
          </T>
          <T variant="caption" className="text-[#d9b277] mt-0.5">
            {companyName || 'QLS Trade Account · LEDYi Authorised Dealer'}
          </T>
        </View>

        {/* RFQ History & Timeline */}
        <View className="mb-6">
          <T variant="eyebrow" className="text-[#d9b277] mb-2.5">
            QUOTE HISTORY (RFQ)
          </T>

          {rfqHistory.length === 0 ? (
            <GlowCard className="p-4 items-center">
              <T variant="caption" className="text-zinc-400 text-center">
                No quote requests submitted yet. Create a project and request a direct quote from QLS.
              </T>
            </GlowCard>
          ) : (
            <View className="gap-3">
              {rfqHistory.map((rfq) => (
                <GlowCard key={rfq.code} className="p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                      <View
                        className={`w-2.5 h-2.5 rounded-full ${
                          rfq.status === 'sent' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <T variant="caption" className="text-[#d9b277] font-bold">
                        {rfq.code}
                      </T>
                    </View>
                    <T variant="caption" className="text-zinc-500 text-[11px]">
                      {new Date(rfq.submittedAt).toLocaleDateString('en-AU')}
                    </T>
                  </View>

                  <T variant="bodyMd" className="text-white font-semibold">
                    {rfq.projectName}
                  </T>
                  <T variant="caption" className="text-zinc-400 text-xs mt-0.5">
                    {rfq.itemsCount ?? 0} items quoted · Est. preliminary: ${(rfq.estimatedTotal ?? 0).toFixed(2)} AUD
                  </T>

                  {/* 4-Stage Stepper Preview */}
                  <View className="mt-3 pt-3 border-t border-white/[0.06] gap-2">
                    {RFQ_STAGES.map((st) => {
                      const isDone = st.step === 1;
                      const isCurrent = st.step === 2;
                      return (
                        <View key={st.step} className="flex-row items-center gap-2">
                          <View
                            className={`w-5 h-5 rounded-full items-center justify-center border ${
                              isDone
                                ? 'bg-[#d9b277] border-[#d9b277]'
                                : isCurrent
                                ? 'bg-[#d9b277]/20 border-[#d9b277]'
                                : 'bg-[#222222] border-white/10'
                            }`}
                          >
                            {isDone ? (
                              <Check size={12} color="#000" strokeWidth={3} />
                            ) : (
                              <T variant="caption" className={`text-[10px] ${isCurrent ? 'text-[#d9b277] font-bold' : 'text-zinc-500'}`}>
                                {st.step}
                              </T>
                            )}
                          </View>
                          <T variant="caption" className={isDone || isCurrent ? 'text-zinc-200 font-medium' : 'text-zinc-500'}>
                            {st.title}
                          </T>
                        </View>
                      );
                    })}
                  </View>
                </GlowCard>
              ))}
            </View>
          )}
        </View>

        {/* Project Management (List, Duplicate, Remove) */}
        <View className="mb-6">
          <T variant="eyebrow" className="text-[#d9b277] mb-2.5">
            MANAGE PROJECTS ({projectsList.length})
          </T>

          <View className="gap-2.5">
            {projectsList.map((proj) => {
              const isActive = currentProject?.id === proj.id;
              return (
                <View
                  key={proj.id}
                  className={`p-3.5 rounded-[16px] border ${
                    isActive ? 'bg-[#181818] border-[#d9b277]' : 'bg-[#141414] border-white/10'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <Pressable
                      onPress={() => {
                        haptic.tick();
                        setCurrentProject(proj);
                        router.push(`/project/${proj.id}`);
                      }}
                      className="flex-1 pr-2"
                    >
                      <T variant="bodyMd" className={isActive ? 'text-white font-bold' : 'text-zinc-300'}>
                        {proj.projectName}
                      </T>
                      <T variant="caption" className="text-zinc-400 text-xs mt-0.5">
                        {proj.rooms.length} spaces · ${proj.totalEstimatedCost.toFixed(0)} AUD
                      </T>
                    </Pressable>

                    <View className="flex-row items-center gap-1.5">
                      <Pressable
                        onPress={() => {
                          haptic.light();
                          const dup = duplicateProject(proj.id);
                          if (dup) {
                            haptic.success();
                            Alert.alert('Project Duplicated', `Copy "${dup.projectName}" created.`);
                          }
                        }}
                        className="p-2 rounded-full bg-white/5 active:bg-white/10"
                        accessibilityLabel="Duplicate project"
                      >
                        <Copy size={14} color="#d9b277" />
                      </Pressable>

                      {projectsList.length > 1 && (
                        <Pressable
                          onPress={() => {
                            haptic.light();
                            Alert.alert('Remove Project', `Delete "${proj.projectName}"?`, [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: () => {
                                  haptic.tick();
                                  removeProject(proj.id);
                                },
                              },
                            ]);
                          }}
                          className="p-2 rounded-full bg-white/5 active:bg-white/10"
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Support & Direct Channels */}
        <View className="mb-6">
          <T variant="eyebrow" className="text-[#d9b277] mb-2.5">
            DIRECT CHANNELS TO QLS
          </T>
          <View className="flex-row gap-2.5">
            <Pressable
              onPress={() => handleOpenSupport('whatsapp')}
              className="flex-1 p-3.5 rounded-[16px] bg-[#181818] border border-white/10 items-center active:border-[#d9b277]"
            >
              <MessageSquare size={20} color="#34d399" />
              <T variant="caption" className="text-white font-semibold mt-1.5">
                WhatsApp QLS
              </T>
              <T variant="caption" className="text-zinc-500 text-[10px]">
                Applications Engineering
              </T>
            </Pressable>

            <Pressable
              onPress={() => handleOpenSupport('email')}
              className="flex-1 p-3.5 rounded-[16px] bg-[#181818] border border-white/10 items-center active:border-[#d9b277]"
            >
              <Mail size={20} color="#d9b277" />
              <T variant="caption" className="text-white font-semibold mt-1.5">
                Sales Enquiries
              </T>
              <T variant="caption" className="text-zinc-500 text-[10px]">
                trade@qlslighting.com.au
              </T>
            </Pressable>

            <Pressable
              onPress={() => handleOpenSupport('catalog')}
              className="flex-1 p-3.5 rounded-[16px] bg-[#181818] border border-white/10 items-center active:border-[#d9b277]"
            >
              <ExternalLink size={20} color="#60a5fa" />
              <T variant="caption" className="text-white font-semibold mt-1.5">
                LEDYi Global
              </T>
              <T variant="caption" className="text-zinc-500 text-[10px]">
                ledyilighting.com
              </T>
            </Pressable>
          </View>
        </View>

        {/* Account Details Form */}
        <View className="mb-6">
          <T variant="eyebrow" className="text-[#d9b277] mb-2.5">
            QUOTATION DETAILS
          </T>

          <View className="gap-3">
            <View>
              <T variant="caption" className="text-zinc-400 mb-1 font-medium">
                FULL NAME *
              </T>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your full name"
                placeholderTextColor="#71717a"
                className="bg-[#181818] border border-white/10 rounded-[14px] px-4 py-3 text-white text-sm"
              />
            </View>

            <View>
              <T variant="caption" className="text-zinc-400 mb-1 font-medium">
                E-MAIL *
              </T>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="your.email@company.com"
                placeholderTextColor="#71717a"
                className="bg-[#181818] border border-white/10 rounded-[14px] px-4 py-3 text-white text-sm"
              />
            </View>

            <View>
              <T variant="caption" className="text-zinc-400 mb-1 font-medium">
                COMPANY / FIRM
              </T>
              <TextInput
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="Architecture Studio"
                placeholderTextColor="#71717a"
                className="bg-[#181818] border border-white/10 rounded-[14px] px-4 py-3 text-white text-sm"
              />
            </View>

            <View>
              <T variant="caption" className="text-zinc-400 mb-1 font-medium">
                TELEFONE / WHATSAPP
              </T>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+61 400 000 000"
                placeholderTextColor="#71717a"
                className="bg-[#181818] border border-white/10 rounded-[14px] px-4 py-3 text-white text-sm"
              />
            </View>

            <View>
              <T variant="caption" className="text-zinc-400 mb-1.5 font-medium">
                PROFESSIONAL PROFILE
              </T>
              <View className="flex-row flex-wrap gap-2">
                {BUYER_TYPES.map((b) => {
                  const active = buyerType === b.id;
                  return (
                    <Pressable
                      key={b.id}
                      onPress={() => {
                        haptic.tick();
                        setBuyerType(b.id);
                      }}
                      className={`px-3 py-2 rounded-[12px] border ${
                        active ? 'bg-[#d9b277] border-[#d9b277]' : 'bg-[#181818] border-white/10'
                      }`}
                    >
                      <T
                        variant="caption"
                        className={active ? 'text-black font-bold' : 'text-zinc-300'}
                      >
                        {b.label}
                      </T>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="mt-2">
              <LuxuryButton
                title={isSaved ? 'Details Saved!' : 'Save Changes'}
                icon={isSaved ? <Check size={18} color="#000" /> : undefined}
                onPress={handleSaveProfile}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
