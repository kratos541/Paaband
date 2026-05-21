import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Linking, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { usePremium } from '../context/PremiumContext';

// ── Change this to your WhatsApp number ─────────────────────────────────────
const WHATSAPP_NUMBER = '923364553027';
// ────────────────────────────────────────────────────────────────────────────

const FREE_FEATURES = [
  '5 laws (preview only)',
  'Compliance calendar',
  'Fine calculator',
  'News feed',
];

const PRO_FEATURES = [
  'All 30+ laws for your business',
  'Personalised compliance checklist',
  'Pre-filled government letters',
  'Step-by-step compliance guide',
  'Penalty calculator for every law',
  'Priority compliance alerts',
  'Lifetime access — one-time payment',
];

const STEPS = [
  { icon: '💬', text: 'Tap "Contact on WhatsApp" below to message us' },
  { icon: '💳', text: 'We send you payment details (JazzCash / EasyPaisa / Bank)' },
  { icon: '✅', text: 'Make the payment and confirm with a screenshot on WhatsApp' },
  { icon: '🔑', text: 'We send you a unique unlock code within a few hours' },
  { icon: '🚀', text: 'Enter the code below and tap Activate — instantly unlocked!' },
];

export default function PaywallScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { redeemCode } = usePremium();
  const [code, setCode] = useState('');
  const [activating, setActivating] = useState(false);

  const openWhatsApp = () => {
    const msg = encodeURIComponent(
      'Hi! I want to purchase Paaband Premium for PKR 2,999. Please send me the payment details.'
    );
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`).catch(() => {
      Alert.alert('WhatsApp not found', 'Please message us at +' + WHATSAPP_NUMBER);
    });
  };

  const handleActivate = async () => {
    if (!code.trim()) {
      Alert.alert('Enter code', 'Please enter the unlock code you received.');
      return;
    }
    setActivating(true);
    const result = await redeemCode(code);
    setActivating(false);
    if (result === 'success') {
      Alert.alert(
        '🎉 Unlocked!',
        'Your premium access is now active. Enjoy all laws!',
        [{ text: 'Continue', onPress: () => navigation.goBack() }],
      );
    } else if (result === 'invalid') {
      Alert.alert('Invalid Code', 'This code is not valid or has already been used. Please check and try again, or contact us on WhatsApp.');
    } else {
      Alert.alert('Error', 'Something went wrong. Please check your connection and try again.');
    }
  };

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <StatusBar backgroundColor={colors.bg2} barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[s.header, { backgroundColor: colors.bg2, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={[s.backText, { color: colors.gold }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>Upgrade to Premium</Text>
        <Text style={[s.headerSub, { color: colors.text3 }]}>Unlock all compliance laws for your business</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Price card */}
        <View style={[s.priceCard, { backgroundColor: colors.gold }]}>
          <View style={s.discountBadge}>
            <Text style={s.discountBadgeText}>70% OFF — LIMITED OFFER</Text>
          </View>
          <Text style={s.priceLabel}>ONE-TIME PAYMENT</Text>
          <Text style={s.priceOld}>PKR 10,000</Text>
          <Text style={s.price}>PKR 2,999</Text>
          <Text style={s.priceSub}>Lifetime access · No subscription · No hidden fees</Text>
        </View>

        {/* Comparison */}
        <View style={[s.compCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          <View style={s.compCol}>
            <Text style={[s.compHeader, { color: colors.text3 }]}>FREE</Text>
            {FREE_FEATURES.map((f, i) => (
              <View key={i} style={s.compRow}>
                <Text style={[s.compIcon, { color: colors.text3 }]}>○</Text>
                <Text style={[s.compText, { color: colors.text3 }]}>{f}</Text>
              </View>
            ))}
          </View>

          <View style={[s.compDivider, { backgroundColor: colors.border }]} />

          <View style={s.compCol}>
            <View style={s.proHeaderRow}>
              <Text style={[s.compHeader, { color: colors.gold }]}>PRO</Text>
              <View style={[s.proBadge, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}>
                <Text style={[s.proBadgeText, { color: colors.gold }]}>RECOMMENDED</Text>
              </View>
            </View>
            {PRO_FEATURES.map((f, i) => (
              <View key={i} style={s.compRow}>
                <Text style={[s.compIcon, { color: colors.green }]}>✓</Text>
                <Text style={[s.compText, { color: colors.text }]}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How it works */}
        <View style={[s.stepsCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          <Text style={[s.stepsTitle, { color: colors.text }]}>📋 How to Get Access</Text>
          {STEPS.map((step, i) => (
            <View key={i} style={s.step}>
              <View style={[s.stepCircle, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}>
                <Text style={s.stepIcon}>{step.icon}</Text>
              </View>
              <Text style={[s.stepText, { color: colors.text2 }]}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* WhatsApp button */}
        <TouchableOpacity style={[s.whatsappBtn, { backgroundColor: '#25D366' }]} onPress={openWhatsApp}>
          <Text style={s.whatsappBtnText}>💬 Contact on WhatsApp</Text>
        </TouchableOpacity>

        {/* Code entry */}
        <View style={[s.codeCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          <Text style={[s.codeTitle, { color: colors.text }]}>🔑 Enter Your Unlock Code</Text>
          <Text style={[s.codeSub, { color: colors.text3 }]}>
            Enter the code we sent you after payment confirmation.
          </Text>
          <TextInput
            style={[s.codeInput, { backgroundColor: colors.bg3, borderColor: colors.borderGold, color: colors.text }]}
            value={code}
            onChangeText={v => setCode(v.toUpperCase())}
            placeholder="e.g. ABCD-1234"
            placeholderTextColor={colors.text3}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[s.activateBtn, { backgroundColor: colors.gold }, activating && { opacity: 0.7 }]}
            onPress={handleActivate}
            disabled={activating}
          >
            {activating
              ? <ActivityIndicator color="#000" />
              : <Text style={s.activateBtnText}>Activate Premium</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={[s.disclaimer, { color: colors.text3 }]}>
          Codes are sent within a few hours of payment confirmation during business hours.
          For support, contact us on WhatsApp.
        </Text>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 16, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 0.5 },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 13, fontWeight: '600' },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerSub: { fontSize: 13, marginTop: 4 },
  scroll: { padding: 16, paddingBottom: 40 },
  priceCard: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  discountBadge: {
    backgroundColor: '#000', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 12,
  },
  discountBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  priceLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(0,0,0,0.5)', letterSpacing: 1, marginBottom: 4 },
  priceOld: { fontSize: 20, fontWeight: '600', color: 'rgba(0,0,0,0.4)', textDecorationLine: 'line-through', marginBottom: 4 },
  price: { fontSize: 42, fontWeight: '700', color: '#000', letterSpacing: -1 },
  priceSub: { fontSize: 12, color: 'rgba(0,0,0,0.6)', marginTop: 8, textAlign: 'center' },
  compCard: {
    borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 0.5, flexDirection: 'row', gap: 12,
  },
  compCol: { flex: 1 },
  compHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  proHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  proBadge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 0.5 },
  proBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  compRow: { flexDirection: 'row', gap: 6, marginBottom: 8, alignItems: 'flex-start' },
  compIcon: { fontSize: 12, fontWeight: '700', marginTop: 2, width: 14 },
  compText: { fontSize: 12, lineHeight: 17, flex: 1 },
  compDivider: { width: 0.5 },
  stepsCard: { borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 0.5 },
  stepsTitle: { fontSize: 15, fontWeight: '700', marginBottom: 16 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  stepCircle: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepIcon: { fontSize: 16 },
  stepText: { fontSize: 13, lineHeight: 19, flex: 1, paddingTop: 8 },
  whatsappBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  whatsappBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  codeCard: { borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 0.5 },
  codeTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  codeSub: { fontSize: 12, lineHeight: 18, marginBottom: 14 },
  codeInput: {
    borderWidth: 1, borderRadius: 12, padding: 14,
    fontSize: 18, fontWeight: '700', letterSpacing: 3,
    textAlign: 'center', marginBottom: 12,
  },
  activateBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  activateBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },
  disclaimer: { fontSize: 11, textAlign: 'center', lineHeight: 17, paddingHorizontal: 8 },
});
