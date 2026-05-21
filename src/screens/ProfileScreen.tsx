import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, StatusBar, Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import UpgradeBanner from '../components/UpgradeBanner';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const REG_LABELS: Record<string, string> = {
  sole: 'Sole Proprietorship', partnership: 'Partnership',
  pvt: 'Private Limited', smc: 'Single Member Company',
};

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { t, toggleLang } = useLang();

  const handleSignOut = () => {
    Alert.alert(t.signOut, 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: t.signOut, style: 'destructive', onPress: async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'To update your business details, re-run setup.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Re-run Setup', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] }) },
    ]);
  };

  const initial = (profile?.ownerName || user?.name || '?')[0].toUpperCase();

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <StatusBar backgroundColor={colors.bg2} barStyle={isDark ? 'light-content' : 'dark-content'} />
      <UpgradeBanner />
      <View style={[s.header, { backgroundColor: colors.bg2, borderBottomColor: colors.border }]}>
        <Text style={[s.headerTitle, { color: colors.text }]}>{t.profileTitle}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[s.headerChip, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}
            onPress={() => navigation.navigate('Tutorial')}
          >
            <Text style={[s.headerChipText, { color: colors.gold }]}>{'? ' + t.tutorial}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.headerChip, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}
            onPress={toggleLang}
          >
            <Text style={[s.headerChipText, { color: colors.gold }]}>{t.langLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* User card */}
        <View style={[s.userCard, { backgroundColor: colors.bg2, borderColor: colors.borderGold }]}>
          <View style={[s.avatar, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}>
            <Text style={[s.avatarText, { color: colors.gold }]}>{initial}</Text>
          </View>
          <View style={s.userInfo}>
            <Text style={[s.userName, { color: colors.text }]}>{profile?.ownerName || user?.name || '—'}</Text>
            <Text style={[s.userEmail, { color: colors.text3 }]}>{user?.email || 'No email'}</Text>
            {profile?.phone ? <Text style={[s.userPhone, { color: colors.gold }]}>{profile.phone}</Text> : null}
          </View>
        </View>

        {/* Appearance */}
        <View style={[s.card, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          <Text style={[s.cardTitle, { color: colors.text }]}>🎨 Appearance</Text>
          <View style={s.themeRow}>
            <View style={s.themeLeft}>
              <Text style={[s.themeLabel, { color: colors.text }]}>{isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}</Text>
              <Text style={[s.themeSub, { color: colors.text3 }]}>{isDark ? 'Easy on eyes at night' : 'Bright & clear'}</Text>
            </View>
            <Switch
              value={!isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.bg3, true: colors.goldFaint }}
              thumbColor={isDark ? colors.text3 : colors.gold}
            />
          </View>
        </View>

        {/* Business Info */}
        {profile && (
          <View style={[s.card, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
            <Text style={[s.cardTitle, { color: colors.text }]}>🏢 Business Details</Text>
            {[
              ['Business Name', profile.name],
              ['Type', profile.typeLabel],
              ['Registration', REG_LABELS[profile.regType] ?? profile.regType],
              ['Location', `${profile.city}, ${profile.province}`],
              ['Revenue', profile.revLabel],
              ['Employees', profile.empLabel],
              profile.ntn ? ['NTN', profile.ntn] : null,
            ].filter((r): r is string[] => r !== null).map(([label, value], i, arr) => (
              <View key={label}>
                <View style={s.infoRow}>
                  <Text style={[s.infoLabel, { color: colors.text3 }]}>{label}</Text>
                  <Text style={[s.infoValue, { color: colors.text2 }]}>{value}</Text>
                </View>
                {i < arr.length - 1 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
              </View>
            ))}

            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <View style={s.flagsRow}>
              {[
                [profile.doesImport, 'Imports'],
                [profile.doesExport, 'Exports'],
                [profile.handlesFood, 'Food Handling'],
                [profile.hasFactory, 'Factory'],
                [profile.hasSignboard, 'Signboard'],
                [profile.hasGenerator, 'Generator'],
              ].filter(([val]) => val).map(([, label]) => (
                <View key={label as string} style={[s.flagBadge, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}>
                  <Text style={[s.flagText, { color: colors.gold }]}>{label as string}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[s.editBtn, { borderColor: colors.borderGold }]}
              onPress={handleEditProfile}
            >
              <Text style={[s.editBtnText, { color: colors.gold }]}>Edit Business Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Useful Links */}
        <View style={[s.card, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          <Text style={[s.cardTitle, { color: colors.text }]}>🔗 Useful Government Portals</Text>
          {[
            ['📋', 'NTN Registration', 'iris.fbr.gov.pk'],
            ['🏢', 'SECP Company Reg', 'eservices.secp.gov.pk'],
            ['👷', 'EOBI Registration', 'eobi.gov.pk'],
            ['🍽️', 'Punjab Food Authority', 'pfa.punjab.gov.pk'],
            ['💊', 'DRAP Drug Licensing', 'dra.gov.pk'],
            ['💻', 'PSEB IT Registration', 'pseb.org.pk'],
          ].map(([icon, title, url], i, arr) => (
            <View key={title}>
              <View style={s.linkRow}>
                <Text style={s.linkIcon}>{icon}</Text>
                <View style={s.linkContent}>
                  <Text style={[s.linkTitle, { color: colors.text }]}>{title}</Text>
                  <Text style={[s.linkUrl, { color: colors.gold }]}>{url}</Text>
                </View>
              </View>
              {i < arr.length - 1 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={[s.disclaimerCard, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}>
          <Text style={[s.disclaimerTitle, { color: colors.warning }]}>⚠️ Legal Disclaimer</Text>
          <Text style={[s.disclaimerText, { color: colors.text3 }]}>
            Paaband provides general compliance information for guidance only. Laws and regulations change frequently. Always consult a qualified lawyer or tax advisor for your specific situation.
          </Text>
        </View>

        <View style={s.appInfo}>
          <Text style={[s.appName, { color: colors.text }]}>⚖️ Paaband پابند</Text>
          <Text style={[s.appVersion, { color: colors.text3 }]}>Pakistan Business Compliance Guide v1.0</Text>
        </View>

        <TouchableOpacity
          style={[s.signOutBtn, { backgroundColor: colors.redFaint, borderColor: colors.redBorder }]}
          onPress={handleSignOut}
        >
          <Text style={[s.signOutText, { color: colors.red }]}>{t.signOut}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 16, paddingBottom: 14, paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  headerChip: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  headerChipText: { fontSize: 11, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  userCard: {
    borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, borderWidth: 0.5,
  },
  avatar: {
    width: 54, height: 54, borderRadius: 27,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  avatarText: { fontSize: 22, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700' },
  userEmail: { fontSize: 13, marginTop: 2 },
  userPhone: { fontSize: 12, marginTop: 2 },
  card: { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 0.5 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 14 },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  themeLeft: { flex: 1 },
  themeLabel: { fontSize: 14, fontWeight: '600' },
  themeSub: { fontSize: 12, marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 12, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 12 },
  divider: { height: 0.5 },
  flagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingVertical: 10 },
  flagBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 0.5 },
  flagText: { fontSize: 11, fontWeight: '600' },
  editBtn: { marginTop: 12, borderWidth: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  editBtnText: { fontWeight: '600', fontSize: 13 },
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  linkIcon: { fontSize: 20, marginRight: 12 },
  linkContent: { flex: 1 },
  linkTitle: { fontSize: 13, fontWeight: '600' },
  linkUrl: { fontSize: 11, marginTop: 1 },
  disclaimerCard: { borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 0.5 },
  disclaimerTitle: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  disclaimerText: { fontSize: 12, lineHeight: 18 },
  appInfo: { alignItems: 'center', marginBottom: 14 },
  appName: { fontSize: 15, fontWeight: '700' },
  appVersion: { fontSize: 11, marginTop: 3 },
  signOutBtn: { borderWidth: 0.5, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  signOutText: { fontWeight: '700', fontSize: 14 },
});
