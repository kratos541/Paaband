import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated, RefreshControl, Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';
import { useLang } from '../context/LanguageContext';
import { ALL_LAWS, NEWS, matchLaw, matchNews } from '../data/laws';
import UpgradeBanner from '../components/UpgradeBanner';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function getClosingTime(profile: any): string | null {
  if (!profile) return null;
  const law = ALL_LAWS.find(l => l.closingTimes && (l.provinces.includes('All') || l.provinces.includes(profile.province)));
  return law?.closingTimes?.[profile.type] ?? null;
}

function PressCard({ style, onPress, children }: { style?: any; onPress?: () => void; children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, damping: 10 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 10 }).start();
  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={onIn} onPressOut={onOut}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();
  const { user, profile } = useAuth();
  const { isPremium } = usePremium();
  const { t, toggleLang } = useLang();
  const [score, setScore] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(cardsAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
    if (!isPremium) {
      const t = setTimeout(() => setShowUpgradeModal(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => { calculateScore(); }, [profile]);

  const calculateScore = async () => {
    if (!profile) return;
    const biz = { type: profile.type, province: profile.province, revM: profile.revM, emp: profile.emp };
    const applicable = ALL_LAWS.filter(l => matchLaw(l, biz));
    setTotalCount(applicable.length);
    try {
      const stored = await AsyncStorage.getItem('@checklist');
      const checked: string[] = stored ? JSON.parse(stored) : [];
      const done = applicable.filter(i => checked.includes(i.id)).length;
      setCompletedCount(done);
      setScore(applicable.length > 0 ? Math.round((done / applicable.length) * 100) : 0);
    } catch { setScore(0); }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await calculateScore();
    setRefreshing(false);
  };

  const biz = profile ? { type: profile.type, province: profile.province, revM: profile.revM, emp: profile.emp } : null;
  const myLaws = biz ? ALL_LAWS.filter(l => matchLaw(l, biz)) : [];
  const myNews = profile ? NEWS.filter(n => matchNews(n, { type: profile.type, province: profile.province })) : [];
  const urgentLaws = myLaws.filter(l => l.urgent);
  const closingTime = getClosingTime(profile);
  const scoreColor = score >= 70 ? colors.red : score >= 40 ? colors.warning : colors.green;
  const firstName = (profile?.ownerName || user?.name || (t.greeting === 'Hello' ? 'there' : '')).split(' ')[0];

  const headerY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });
  const cardsOpacity = cardsAnim;

  return (
    <View style={{ flex: 1 }}>
    {/* Upgrade popup modal */}
    <Modal
      visible={showUpgradeModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowUpgradeModal(false)}
    >
      <View style={s.modalOverlay}>
        <View style={[s.modalCard, { backgroundColor: colors.bg2, borderColor: colors.borderGold }]}>
          <View style={s.modalDiscountBadge}>
            <Text style={s.modalDiscountText}>🔥 70% OFF — LIMITED OFFER</Text>
          </View>
          <Text style={[s.modalTitle, { color: colors.text }]}>Unlock All Laws</Text>
          <View style={s.modalPriceRow}>
            <Text style={s.modalPriceOld}>PKR 10,000</Text>
            <Text style={[s.modalPrice, { color: colors.gold }]}>PKR 2,999</Text>
          </View>
          <Text style={[s.modalOnce, { color: colors.text3 }]}>One-time · Lifetime access · No subscription</Text>
          <View style={[s.modalFeatures, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
            {['All 30+ laws for your business', 'Pre-filled government letters', 'Step-by-step compliance guide', 'Priority compliance alerts'].map((f, i) => (
              <Text key={i} style={[s.modalFeatureText, { color: colors.text2 }]}>✓  {f}</Text>
            ))}
          </View>
          <TouchableOpacity
            style={[s.modalUpgradeBtn, { backgroundColor: colors.gold }]}
            onPress={() => { setShowUpgradeModal(false); navigation.navigate('Paywall' as any); }}
          >
            <Text style={s.modalUpgradeBtnText}>Upgrade Now for PKR 2,999 ›</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowUpgradeModal(false)} style={s.modalDismiss}>
            <Text style={[s.modalDismissText, { color: colors.text3 }]}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    <ScrollView
      style={[s.container, { backgroundColor: colors.bg }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} colors={[colors.gold]} />}
    >
      <StatusBar backgroundColor={colors.bg2} barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <UpgradeBanner />
      <Animated.View style={[s.header, { backgroundColor: colors.bg2, borderBottomColor: colors.border, transform: [{ translateY: headerY }], opacity: headerAnim }]}>
        <View style={{ flex: 1 }}>
          <Text style={[s.greeting, { color: colors.text }]}>{t.greeting}{firstName ? `, ${firstName}` : ''} 👋</Text>
          <Text style={[s.subGreeting, { color: colors.text3 }]}>{t.complianceOverview}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            style={[s.langToggle, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}
            onPress={toggleLang}
            activeOpacity={0.7}
          >
            <Text style={[s.langToggleText, { color: colors.gold }]}>{t.langLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.avatar, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}
            onPress={() => navigation.getParent()?.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Text style={[s.avatarText, { color: colors.gold }]}>
              {(profile?.ownerName || user?.name || '?')[0].toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: cardsOpacity }}>

        {/* Business tag */}
        {profile && (
          <View style={[s.bizTag, { backgroundColor: colors.bg2, borderColor: colors.borderGold }]}>
            <Text style={[s.bizTagText, { color: colors.gold }]}>
              {profile.typeLabel} · {profile.name}
            </Text>
            <Text style={[s.bizTagSub, { color: colors.text3 }]}>
              {profile.emp} employees · {profile.city}, {profile.province}
            </Text>
          </View>
        )}

        {/* Closing time */}
        {closingTime && (
          <View style={[s.closingCard, { backgroundColor: colors.bg2, borderColor: colors.borderGold }]}>
            <Text style={[s.closingLabel, { color: colors.text3 }]}>{t.closingLabel}</Text>
            <Text style={[s.closingTime, { color: colors.text }]}>{closingTime}</Text>
            <View style={[s.closingBadge, { backgroundColor: colors.redFaint, borderColor: colors.redBorder }]}>
              <Text style={[s.closingFine, { color: colors.red }]}>{t.closingFine}</Text>
            </View>
          </View>
        )}

        {/* Stats grid */}
        <View style={[s.statsGrid, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          {[
            { num: myLaws.length, label: 'Laws', color: colors.text },
            { num: urgentLaws.length, label: 'Urgent', color: colors.red },
            { num: myNews.length, label: 'News', color: colors.warning },
            { num: `${score}%`, label: 'Score', color: scoreColor },
          ].map((item, i) => (
            <View key={item.label} style={[s.statCell, i > 0 && { borderLeftWidth: 0.5, borderLeftColor: colors.border }]}>
              <Text style={[s.statNum, { color: item.color }]}>{item.num}</Text>
              <Text style={[s.statLabel, { color: colors.text3 }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Compliance score ring */}
        <PressCard
          style={[s.card, { backgroundColor: colors.bg2, borderColor: colors.border }]}
          onPress={() => navigation.navigate('FineCalculator')}
        >
          <View style={s.cardRow}>
            <Text style={[s.cardTitle, { color: colors.text }]}>{t.complianceScore}</Text>
            <Text style={[s.linkText, { color: colors.gold }]}>{t.fineCalc} ›</Text>
          </View>
          <View style={s.scoreRow}>
            <View style={[s.ring, { borderColor: scoreColor }]}>
              <Text style={[s.ringScore, { color: scoreColor }]}>{score}%</Text>
              <Text style={[s.ringLabel, { color: colors.text3 }]}>{t.compliant}</Text>
            </View>
            <View style={s.scoreRight}>
              <Text style={[s.scoreDetail, { color: colors.text }]}>✅ {completedCount} of {totalCount} done</Text>
              <Text style={[s.scoreSub, { color: colors.text3 }]}>{t.fineFree}</Text>
              <TouchableOpacity
                style={[s.goldBtn, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}
                onPress={() => navigation.getParent()?.navigate('Laws')}
              >
                <Text style={[s.goldBtnText, { color: colors.gold }]}>{t.viewLaws}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </PressCard>

        {/* Urgent laws */}
        {urgentLaws.length > 0 && (
          <View style={[s.card, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
            <Text style={[s.cardTitle, { color: colors.text }]}>{t.priorityCompliance}</Text>
            <Text style={[s.cardSub, { color: colors.text3 }]}>{t.mustDo}</Text>
            {urgentLaws.slice(0, 4).map(law => (
              <PressCard
                key={law.id}
                style={[s.urgentItem, { backgroundColor: colors.bg3, borderLeftColor: colors.red }]}
                onPress={() => navigation.navigate('LawDetail', { lawId: law.id })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.urgentTitle, { color: colors.text }]}>{law.title}</Text>
                  <Text style={[s.urgentAuth, { color: colors.text3 }]}>{law.authority}</Text>
                </View>
                <Text style={[s.urgentArrow, { color: colors.gold }]}>›</Text>
              </PressCard>
            ))}
          </View>
        )}

        {/* Latest news */}
        {myNews.length > 0 && (
          <View style={[s.card, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
            <View style={s.cardRow}>
              <Text style={[s.cardTitle, { color: colors.text }]}>{t.latestNews}</Text>
              <TouchableOpacity onPress={() => navigation.getParent()?.navigate('News')}>
                <Text style={[s.linkText, { color: colors.gold }]}>{t.seeAll}</Text>
              </TouchableOpacity>
            </View>
            {myNews.slice(0, 2).map(n => (
              <View key={n.id} style={[s.newsItem, { borderBottomColor: colors.border }]}>
                <View style={[s.newsCat, { backgroundColor: n.catColor + '22' }]}>
                  <Text style={[s.newsCatText, { color: n.catColor }]}>{n.cat}</Text>
                </View>
                <Text style={[s.newsHeadline, { color: colors.text }]} numberOfLines={2}>{n.headline}</Text>
                <Text style={[s.newsAction, { color: colors.gold }]} numberOfLines={1}>› {n.action}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Shortcuts row */}
        <View style={s.shortcutsRow}>
          {[
            { icon: '📅', label: t.calendar, route: 'ComplianceCalendar' },
            { icon: '🧮', label: t.fineCalc, route: 'FineCalculator' },
          ].map(item => (
            <PressCard
              key={item.label}
              style={[s.shortcutBtn, { backgroundColor: colors.bg2, borderColor: colors.borderGold }]}
              onPress={() => (navigation as any).navigate(item.route)}
            >
              <Text style={s.shortcutIcon}>{item.icon}</Text>
              <Text style={[s.shortcutText, { color: colors.gold }]}>{item.label}</Text>
            </PressCard>
          ))}
        </View>

        {/* Upgrade banner for free users */}
        {!isPremium && (
          <TouchableOpacity
            style={[s.card, { backgroundColor: colors.gold, marginBottom: 12 }]}
            onPress={() => navigation.navigate('Paywall' as any)}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#000' }}>{t.freePlan}</Text>
            <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.65)', marginTop: 4 }}>
              Upgrade for PKR 2,999 to unlock all {ALL_LAWS.length}+ laws, letters and full checklist.
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#000', marginTop: 8 }}>{t.upgradeNow}</Text>
          </TouchableOpacity>
        )}

        {/* Tip card */}
        <View style={[s.card, { backgroundColor: colors.bg2, borderColor: colors.border, marginBottom: 32 }]}>
          <Text style={[s.cardTitle, { color: colors.text }]}>{t.quickTip}</Text>
          <View style={[s.tipBox, { backgroundColor: colors.bg3 }]}>
            <Text style={[s.tipText, { color: colors.text3 }]}>
              Being on the <Text style={{ fontWeight: '700', color: colors.gold }}>FBR Active Taxpayer List (ATL)</Text> saves you from 50% extra withholding tax on all bank transactions, vehicle purchases, and property deals. File your return on time!
            </Text>
          </View>
        </View>

      </Animated.View>
    </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 16, paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 0.5,
  },
  greeting: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  subGreeting: { fontSize: 12, marginTop: 2 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800' },
  langToggle: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  langToggleText: { fontSize: 12, fontWeight: '700' },
  bizTag: {
    marginHorizontal: 16, marginTop: 12, borderRadius: 10,
    padding: 12, borderWidth: 0.5,
  },
  bizTagText: { fontSize: 13, fontWeight: '600' },
  bizTagSub: { fontSize: 11, marginTop: 2 },
  closingCard: {
    marginHorizontal: 16, marginTop: 12, borderRadius: 14,
    padding: 16, alignItems: 'center', borderWidth: 1,
  },
  closingLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  closingTime: { fontSize: 44, fontWeight: '700', letterSpacing: -1, marginBottom: 10 },
  closingBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 0.5 },
  closingFine: { fontSize: 12, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 12,
    borderRadius: 14, borderWidth: 0.5, overflow: 'hidden',
  },
  statCell: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 10, marginTop: 3, fontWeight: '500' },
  card: {
    marginHorizontal: 16, marginTop: 12, borderRadius: 14,
    padding: 16, borderWidth: 0.5,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSub: { fontSize: 12, marginBottom: 12, marginTop: 2 },
  linkText: { fontSize: 12, fontWeight: '600' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ring: { width: 84, height: 84, borderRadius: 42, borderWidth: 6, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ringScore: { fontSize: 20, fontWeight: '700' },
  ringLabel: { fontSize: 9, marginTop: 1 },
  scoreRight: { flex: 1 },
  scoreDetail: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  scoreSub: { fontSize: 11, lineHeight: 16, marginBottom: 10 },
  goldBtn: { borderWidth: 0.5, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12, alignSelf: 'flex-start' },
  goldBtnText: { fontWeight: '700', fontSize: 12 },
  urgentItem: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 10,
    padding: 12, marginBottom: 8, borderLeftWidth: 3,
  },
  urgentTitle: { fontSize: 13, fontWeight: '600' },
  urgentAuth: { fontSize: 11, marginTop: 2 },
  urgentArrow: { fontSize: 22 },
  newsItem: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 0.5 },
  newsCat: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 6 },
  newsCatText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  newsHeadline: { fontSize: 13, fontWeight: '600', marginBottom: 4, lineHeight: 18 },
  newsAction: { fontSize: 11 },
  shortcutsRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, gap: 10 },
  shortcutBtn: { flex: 1, borderRadius: 12, padding: 18, alignItems: 'center', borderWidth: 0.5 },
  shortcutIcon: { fontSize: 28, marginBottom: 8 },
  shortcutText: { fontSize: 13, fontWeight: '700' },
  tipBox: { borderRadius: 10, padding: 14, marginTop: 8 },
  tipText: { fontSize: 13, lineHeight: 19 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modalCard: {
    width: '100%', borderRadius: 20, padding: 24,
    borderWidth: 1, alignItems: 'center',
  },
  modalDiscountBadge: {
    backgroundColor: '#c0392b', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16,
  },
  modalDiscountText: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 0.8 },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  modalPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 6 },
  modalPriceOld: { fontSize: 18, fontWeight: '600', color: 'rgba(150,150,150,0.8)', textDecorationLine: 'line-through' },
  modalPrice: { fontSize: 34, fontWeight: '700', letterSpacing: -1 },
  modalOnce: { fontSize: 12, marginBottom: 18, textAlign: 'center' },
  modalFeatures: { width: '100%', borderRadius: 12, padding: 14, borderWidth: 0.5, marginBottom: 20, gap: 8 },
  modalFeatureText: { fontSize: 13, lineHeight: 20 },
  modalUpgradeBtn: {
    width: '100%', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 10,
  },
  modalUpgradeBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },
  modalDismiss: { paddingVertical: 8 },
  modalDismissText: { fontSize: 13 },
});
