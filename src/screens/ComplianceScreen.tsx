import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { ALL_LAWS, matchLaw } from '../data/laws';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CAT_COLORS: Record<string, string> = {
  Tax: '#f59e0b', Labour: '#3b82f6', Operations: '#10b981', Licensing: '#8b5cf6',
  'Food Safety': '#f97316', Medical: '#ec4899',
};

export default function ComplianceScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useAuth();
  const [checked, setChecked] = useState<string[]>([]);

  const applicable = profile
    ? ALL_LAWS.filter(l => matchLaw(l, { type: profile.type, province: profile.province, revM: profile.revM, emp: profile.emp }))
    : ALL_LAWS;

  const doneCount = checked.filter(id => applicable.find(l => l.id === id)).length;
  const score = applicable.length > 0 ? Math.round((doneCount / applicable.length) * 100) : 0;
  const scoreColor = score >= 75 ? COLORS.green : score >= 40 ? COLORS.warning : COLORS.red;

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('@checklist').then(v => { if (v) setChecked(JSON.parse(v)); }).catch(() => {});
  }, []));

  const toggleItem = async (id: string) => {
    const next = checked.includes(id) ? checked.filter(c => c !== id) : [...checked, id];
    setChecked(next);
    await AsyncStorage.setItem('@checklist', JSON.stringify(next));
  };

  const byCategory = applicable.reduce<Record<string, typeof applicable>>((acc, l) => {
    const cat = l.cat;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(l);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.bg2} barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>✅ Compliance Checklist</Text>
          <Text style={styles.headerSub}>
            {profile ? `${profile.typeLabel} · ${profile.province}` : 'Complete your profile to get started'}
          </Text>
        </View>
      </View>

      {/* Score card */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreTop}>
          <View>
            <Text style={styles.scoreLabel}>Overall Compliance Score</Text>
            <Text style={styles.scoreCount}>{doneCount} of {applicable.length} tasks completed</Text>
          </View>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>{score}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${score}%` as any, backgroundColor: scoreColor }]} />
        </View>
        <Text style={[styles.scoreStatus, { color: scoreColor }]}>
          {score >= 75 ? '✓ Good standing — keep it up!' : score >= 40 ? '⚠ Needs attention' : '🚨 Action required — you may be at risk of fines'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {score === 100 && (
          <View style={styles.celebCard}>
            <Text style={styles.celebIcon}>🎉</Text>
            <Text style={styles.celebTitle}>Fully Compliant!</Text>
            <Text style={styles.celebSub}>Your business meets all current requirements. Check back regularly as laws update.</Text>
          </View>
        )}

        {Object.entries(byCategory).map(([cat, laws]) => {
          const catColor = CAT_COLORS[cat] ?? COLORS.gold;
          const catDone = laws.filter(l => checked.includes(l.id)).length;
          return (
            <View key={cat}>
              <View style={styles.catHeader}>
                <View style={[styles.catDot, { backgroundColor: catColor }]} />
                <Text style={styles.catName}>{cat}</Text>
                <Text style={styles.catCount}>{catDone}/{laws.length}</Text>
              </View>
              {laws.map(law => {
                const isChecked = checked.includes(law.id);
                return (
                  <View key={law.id} style={[styles.item, isChecked && styles.itemDone]}>
                    <TouchableOpacity style={styles.itemRow} onPress={() => toggleItem(law.id)} activeOpacity={0.7}>
                      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                        {isChecked && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemText, isChecked && styles.itemTextDone]}>{law.title}</Text>
                        {!isChecked && law.penalty > 0 && (
                          <Text style={styles.penalty}>
                            ⚠ PKR {law.penalty >= 1000000 ? `${(law.penalty / 1000000).toFixed(1)}M` : law.penalty >= 1000 ? `${(law.penalty / 1000).toFixed(0)}K` : law.penalty} fine
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.viewBtn}
                      onPress={() => navigation.navigate('LawDetail', { lawId: law.id })}>
                      <Text style={styles.viewBtnText}>Steps →</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          );
        })}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ℹ This checklist is a general guide. Always verify with the relevant regulatory authority.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.bg2,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.text3, marginTop: 3 },
  scoreCard: {
    backgroundColor: COLORS.bg2,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  scoreTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  scoreLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  scoreCount: { fontSize: 11, color: COLORS.text3, marginTop: 3 },
  scoreValue: { fontSize: 32, fontWeight: '700' },
  progressTrack: { height: 6, backgroundColor: COLORS.bg3, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressBar: { height: 6, borderRadius: 3 },
  scoreStatus: { fontSize: 12, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 40 },
  celebCard: {
    backgroundColor: COLORS.goldFaint,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGold,
  },
  celebIcon: { fontSize: 36, marginBottom: 8 },
  celebTitle: { fontSize: 17, fontWeight: '700', color: COLORS.gold, marginBottom: 6 },
  celebSub: { fontSize: 12, color: COLORS.text3, textAlign: 'center', lineHeight: 18 },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, marginBottom: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { fontSize: 11, fontWeight: '700', color: COLORS.text3, textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 },
  catCount: { fontSize: 11, color: COLORS.text3 },
  item: {
    backgroundColor: COLORS.bg2,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.border,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  itemDone: { borderLeftColor: COLORS.green, borderColor: 'rgba(5,150,105,0.2)' },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  itemText: { fontSize: 13, color: COLORS.text2, lineHeight: 18 },
  itemTextDone: { color: COLORS.text3, textDecorationLine: 'line-through' },
  penalty: { fontSize: 11, color: COLORS.red, fontWeight: '600', marginTop: 3 },
  viewBtn: { marginLeft: 34, alignSelf: 'flex-start', backgroundColor: COLORS.goldFaint, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 0.5, borderColor: COLORS.borderGold },
  viewBtnText: { fontSize: 11, color: COLORS.gold, fontWeight: '700' },
  disclaimer: { backgroundColor: COLORS.bg2, borderRadius: 10, padding: 12, marginTop: 8, borderWidth: 0.5, borderColor: COLORS.border },
  disclaimerText: { fontSize: 11, color: COLORS.text3, lineHeight: 17 },
});
