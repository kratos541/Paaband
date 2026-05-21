import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet,
  StatusBar, Animated, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Replace with your real Web Client ID from Google Cloud Console ───────────
// Steps: console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0
// Create "Web application" type client → copy the Client ID here
const WEB_CLIENT_ID = '892967690225-tqup2d7foj1hj25apea78fu1j3o4b3vo.apps.googleusercontent.com';
// ─────────────────────────────────────────────────────────────────────────────

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  scopes: ['profile', 'email'],
  offlineAccess: true,
});

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Entry animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(logoAnim, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 100 }),
      Animated.timing(contentAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(btnAnim, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 90 }),
    ]).start();
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) { Alert.alert('Sign-In Failed', 'Could not get token from Google.'); setLoading(false); return; }
      const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
      if (error) { Alert.alert('Sign-In Failed', error.message); setLoading(false); return; }
      const name = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'User';
      await setUser({ name, email: data.user?.email || '' });
      navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled — do nothing
      } else if (err.code === statusCodes.IN_PROGRESS) {
        // already in progress — do nothing
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Play Services', 'Google Play Services is not available on this device.');
      } else {
        // Show full error details so we can debug
        Alert.alert(
          'Sign-In Error',
          `Code: ${err.code}\n\n${err.message || 'Unknown error'}\n\nIf code is 10 (DEVELOPER_ERROR): Go to Google Cloud Console → Credentials → Create Android OAuth client with package "com.paaband" and the debug SHA-1.`,
        );
      }
    }
    setLoading(false);
  };

  const logoScale = logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const logoOpacity = logoAnim;
  const contentOpacity = contentAnim;
  const contentY = contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  const btnScale = btnAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        backgroundColor={colors.bg}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Background decorative circles */}
      <View style={[s.decorCircle1, { borderColor: colors.borderGold }]} />
      <View style={[s.decorCircle2, { borderColor: colors.borderGold }]} />

      {/* Logo */}
      <Animated.View style={[s.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={[s.logoBox, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}>
          <Text style={s.logoEmoji}>⚖️</Text>
        </View>
        <Text style={[s.appName, { color: colors.gold }]}>Paaband</Text>
        <Text style={[s.appUrdu, { color: colors.text3 }]}>پابند · قانون</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[s.taglineWrap, { opacity: contentOpacity, transform: [{ translateY: contentY }] }]}>
        <Text style={[s.tagline, { color: colors.text }]}>
          Pakistan's Business
        </Text>
        <Text style={[s.tagline, { color: colors.gold }]}>
          Compliance Guide
        </Text>
        <Text style={[s.taglineSub, { color: colors.text3 }]}>
          Stay legal. Avoid fines. Grow with confidence.
        </Text>

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        <View style={s.featuresRow}>
          {[
            ['⚖️', 'Laws for your\nbusiness type'],
            ['📅', 'Compliance\ncalendar'],
            ['🧮', 'Fine calculator'],
          ].map(([icon, text]) => (
            <View key={text} style={s.featureItem}>
              <Text style={s.featureIcon}>{icon}</Text>
              <Text style={[s.featureText, { color: colors.text3 }]}>{text}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Google Sign-In Button */}
      <Animated.View style={[s.btnWrap, { transform: [{ scale: btnScale }] }]}>
        {loading ? (
          <View style={[s.loadingBtn, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
            <ActivityIndicator color={colors.gold} />
            <Text style={[s.loadingText, { color: colors.text3 }]}>Signing in…</Text>
          </View>
        ) : (
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={isDark ? GoogleSigninButton.Color.Dark : GoogleSigninButton.Color.Light}
            onPress={handleGoogleSignIn}
            disabled={loading}
            style={s.googleSigninBtn}
          />
        )}

        <Text style={[s.privacyNote, { color: colors.text3 }]}>
          🔒 Your data is never sold or shared
        </Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  decorCircle1: {
    position: 'absolute', top: -80, right: -80,
    width: 260, height: 260, borderRadius: 130,
    borderWidth: 1, opacity: 0.4,
  },
  decorCircle2: {
    position: 'absolute', bottom: -60, left: -60,
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 1, opacity: 0.25,
  },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 80, height: 80, borderRadius: 24,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  logoEmoji: { fontSize: 40 },
  appName: { fontSize: 30, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  appUrdu: { fontSize: 13, letterSpacing: 3 },
  taglineWrap: { alignItems: 'center', width: '100%', marginBottom: 36 },
  tagline: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3, lineHeight: 30 },
  taglineSub: { fontSize: 14, marginTop: 10, textAlign: 'center', lineHeight: 20 },
  divider: { width: 40, height: 2, borderRadius: 1, marginVertical: 20 },
  featuresRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  featureItem: { alignItems: 'center', flex: 1 },
  featureIcon: { fontSize: 22, marginBottom: 6 },
  featureText: { fontSize: 11, textAlign: 'center', lineHeight: 15, fontWeight: '500' },
  btnWrap: { width: '100%', alignItems: 'center' },
  privacyNote: { fontSize: 12, marginTop: 14, textAlign: 'center' },
  googleSigninBtn: { width: '100%', height: 56 },
  loadingBtn: {
    width: '100%', height: 56, borderRadius: 14, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  loadingText: { fontSize: 15, fontWeight: '600' },
});
