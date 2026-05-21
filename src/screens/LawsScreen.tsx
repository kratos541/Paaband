import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, StatusBar, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';
import { useLang } from '../context/LanguageContext';
import { ALL_LAWS, Law, matchLaw } from '../data/laws';
import UpgradeBanner from '../components/UpgradeBanner';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FREE_LIMIT = 5;

const CAT_COLORS: Record<string, string> = {
  Tax: '#f59e0b', Labour: '#3b82f6', Operations: '#10b981', Licensing: '#8b5cf6',
  'Food Safety': '#f97316', Medical: '#ec4899', Environmental: '#06b6d4',
};

function LawCard({ law, onPress }: { law: Law; onPress: () => void }) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const onIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, damping: 10 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 10 }).start();
  const catColor = CAT_COLORS[law.cat] ?? colors.gold;

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={onIn} onPressOut={onOut}>
      <Animated.View style={[s.card, { backgroundColor: colors.bg2, borderColor: colors.border, transform: [{ scale }] }]}>
        <View style={s.cardTop}>
          <View style={[s.catBadge, { backgroundColor: catColor + '22' }]}>
            <Text style={[s.catText, { color: catColor }]}>{law.cat}</Text>
          </View>
          {law.urgent && (
            <View style={[s.urgentBadge, { backgroundColor: colors.redFaint }]}>
              <Text style={[s.urgentText, { color: colors.red }]}>URGENT</Text>
            </View>
          )}
          {law.badge && !law.urgent && (
            <View style={[s.badge, { backgroundColor: colors.goldFaint }]}>
              <Text style={[s.badgeText, { color: colors.gold }]}>{law.badge}</Text>
            </View>
          )}
        </View>
        <Text style={[s.title, { color: colors.text }]}>{law.title}</Text>
        <Text style={[s.auth, { color: colors.gold }]}>{law.authority}</Text>
        <Text style={[s.summary, { color: colors.text3 }]} numberOfLines={2}>{law.summaryEn}</Text>
        <View style={[s.footer, { borderTopColor: colors.border }]}>
          <Text style={[s.penaltyLabel, { color: colors.red }]}>⚠ Penalty: </Text>
          <Text style={[s.penaltyText, { color: colors.text3 }]} numberOfLines={1}>
            {law.penalty > 0 ? `PKR ${law.penalty.toLocaleString()}` : 'See law'}
            {law.penaltyPerDay > 0 ? ` + PKR ${law.penaltyPerDay.toLocaleString()}/day` : ''}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

