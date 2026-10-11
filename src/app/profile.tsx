import { useRouter } from 'expo-router';
import { Building, CheckCircle2, FileText, Lock, Mail, Phone, Shield, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { useProjectStore } from '../store/useProjectStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile, setUserProfile, projectsList } = useProjectStore();

  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [companyName, setCompanyName] = useState(userProfile?.companyName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Required Fields', 'Please provide at least your full name and email address.');
      return;
    }

    setUserProfile({
      id: userProfile?.id || `user-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      companyName: companyName.trim(),
      phone: phone.trim(),
      userType: 'architect',
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      router.back();
    }, 1200);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Profile Header */}
        <View className="items-center pb-6 border-b border-dark-800 mb-6">
          <View className="w-16 h-16 rounded-full bg-dark-800 border border-dark-700 items-center justify-center mb-3">
            <User size={28} color="#c29223" />
          </View>
          <Text className="text-xl font-bold text-white">
            {userProfile?.fullName || 'Specifier Account'}
          </Text>
          <Text className="text-xs text-dark-400 mt-0.5">
            {userProfile?.companyName || 'Australian Trade & Design Professional'}
          </Text>
        </View>

        {/* Form Fields */}
        <Text className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
          Full Name *
        </Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Liam Hemsworth"
          placeholderTextColor="#71717a"
          className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3.5 text-white text-base mb-4"
        />

        <Text className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
          Business / Personal Email *
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="e.g. liam@designstudio.com.au"
          placeholderTextColor="#71717a"
          className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3.5 text-white text-base mb-4"
        />

        <Text className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
          Company / Practice Name
        </Text>
        <TextInput
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="e.g. Apex Architecture Pty Ltd"
          placeholderTextColor="#71717a"
          className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3.5 text-white text-base mb-4"
        />

        <Text className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
          Phone / Mobile (AU)
        </Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="e.g. +61 412 345 678"
          placeholderTextColor="#71717a"
          className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3.5 text-white text-base mb-6"
        />

        {/* RFQ Benefits Notice */}
        <View className="bg-dark-800/80 border border-dark-700 rounded-xl p-4 mb-6 flex-row items-start gap-3">
          <Shield size={18} color="#c29223" className="mt-0.5" />
          <View className="flex-1">
            <Text className="text-xs font-bold text-white">Direct Factory RFQ Integration</Text>
            <Text className="text-xs text-dark-300 mt-1 leading-relaxed">
              Your details will be embedded into exported quotation PDFs and used to link trade discounts on submitted requests for quote.
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSaveProfile}
          className={`flex-row items-center justify-center gap-2 py-4 px-6 rounded-xl shadow-lg shadow-primary-500/20 mb-10 ${
            isSaved ? 'bg-emerald-500' : 'bg-primary-500 active:bg-primary-600'
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle2 size={18} color="#ffffff" />
              <Text className="text-white font-bold text-base">Account Details Saved!</Text>
            </>
          ) : (
            <Text className="text-dark-900 font-extrabold text-base">Save Account Details</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
