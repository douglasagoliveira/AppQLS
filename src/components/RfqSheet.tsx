import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import {
  CheckCircle2,
  Clock,
  Mail,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  User,
  X,
} from 'lucide-react-native';
import { GlowCard, LuxuryButton, T } from './ui';
import { haptic } from '../lib/haptics';
import {
  BUYER_TYPES,
  BuyerType,
  ContactChannel,
  contactFromProfile,
  nextRfqCode,
  RfqContact,
  RFQ_DISCLAIMER,
  validateContact,
} from '../lib/rfq';
import { collectKitGaps } from '../lib/projectMath';
import { submitRfqToSupabase } from '../services/supabaseService';
import { useProjectStore } from '../store/useProjectStore';
import { Project } from '../types';

interface RfqSheetProps {
  visible: boolean;
  onClose: () => void;
  project: Project;
}

export function RfqSheet({ visible, onClose, project }: RfqSheetProps) {
  const { userProfile, setUserProfile, recordRfq, setProjectStatusById } = useProjectStore();

  const [contact, setContact] = useState<RfqContact>(() => contactFromProfile(userProfile));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resultSuccess, setResultSuccess] = useState<{ code: string; status: 'sent' | 'queued' } | null>(null);

  // Check kit gaps before submitting
  const kitGaps = collectKitGaps(project);

  const handleSubmit = async () => {
    const errs = validateContact(contact);
    if (Object.keys(errs).length > 0) {
      haptic.warning();
      setErrors(errs);
      return;
    }
    setErrors({});

    setSubmitting(true);
    haptic.tick();

    try {
      const res = await submitRfqToSupabase(project, userProfile, contact);

      const deliveryStatus: 'sent' | 'queued' = res.status === 'sent' ? 'sent' : 'queued';

      // Persist user profile for future submissions
      setUserProfile({
        id: userProfile?.id || `user-${Date.now()}`,
        fullName: contact.fullName,
        email: contact.email,
        phone: contact.phone,
        companyName: contact.companyName,
        userType: contact.buyerType,
      });

      const nextCode = res.rfqCode || nextRfqCode(project);

      // Record in local store history
      recordRfq({
        code: nextCode,
        projectId: project.id,
        projectName: project.projectName,
        submittedAt: new Date().toISOString(),
        status: deliveryStatus,
        contact,
        itemsCount: project.rooms.filter((r) => !!r.selectedItem).length + (project.additionalItems?.length ?? 0),
        estimatedTotal: project.totalEstimatedCost,
      });

      setProjectStatusById(
        project.id,
        deliveryStatus === 'sent' ? 'submitted' : 'pending_send',
        nextCode
      );

      haptic.success();
      setResultSuccess({ code: nextCode, status: deliveryStatus });
    } catch (err: any) {
      haptic.warning();
      Alert.alert('Error sending quote', err?.message || 'Please try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAndReset = () => {
    setResultSuccess(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <View className="bg-[#141414] rounded-t-[28px] border-t border-white/10 max-h-[90%] p-6">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-white/[0.08]">
            <View>
              <T variant="eyebrow" className="text-[#d9b277]">
                QUOTE REQUEST
              </T>
              <T variant="h2" className="text-white mt-0.5">
                {project.projectName}
              </T>
            </View>
            <Pressable
              onPress={handleCloseAndReset}
              className="w-9 h-9 rounded-full bg-white/[0.06] items-center justify-center active:bg-white/[0.12]"
            >
              <X size={18} color="#a1a1aa" />
            </Pressable>
          </View>

          {/* Success Screen */}
          {resultSuccess ? (
            <View className="py-8 items-center">
              <View className="w-16 h-16 rounded-full bg-[#d9b277]/20 items-center justify-center mb-4">
                <CheckCircle2 size={36} color="#d9b277" />
              </View>

              <T variant="h2" className="text-white text-center">
                {resultSuccess.status === 'sent' ? 'RFQ Sent Successfully!' : 'Saved to Local Queue'}
              </T>

              <View className="mt-3 px-4 py-2 rounded-full bg-white/[0.08] border border-[#d9b277]/30">
                <T variant="caption" className="text-[#d9b277] font-bold tracking-wider">
                  REFERENCE: {resultSuccess.code}
                </T>
              </View>

              <T variant="bodyMd" className="text-zinc-300 text-center mt-4 px-4">
                {resultSuccess.status === 'sent'
                  ? 'Our technical team at QLS Lighting has received your preliminary briefing and will issue a formal commercial proposal with lead times and final pricing.'
                  : 'Your request has been saved on this device and will be automatically synchronised with QLS once the connection is restored.'}
              </T>

              <View className="w-full mt-8">
                <LuxuryButton title="Done" onPress={handleCloseAndReset} />
              </View>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
              {/* Kit Gaps Warning */}
              {kitGaps.length > 0 && (
                <View className="mt-4 p-3.5 rounded-[14px] bg-amber-950/40 border border-amber-500/30">
                  <T variant="caption" className="text-amber-300 font-semibold mb-1">
                    Please review the kit components:
                  </T>
                  {kitGaps.map((g, i) => (
                    <T key={i} variant="caption" className="text-amber-200 text-xs">
                      • {g.space}: missing {g.missing.join(', ')}
                    </T>
                  ))}
                  <T variant="caption" className="text-amber-400/80 text-[11px] mt-1">
                    QLS engineering will include compatible profiles/drivers in the formal proposal.
                  </T>
                </View>
              )}

              {/* Form Fields */}
              <View className="gap-3.5 mt-4">
                {/* Full Name */}
                <View>
                  <T variant="caption" className="text-zinc-400 mb-1 font-medium">
                    FULL NAME *
                  </T>
                  <TextInput
                    value={contact.fullName}
                    onChangeText={(t) => setContact({ ...contact, fullName: t })}
                    placeholder="Your name"
                    placeholderTextColor="#71717a"
                    className="bg-[#181818] border border-white/10 rounded-[14px] px-4 py-3 text-white text-sm"
                  />
                  {errors.fullName && (
                    <T variant="caption" className="text-red-400 mt-1">
                      {errors.fullName}
                    </T>
                  )}
                </View>

                {/* Email */}
                <View>
                  <T variant="caption" className="text-zinc-400 mb-1 font-medium">
                    E-MAIL *
                  </T>
                  <TextInput
                    value={contact.email}
                    onChangeText={(t) => setContact({ ...contact, email: t })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="your.email@example.com"
                    placeholderTextColor="#71717a"
                    className="bg-[#181818] border border-white/10 rounded-[14px] px-4 py-3 text-white text-sm"
                  />
                  {errors.email && (
                    <T variant="caption" className="text-red-400 mt-1">
                      {errors.email}
                    </T>
                  )}
                </View>

                {/* Phone / WhatsApp */}
                <View>
                  <T variant="caption" className="text-zinc-400 mb-1 font-medium">
                    TELEFONE / WHATSAPP *
                  </T>
                  <TextInput
                    value={contact.phone}
                    onChangeText={(t) => setContact({ ...contact, phone: t })}
                    keyboardType="phone-pad"
                    placeholder="+61 400 000 000"
                    placeholderTextColor="#71717a"
                    className="bg-[#181818] border border-white/10 rounded-[14px] px-4 py-3 text-white text-sm"
                  />
                  {errors.phone && (
                    <T variant="caption" className="text-red-400 mt-1">
                      {errors.phone}
                    </T>
                  )}
                </View>

                {/* Company */}
                <View>
                  <T variant="caption" className="text-zinc-400 mb-1 font-medium">
                    COMPANY / FIRM (OPTIONAL)
                  </T>
                  <TextInput
                    value={contact.companyName}
                    onChangeText={(t) => setContact({ ...contact, companyName: t })}
                    placeholder="Architecture Studio"
                    placeholderTextColor="#71717a"
                    className="bg-[#181818] border border-white/10 rounded-[14px] px-4 py-3 text-white text-sm"
                  />
                </View>

                {/* Buyer Type */}
                <View>
                  <T variant="caption" className="text-zinc-400 mb-1.5 font-medium">
                    YOUR PROFILE
                  </T>
                  <View className="flex-row flex-wrap gap-2">
                    {BUYER_TYPES.map((b) => {
                      const active = contact.buyerType === b.id;
                      return (
                        <Pressable
                          key={b.id}
                          onPress={() => {
                            haptic.tick();
                            setContact({ ...contact, buyerType: b.id });
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

                {/* Preferred Channel */}
                <View>
                  <T variant="caption" className="text-zinc-400 mb-1.5 font-medium">
                    PREFERRED RESPONSE CHANNEL
                  </T>
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => {
                        haptic.tick();
                        setContact({ ...contact, channel: 'email' });
                      }}
                      className={`flex-1 p-3 rounded-[14px] border flex-row items-center justify-center gap-2 ${
                        contact.channel === 'email'
                          ? 'bg-[#181818] border-[#d9b277]'
                          : 'bg-[#141414] border-white/10'
                      }`}
                    >
                      <Mail size={16} color={contact.channel === 'email' ? '#d9b277' : '#a1a1aa'} />
                      <T
                        variant="caption"
                        className={contact.channel === 'email' ? 'text-white font-bold' : 'text-zinc-400'}
                      >
                        E-mail
                      </T>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        haptic.tick();
                        setContact({ ...contact, channel: 'whatsapp' });
                      }}
                      className={`flex-1 p-3 rounded-[14px] border flex-row items-center justify-center gap-2 ${
                        contact.channel === 'whatsapp'
                          ? 'bg-[#181818] border-[#d9b277]'
                          : 'bg-[#141414] border-white/10'
                      }`}
                    >
                      <MessageCircle size={16} color={contact.channel === 'whatsapp' ? '#d9b277' : '#a1a1aa'} />
                      <T
                        variant="caption"
                        className={contact.channel === 'whatsapp' ? 'text-white font-bold' : 'text-zinc-400'}
                      >
                        WhatsApp
                      </T>
                    </Pressable>
                  </View>
                </View>

                {/* Notes */}
                <View>
                  <T variant="caption" className="text-zinc-400 mb-1 font-medium">
                    PROJECT NOTES (OPTIONAL)
                  </T>
                  <TextInput
                    value={contact.notes}
                    onChangeText={(t) => setContact({ ...contact, notes: t })}
                    placeholder="Construction timeline, delivery address or technical questions..."
                    placeholderTextColor="#71717a"
                    multiline
                    numberOfLines={3}
                    className="bg-[#181818] border border-white/10 rounded-[14px] px-4 py-3 text-white text-sm"
                  />
                </View>

                {/* Disclaimer */}
                <View className="bg-white/[0.04] p-3.5 rounded-[14px] mt-2 border border-white/5">
                  <T variant="caption" className="text-zinc-400 text-[11px] leading-relaxed">
                    <strong>Important notice:</strong> {RFQ_DISCLAIMER}
                  </T>
                </View>

                {/* Submit Button */}
                <View className="mt-4">
                  {submitting ? (
                    <View className="py-4 items-center">
                      <ActivityIndicator size="small" color="#d9b277" />
                    </View>
                  ) : (
                    <LuxuryButton
                      title="Send Quote Request to QLS"
                      icon={<Send size={18} color="#0e0e0e" />}
                      onPress={handleSubmit}
                    />
                  )}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