function UpgradeCard() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const scale = useRef(new Animated.Value(1)).current;
  const onIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, damping: 10 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 10 }).start();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={onIn}
      onPressOut={onOut}
      onPress={() => navigation.navigate('Paywall')}
    >
      <Animated.View style={[s.upgradeCard, { backgroundColor: colors.gold, transform: [{ scale }] }]}>
        <View style={s.upgradeDiscountBadge}>
          <Text style={s.upgradeDiscountText}>70% OFF</Text>
        </View>
        <Text style={s.upgradeLock}>🔒</Text>
        <Text style={s.upgradeTitle}>Unlock All Laws</Text>
        <Text style={s.upgradeSub}>
          You are viewing 5 of {ALL_LAWS.length}+ laws.{'\n'}Upgrade to see all laws that apply to your business.
        </Text>
        <View style={s.upgradePriceRow}>
          <Text style={s.upgradePriceOld}>PKR 10,000</Text>
          <Text style={s.upgradePrice}>PKR 2,999</Text>
          <Text style={s.upgradeOnce}>one-time</Text>
        </View>
        <View style={s.upgradeBtn}>
          <Text style={s.upgradeBtnText}>Upgrade Now ›</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function LawsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const { isPremium } = usePremium();
  const { t, toggleLang } = useLang();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'mine' | 'all'>('mine');

  const allMatchedLaws = useMemo(() => {
    let list = filter === 'mine' && profile
      ? ALL_LAWS.filter(l => matchLaw(l, { type: profile.type, province: profile.province, revM: profile.revM, emp: profile.emp }))
      : ALL_LAWS;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.authority.toLowerCase().includes(q) ||
        l.summaryEn.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filter, profile, search]);

  const visibleLaws = isPremium ? allMatchedLaws : allMatchedLaws.slice(0, FREE_LIMIT);
  const showUpgradeCard = !isPremium && !search.trim() && allMatchedLaws.length > FREE_LIMIT;

  type ListItem = Law | { id: '__upgrade__' };

  const listData: ListItem[] = showUpgradeCard
    ? [...visibleLaws, { id: '__upgrade__' }]
    : visibleLaws;

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <StatusBar backgroundColor={colors.bg2} barStyle={isDark ? 'light-content' : 'dark-content'} />
      <UpgradeBanner />
      <View style={[s.header, { backgroundColor: colors.bg2, borderBottomColor: colors.border }]}>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[s.headerTitle, { color: colors.text }]}>{t.lawsTitle}</Text>
            <Text style={[s.headerSub, { color: colors.text3 }]}>{t.lawsSub}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={[s.premiumBadge, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}
              onPress={toggleLang}
            >
              <Text style={[s.premiumBadgeText, { color: colors.gold }]}>{t.langLabel}</Text>
            </TouchableOpacity>
            {!isPremium && (
              <TouchableOpacity
                style={[s.premiumBadge, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}
                onPress={() => navigation.navigate('Paywall')}
              >
                <Text style={[s.premiumBadgeText, { color: colors.gold }]}>🔒 Free</Text>
              </TouchableOpacity>
            )}
            {isPremium && (
              <View style={[s.premiumBadge, { backgroundColor: colors.greenFaint, borderColor: 'rgba(5,150,105,0.3)' }]}>
                <Text style={[s.premiumBadgeText, { color: colors.green }]}>✓ Pro</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={[s.searchBar, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={[s.searchInput, { color: colors.text }]}
          placeholder={t.searchPlaceholder}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.text3}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={[s.clearBtn, { color: colors.text3 }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[s.tabs, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
        {(['mine', 'all'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[s.tab, filter === f && { backgroundColor: colors.goldFaint, borderWidth: 0.5, borderColor: colors.borderGold }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.tabText, { color: filter === f ? colors.gold : colors.text3 }]}>
              {f === 'mine' ? t.mySector : t.allLaws}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!isPremium && (
        <View style={[s.freeBanner, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}>
          <Text style={[s.freeBannerText, { color: colors.gold }]}>
            Showing {Math.min(FREE_LIMIT, allMatchedLaws.length)} of {allMatchedLaws.length} laws · <Text style={{ fontWeight: '700' }} onPress={() => navigation.navigate('Paywall')}>Upgrade for PKR 2,999 ›</Text>
          </Text>
        </View>
      )}

      <FlatList
        data={listData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          if (item.id === '__upgrade__') return <UpgradeCard />;
          return (
            <LawCard
              law={item as Law}
              onPress={() => navigation.navigate('LawDetail', { lawId: item.id })}
            />
          );
        }}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🔍</Text>
            <Text style={[s.emptyText, { color: colors.text3 }]}>No laws found.</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 16, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 0.5 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 3 },
  premiumBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 0.5, marginTop: 4 },
  premiumBadgeText: { fontSize: 12, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 12, borderRadius: 12,
    paddingHorizontal: 14, borderWidth: 0.5,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14 },
  clearBtn: { fontSize: 15, paddingLeft: 8 },
  tabs: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 10,
    borderRadius: 10, padding: 3, borderWidth: 0.5,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
  freeBanner: {
    marginHorizontal: 16, marginTop: 8, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderWidth: 0.5,
  },
  freeBannerText: { fontSize: 12 },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
  card: { borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 0.5 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6, flexWrap: 'wrap' },
  catBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  catText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  urgentBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  urgentText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  auth: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  summary: { fontSize: 12, lineHeight: 17, marginBottom: 10 },
  footer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 0.5, paddingTop: 8 },
  penaltyLabel: { fontSize: 11, fontWeight: '600' },
  penaltyText: { fontSize: 11, flex: 1 },
  upgradeCard: {
    borderRadius: 16, padding: 20, marginBottom: 10, alignItems: 'center',
  },
  upgradeDiscountBadge: {
    backgroundColor: '#000', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10,
  },
  upgradeDiscountText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  upgradeLock: { fontSize: 32, marginBottom: 8 },
  upgradeTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 8 },
  upgradeSub: { fontSize: 13, color: 'rgba(0,0,0,0.65)', textAlign: 'center', lineHeight: 19, marginBottom: 16 },
  upgradePriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  upgradePriceOld: { fontSize: 16, fontWeight: '600', color: 'rgba(0,0,0,0.4)', textDecorationLine: 'line-through' },
  upgradePrice: { fontSize: 28, fontWeight: '700', color: '#000' },
  upgradeOnce: { fontSize: 13, color: 'rgba(0,0,0,0.6)' },
  upgradeBtn: {
    backgroundColor: '#000', borderRadius: 10, paddingVertical: 12,
    paddingHorizontal: 28,
  },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14 },
});
