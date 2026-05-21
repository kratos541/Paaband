import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ALL_LAWS, matchLaw } from '../data/laws';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function fmt(n: number): string {
  if (n >= 1000000) return `PKR ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `PKR ${(n / 1000).toFixed(0)}K`;
  return `PKR ${n.toLocaleString()}`;
}

export default function FineCalculatorScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const [selectedId, setSelectedId] = useState<string>('');
  const [days, setDays] = useState<string>('');
  const [open, setOpen] = useState(false);

  const myLaws = useMemo(() => {
    if (!profile) return ALL_LAWS.filter(l => l.penalty > 0);
    return ALL_LAWS.filter(l =>
      matchLaw(l, { type: profile.type, province: profile.province, revM: profile.revM, emp: profile.emp }) &&
      l.penalty > 0
    );
  }, [profile]);

  const selected = myLaws.find(l => l.id === selectedId) || null;
  const daysNum = parseInt(days) || 0;
  const totalFine = selected
    ? selected.penalty + (daysNum > 0 && selected.penaltyPerDay > 0 ? selected.penaltyPerDay * daysNum : 0)
    : 0;

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <StatusBar backgroundColor={colors.bg2} barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[s.header, { backgroundColor: colors.bg2, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={[s.backText, { color: colors.gold }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>🧮 Fine Calculator</Text>
        <Text style={[s.headerSub, { color: colors.text3 }]}>See exactly how much you could owe</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Law selector */}
        <View style={s.section}>
          <Text style={[s.label, { color: colors.text3 }]}>SELECT A LAW</Text>
          <TouchableOpacity
            style={[s.selector, { backgroundColor: colors.bg2, borderColor: open ? colors.borderGold : colors.border }]}
            onPress={() => setOpen(!open)}
          >
            <Text style={[selected ? s.selectorText : s.selectorPlaceholder, { color: selected ? colors.text : colors.text3 }]}>
              {selected ? selected.title : 'Select a law…'}
            </Text>
            <Text style={[s.chevron, { color: colors.text3 }]}>{open ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {open && (
            <View style={[s.dropdown, { backgroundColor: colors.bg2, borderColor: colors.borderGold }]}>
              {myLaws.map(l => (
                <TouchableOpacity
                  key={l.id}
                  style={[
                    s.dropItem,
                    { borderBottomColor: colors.border },
                    l.id === selectedId && { backgroundColor: colors.goldFaint },
                  ]}
                  onPress={() => { setSelectedId(l.id); setOpen(false); }}
                >
                  <Text
                    style={[s.dropText, { color: l.id === selectedId ? colors.gold : colors.text2 }]}
                    numberOfLines={1}
                  >
                    {l.title}
                  </Text>
                  <Text style={[s.dropPenalty, { color: colors.red }]}>{fmt(l.penalty)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Days overdue */}
        {selected && (
          <View style={s.section}>
            <Text style={[s.label, { color: colors.text3 }]}>DAYS OVERDUE (0 if not overdue)</Text>
            <TextInput
              style={[s.input, { backgroundColor: colors.bg2, borderColor: colors.border, color: colors.text }]}
              value={days}
              onChangeText={setDays}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.text3}
            />
          </View>
        )}

        {/* Result */}
        {selected && (
          <View style={[s.resultCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
            {daysNum === 0 ? (
              <>
                <Text style={[s.resultGoodIcon, { color: colors.green }]}>✓</Text>
                <Text style={[s.resultGoodTitle, { color: colors.green }]}>Not overdue</Text>
                <Text style={[s.resultGoodSub, { color: colors.text3 }]}>Base fine if non-compliant:</Text>
                <Text style={[s.baseFine, { color: colors.text2 }]}>{fmt(selected.penalty)}</Text>
              </>
            ) : (
              <>
                <Text style={[s.resultLabel, { color: colors.text3 }]}>YOUR CURRENT FINE</Text>
                <Text style={[s.resultAmount, { color: colors.red }]}>{fmt(totalFine)}</Text>
                {selected.penaltyPerDay > 0 && (
                  <View style={[s.breakdown, { borderTopColor: colors.border }]}>
                    <View style={s.breakRow}>
                      <Text style={[s.breakLabel, { color: colors.text3 }]}>Base fine</Text>
                      <Text style={[s.breakValue, { color: colors.text2 }]}>{fmt(selected.penalty)}</Text>
                    </View>
                    <View style={s.breakRow}>
                      <Text style={[s.breakLabel, { color: colors.text3 }]}>Daily fine × {daysNum} days</Text>
                      <Text style={[s.breakValue, { color: colors.text2 }]}>{fmt(selected.penaltyPerDay * daysNum)}</Text>
                    </View>
                    <View style={[s.breakRow, s.breakTotal, { borderTopColor: colors.border }]}>
                      <Text style={[s.breakTotalLabel, { color: colors.text }]}>Total</Text>
                      <Text style={[s.breakTotalValue, { color: colors.red }]}>{fmt(totalFine)}</Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Law info */}
        {selected && (
          <View style={[s.lawInfo, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
            <Text style={[s.lawInfoTitle, { color: colors.text }]}>{selected.title}</Text>
            <Text style={[s.lawInfoSub, { color: colors.gold }]}>{selected.authority}</Text>
            <Text style={[s.lawInfoBody, { color: colors.text3 }]}>{selected.summaryEn}</Text>
            <TouchableOpacity
              style={[s.viewBtn, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}
              onPress={() => navigation.navigate('LawDetail', { lawId: selected.id })}
            >
              <Text style={[s.viewBtnText, { color: colors.gold }]}>View Full Law & Steps ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {!selected && (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🧮</Text>
            <Text style={[s.emptyTitle, { color: colors.text }]}>How it works</Text>
            <Text style={[s.emptyBody, { color: colors.text3 }]}>
              Select a law above to see the base fine and calculate daily penalties if you are overdue.
            </Text>
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
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 3 },
  scroll: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  selector: {
    borderWidth: 0.5, borderRadius: 12, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  selectorText: { fontSize: 14, flex: 1 },
  selectorPlaceholder: { fontSize: 14, flex: 1 },
  chevron: { fontSize: 12 },
  dropdown: { borderWidth: 0.5, borderRadius: 12, marginTop: 4, maxHeight: 240, overflow: 'hidden' },
  dropItem: {
    padding: 14, borderBottomWidth: 0.5,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  dropText: { fontSize: 13, flex: 1 },
  dropPenalty: { fontSize: 11, fontWeight: '600', marginLeft: 8 },
  input: { borderWidth: 0.5, borderRadius: 12, padding: 14, fontSize: 16, fontWeight: '600' },
  resultCard: {
    borderRadius: 14, padding: 20, alignItems: 'center',
    marginBottom: 16, borderWidth: 0.5,
  },
  resultLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  resultAmount: { fontSize: 44, fontWeight: '700', letterSpacing: -1 },
  resultGoodIcon: { fontSize: 36, marginBottom: 8 },
  resultGoodTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  resultGoodSub: { fontSize: 12, marginBottom: 12, textAlign: 'center' },
  baseFine: { fontSize: 24, fontWeight: '700' },
  breakdown: { width: '100%', marginTop: 16, borderTopWidth: 0.5, paddingTop: 12 },
  breakRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  breakLabel: { fontSize: 13 },
  breakValue: { fontSize: 13, fontWeight: '600' },
  breakTotal: { borderTopWidth: 0.5, paddingTop: 8, marginTop: 4 },
  breakTotalLabel: { fontSize: 14, fontWeight: '700' },
  breakTotalValue: { fontSize: 14, fontWeight: '700' },
  lawInfo: { borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 0.5 },
  lawInfoTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  lawInfoSub: { fontSize: 12, fontWeight: '600', marginBottom: 10 },
  lawInfoBody: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  viewBtn: { borderWidth: 0.5, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  viewBtnText: { fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyBody: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
