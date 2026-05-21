import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ALL_LAWS, matchLaw, daysUntil } from '../data/laws';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MONTH_FULL = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function ComplianceCalendarScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const lawsWithDeadlines = useMemo(() => {
    const base = profile
      ? ALL_LAWS.filter(l => matchLaw(l, { type: profile.type, province: profile.province, revM: profile.revM, emp: profile.emp }))
      : ALL_LAWS;
    return base.filter(l => l.deadline);
  }, [profile]);

  const deadlinesThisMonth = lawsWithDeadlines.filter(l => {
    if (!l.deadline) return false;
    const d = new Date(l.deadline);
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  });

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const deadlineDays = new Set(deadlinesThisMonth.map(l => new Date(l.deadline!).getDate()));

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const otherDeadlines = lawsWithDeadlines
    .filter(l => {
      const d = new Date(l.deadline!);
      return !(d.getMonth() === viewMonth && d.getFullYear() === viewYear);
    })
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <StatusBar backgroundColor={colors.bg2} barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[s.header, { backgroundColor: colors.bg2, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={[s.backText, { color: colors.gold }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>📅 Compliance Calendar</Text>
        <Text style={[s.headerSub, { color: colors.text3 }]}>All your deadlines in one place</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Month nav */}
        <View style={s.monthNav}>
          <TouchableOpacity
            onPress={prevMonth}
            style={[s.monthBtn, { backgroundColor: colors.bg2, borderColor: colors.border }]}
          >
            <Text style={[s.monthBtnText, { color: colors.text2 }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[s.monthTitle, { color: colors.text }]}>{MONTH_FULL[viewMonth]} {viewYear}</Text>
          <TouchableOpacity
            onPress={nextMonth}
            style={[s.monthBtn, { backgroundColor: colors.bg2, borderColor: colors.border }]}
          >
            <Text style={[s.monthBtnText, { color: colors.text2 }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar grid */}
        <View style={[s.calCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          <View style={s.dayHeaders}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <Text key={d} style={[s.dayHeader, { color: colors.text3 }]}>{d}</Text>
            ))}
          </View>
          <View style={s.grid}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <View key={`e-${i}`} style={s.cell} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
              const hasDeadline = deadlineDays.has(day);
              return (
                <View key={day} style={[s.cell, isToday && { backgroundColor: colors.goldFaint, borderRadius: 8 }]}>
                  <Text style={[s.cellText, { color: isToday ? colors.gold : colors.text2 }, isToday && { fontWeight: '700' }]}>
                    {day}
                  </Text>
                  {hasDeadline && <View style={[s.dot, { backgroundColor: colors.red }]} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* Deadlines this month */}
        <Text style={[s.sectionTitle, { color: colors.text3 }]}>
          {deadlinesThisMonth.length > 0
            ? `${deadlinesThisMonth.length} DEADLINE${deadlinesThisMonth.length > 1 ? 'S' : ''} THIS MONTH`
            : 'NO DEADLINES THIS MONTH'}
        </Text>

        {deadlinesThisMonth.map(law => {
          const d = daysUntil(law.deadline);
          const isOverdue = d !== null && d < 0;
          const isUrgent = d !== null && d >= 0 && d <= 30;
          return (
            <TouchableOpacity
              key={law.id}
              style={[s.deadlineCard, { backgroundColor: colors.bg2, borderColor: colors.border, borderLeftColor: colors.gold }]}
              onPress={() => navigation.navigate('LawDetail', { lawId: law.id })}
              activeOpacity={0.75}
            >
              <View style={s.deadlineLeft}>
                <Text style={[s.deadlineTitle, { color: colors.text }]}>{law.title}</Text>
                <Text style={[s.deadlineAuth, { color: colors.gold }]}>{law.authority}</Text>
                <Text style={[s.deadlineDate, { color: colors.text3 }]}>
                  Due: {new Date(law.deadline!).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>
              <View style={s.deadlineRight}>
                {isOverdue ? (
                  <View style={[s.overdueBadge, { backgroundColor: colors.redFaint }]}>
                    <Text style={[s.overdueText, { color: colors.red }]}>OVERDUE</Text>
                  </View>
                ) : isUrgent ? (
                  <View style={[s.urgentBadge, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                    <Text style={[s.urgentText, { color: colors.warning }]}>{d}d left</Text>
                  </View>
                ) : (
                  <Text style={[s.daysLeft, { color: colors.text3 }]}>{d}d</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Other upcoming */}
        {otherDeadlines.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: colors.text3, marginTop: 20 }]}>OTHER UPCOMING DEADLINES</Text>
            {otherDeadlines.map(law => (
              <TouchableOpacity
                key={law.id}
                style={[s.deadlineCard, { backgroundColor: colors.bg2, borderColor: colors.border, borderLeftColor: colors.gold }]}
                onPress={() => navigation.navigate('LawDetail', { lawId: law.id })}
                activeOpacity={0.75}
              >
                <View style={s.deadlineLeft}>
                  <Text style={[s.deadlineTitle, { color: colors.text }]}>{law.title}</Text>
                  <Text style={[s.deadlineDate, { color: colors.text3 }]}>
                    {new Date(law.deadline!).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Text>
                </View>
                <Text style={[s.daysLeft, { color: colors.text3 }]}>{daysUntil(law.deadline)}d</Text>
              </TouchableOpacity>
            ))}
          </>
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
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  monthBtnText: { fontSize: 20 },
  monthTitle: { fontSize: 16, fontWeight: '700' },
  calCard: { borderRadius: 14, padding: 12, marginBottom: 20, borderWidth: 0.5 },
  dayHeaders: { flexDirection: 'row', marginBottom: 8 },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%` as any, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  cellText: { fontSize: 13 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
  sectionTitle: {
    fontSize: 10, fontWeight: '700', letterSpacing: 0.8,
    textTransform: 'uppercase', marginBottom: 10,
  },
  deadlineCard: {
    borderRadius: 12, padding: 14, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 0.5, borderLeftWidth: 3,
  },
  deadlineLeft: { flex: 1 },
  deadlineTitle: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
  deadlineAuth: { fontSize: 11, marginBottom: 3 },
  deadlineDate: { fontSize: 11 },
  deadlineRight: { marginLeft: 10 },
  overdueBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  overdueText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  urgentBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  urgentText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  daysLeft: { fontSize: 11, fontWeight: '600' },
});
