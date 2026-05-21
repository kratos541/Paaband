import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();
  const { user, profile, loading } = useAuth();

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 100 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ).start();
    });
  }, []);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      if (!user && !profile) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else if (!profile) {
        navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [loading, user, profile]);

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <StatusBar backgroundColor={colors.bg} barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[s.decorRing, { borderColor: colors.borderGold }]} />

      <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <Animated.View style={[
          s.logoBox,
          { backgroundColor: colors.goldFaint, borderColor: colors.borderGold },
          { transform: [{ scale: pulseAnim }] },
        ]}>
          <Text style={s.logoIcon}>⚖️</Text>
        </Animated.View>
        <Text style={[s.name, { color: colors.gold }]}>Paaband</Text>
        <Text style={[s.sub, { color: colors.text3 }]}>پابند · قانون</Text>
      </Animated.View>

      <Animated.View style={[s.dotsWrap, { opacity: opacityAnim }]}>
        <LoadingDots color={colors.gold} />
      </Animated.View>

      <Animated.Text style={[s.tagline, { color: colors.text3, opacity: opacityAnim }]}>
        Pakistan Business Compliance
      </Animated.Text>
    </View>
  );
}

function LoadingDots({ color }: { color: string }) {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.stagger(180, [
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[dot1, dot2, dot3].map((anim, i) => (
        <Animated.View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, opacity: anim }} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  decorRing: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    borderWidth: 1, opacity: 0.15,
  },
  logoBox: {
    width: 80, height: 80, borderRadius: 24,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 18,
  },
  logoIcon: { fontSize: 40 },
  name: { fontSize: 30, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  sub: { fontSize: 13, letterSpacing: 3 },
  dotsWrap: { marginTop: 48 },
  tagline: { position: 'absolute', bottom: 40, fontSize: 12, letterSpacing: 1 },
});
