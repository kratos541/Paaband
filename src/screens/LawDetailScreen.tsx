import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Clipboard, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ALL_LAWS } from '../data/laws';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'LawDetail'>;

const CAT_COLORS: Record<string, string> = {
  Tax: '#f59e0b', Labour: '#3b82f6', Operations: '#10b981', Licensing: '#8b5cf6',
  'Food Safety': '#f97316', Medical: '#ec4899', Environmental: '#06b6d4',
};

const TABS = ['About', 'Why Me', 'Steps', 'Letter'] as const;
type TabType = typeof TABS[number];

export default function LawDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const [tab, setTab] = useState<TabType>('About');
  const [copied, setCopied] = useState(false);
  const [stepsCompleted, setStepsCompleted] = useState<number[]>([]);

  const law = ALL_LAWS.find(l => l.id === route.params.lawId);
  if (!law) {
    return (
      <View style={[s.container, { backgroundColor: colors.bg }]}>
        <Text style={[{ padding: 40 }, { color: colors.text }]}>Law not found.</Text>
      </View>
    );
  }

  const catColor = CAT_COLORS[law.cat] ?? colors.gold;

  const biz = profile ? {
    name: profile.name, ownerName: profile.ownerName,
    designation: profile.designation, phone: profile.phone,
    city: profile.city, province: profile.province,
    ntn: profile.ntn, address: profile.address, typeLabel: profile.typeLabel,
  } : {};

  const letterText = law.letter ? law.letter(biz) : null;

  const copyLetter = () => {
    if (!letterText) return;
    Clipboard.setString(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleStep = (i: number) => {
    setStepsCompleted(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const stepsProgress = law.steps.length > 0 ? stepsCompleted.length / law.steps.length : 0;

  const markComplied = async () => {
    try {
      const stored = await AsyncStorage.getItem('@checklist');
      const checked: string[] = stored ? JSON.parse(stored) : [];
      if (!checked.includes(law.id)) {
        await AsyncStorage.setItem('@checklist', JSON.stringify([...checked, law.id]));
        Alert.alert('Marked as complied!', 'This law is now checked in your compliance list.');
      } else {
        Alert.alert('Already marked', 'This law is already in your compliance checklist.');
      }
    } catch {}
  };

  const whyReasons: string[] = [];
  if (profile) {
    if (law.types.includes(profile.type)) whyReasons.push(`You operate a ${profile.typeLabel} business`);
    if (law.provinces.includes(profile.province)) whyReasons.push(`Your business is in ${profile.province}`);
    if (law.provinces.includes('All')) whyReasons.push('This applies to all provinces in Pakistan');
    if (law.minRevM > 0 && profile.revM >= law.minRevM) whyReasons.push(`Your revenue (${profile.revLabel}) exceeds the PKR ${law.minRevM}M threshold`);
    if (law.minEmp > 1 && profile.emp >= law.minEmp) whyReasons.push(`You have ${profile.empLabel} employees (minimum ${law.minEmp})`);
  }

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <StatusBar backgroundColor={colors.bg2} barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[s.header, { backgroundColor: colors.bg2, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={[s.backText, { color: colors.gold }]}>‹ Back</Text>
        </TouchableOpacity>
        <View style={s.headerMeta}>
          <View style={[s.catBadge, { backgroundColor: catColor + '22' }]}>
            <Text style={[s.catText, { color: catColor }]}>{law.cat}</Text>
          </View>
          {law.urgent && (
            <View style={[s.urgentBadge, { backgroundColor: colors.redFaint }]}>
              <Text style={[s.urgentText, { color: colors.red }]}>URGENT</Text>
            </View>
          )}
        </View>
        <Text style={[s.headerTitle, { color: colors.text }]}>{law.title}</Text>
        <Text style={[s.headerAuth, { color: colors.gold }]}>{law.authority}</Text>
        {law.badge && <Text style={[s.headerBadge, { color: colors.text3 }]}>{law.badge}</Text>}
      </View>

      {/* Tabs */}
      <View style={[s.tabs, { backgroundColor: colors.bg2, borderBottomColor: colors.border }]}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={[s.tab, tab === t && { borderBottomWidth: 2, borderBottomColor: colors.gold }]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, { color: tab === t ? colors.gold : colors.text3 }, tab === t && { fontWeight: '700' }]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {tab === 'About' && (
          <>
            <View style={s.section}>
              <Text style={[s.sectionTitle, { color: colors.text3 }]}>SUMMARY</Text>
              <Text style={[s.bodyText, { color: colors.text2 }]}>{law.summaryEn}</Text>
            </View>
            <View style={s.section}>
              <Text style={[s.bodyText, s.urduText, { color: colors.text3 }]}>{law.summaryUr}</Text>
            </View>
            <View style={[s.penaltyCard, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
              <View style={s.penaltyRow}>
                <Text style={[s.penaltyLabel, { color: colors.text3 }]}>BASE PENALTY</Text>
                <Text style={[s.penaltyValue, { color: colors.red }]}>
                  {law.penalty > 0 ? `PKR ${law.penalty.toLocaleString()}` : 'No fixed penalty'}
                </Text>
              </View>
              {law.penaltyPerDay > 0 && (
                <View style={[s.penaltyRow, { marginTop: 8 }]}>
                  <Text style={[s.penaltyLabel, { color: colors.text3 }]}>PER-DAY FINE</Text>
                  <Text style={[s.penaltyValue, { color: colors.red }]}>PKR {law.penaltyPerDay.toLocaleString()}/day</Text>
                </View>
              )}
              {law.deadline && (
                <View style={[s.penaltyRow, { marginTop: 8 }]}>
                  <Text style={[s.penaltyLabel, { color: colors.text3 }]}>DEADLINE</Text>
                  <Text style={[s.penaltyValue, { color: colors.warning }]}>{law.deadline}</Text>
                </View>
              )}
            </View>
            <View style={s.section}>
              <Text style={[s.sectionTitle, { color: colors.text3 }]}>AUTHORITY</Text>
              <Text style={[s.bodyText, { color: colors.gold }]}>{law.authority}</Text>
              {law.phone && <Text style={[s.bodyText, { color: colors.text2, marginTop: 4 }]}>{law.phone}</Text>}
              {law.url && <Text style={[s.bodyText, { color: colors.gold, marginTop: 4 }]}>{law.url}</Text>}
            </View>
            <TouchableOpacity
              style={[s.compliedBtn, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}
              onPress={markComplied}
            >
              <Text style={[s.compliedText, { color: colors.gold }]}>✓ Mark as Complied</Text>
            </TouchableOpacity>
          </>
        )}

        {tab === 'Why Me' && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.text3 }]}>WHY THIS APPLIES TO YOU</Text>
            {whyReasons.length > 0 ? (
              whyReasons.map((r, i) => (
                <View key={i} style={s.whyItem}>
                  <Text style={[s.whyBullet, { color: colors.gold }]}>›</Text>
                  <Text style={[s.whyText, { color: colors.text2 }]}>{r}</Text>
                </View>
              ))
            ) : (
              <Text style={[s.bodyText, { color: colors.text2 }]}>Complete your profile to see why this law applies to you.</Text>
            )}
            <View style={[s.penaltyCard, { backgroundColor: colors.bg3, borderColor: colors.border, marginTop: 20 }]}>
              <Text style={[s.penaltyLabel, { color: colors.text3 }]}>APPLIES TO</Text>
              <Text style={[s.bodyText, { color: colors.text2, marginTop: 6 }]}>{law.sub}</Text>
            </View>
          </View>
        )}

        {tab === 'Steps' && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.text3 }]}>HOW TO COMPLY</Text>
            {law.steps.length > 0 && (
              <>
                <View style={[s.progressTrack, { backgroundColor: colors.bg3 }]}>
                  <View style={[s.progressFill, { width: `${stepsProgress * 100}%` as any, backgroundColor: colors.gold }]} />
                </View>
                <Text style={[s.progressLabel, { color: colors.text3 }]}>{stepsCompleted.length}/{law.steps.length} steps done</Text>
              </>
            )}
            {law.steps.map((step, i) => {
              const done = stepsCompleted.includes(i);
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    s.stepItem,
                    { backgroundColor: colors.bg3, borderColor: colors.border },
                    done && { borderColor: 'rgba(5,150,105,0.25)' },
                  ]}
                  onPress={() => toggleStep(i)}
                >
                  <View style={[
                    s.stepCircle,
                    { borderColor: colors.border },
                    done && { backgroundColor: colors.green, borderColor: colors.green },
                  ]}>
                    {done
                      ? <Text style={s.stepCheck}>✓</Text>
                      : <Text style={[s.stepNum, { color: colors.text3 }]}>{i + 1}</Text>
                    }
                  </View>
                  <Text style={[
                    s.stepText,
                    { color: colors.text2 },
                    done && { color: colors.text3, textDecorationLine: 'line-through' },
                  ]}>
                    {step}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[s.compliedBtn, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}
              onPress={markComplied}
            >
              <Text style={[s.compliedText, { color: colors.gold }]}>✓ Mark as Complied</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'Letter' && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.text3 }]}>PRE-FILLED GOVERNMENT LETTER</Text>
            {letterText ? (
              <>
                <View style={[s.letterBox, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
                  <Text style={[s.letterText, { color: colors.text2 }]}>{letterText}</Text>
                </View>
                <TouchableOpacity
                  style={[s.copyBtn, { backgroundColor: copied ? colors.green : colors.gold }]}
                  onPress={copyLetter}
                >
                  <Text style={s.copyText}>{copied ? '✓ Copied to clipboard!' : '📋 Copy Letter'}</Text>
                </TouchableOpacity>
                {!profile && (
                  <View style={[s.profileHint, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}>
                    <Text style={[s.profileHintText, { color: colors.text3 }]}>
                      💡 Complete your profile to auto-fill your business details in this letter.
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={s.noLetter}>
                <Text style={s.noLetterIcon}>📄</Text>
                <Text style={[s.noLetterText, { color: colors.text3 }]}>No pre-filled letter available for this law.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 0.5 },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 13, fontWeight: '600' },
  headerMeta: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  catBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  catText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  urgentBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  urgentText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  headerTitle: { fontSize: 18, fontWeight: '700', lineHeight: 24, marginBottom: 4 },
  headerAuth: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  headerBadge: { fontSize: 11 },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '500' },
  scroll: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  bodyText: { fontSize: 14, lineHeight: 21 },
  urduText: { textAlign: 'right', fontSize: 14, lineHeight: 24 },
  penaltyCard: { borderRadius: 12, padding: 14, borderWidth: 0.5, marginBottom: 16 },
  penaltyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  penaltyLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  penaltyValue: { fontSize: 14, fontWeight: '700' },
  compliedBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 8 },
  compliedText: { fontWeight: '700', fontSize: 14 },
  whyItem: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  whyBullet: { fontWeight: '700', fontSize: 14, marginTop: 1 },
  whyText: { fontSize: 14, lineHeight: 20, flex: 1 },
  progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: 5, borderRadius: 3 },
  progressLabel: { fontSize: 11, marginBottom: 14 },
  stepItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 0.5,
  },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepCheck: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepNum: { fontSize: 12, fontWeight: '600' },
  stepText: { fontSize: 13, lineHeight: 19, flex: 1, paddingTop: 4 },
  letterBox: { borderRadius: 10, padding: 16, borderWidth: 0.5, marginBottom: 12 },
  letterText: { fontSize: 13, lineHeight: 20, fontFamily: 'monospace' },
  copyBtn: { borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginBottom: 12 },
  copyText: { color: '#000', fontWeight: '700', fontSize: 14 },
  profileHint: { borderRadius: 8, padding: 12, borderWidth: 0.5 },
  profileHintText: { fontSize: 12, lineHeight: 18 },
  noLetter: { alignItems: 'center', paddingTop: 40 },
  noLetterIcon: { fontSize: 40, marginBottom: 12 },
  noLetterText: { fontSize: 14, textAlign: 'center' },
});
