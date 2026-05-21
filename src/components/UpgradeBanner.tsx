import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { usePremium } from '../context/PremiumContext';

export default function UpgradeBanner() {
  const { colors } = useTheme();
  const { isPremium } = usePremium();
  const navigation = useNavigation<any>();
  const slideAnim = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    if (!isPremium) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 14,
        stiffness: 120,
      }).start();
    }
  }, [isPremium]);

  if (isPremium) return null;

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[s.banner, { backgroundColor: colors.gold }]}
        onPress={() => navigation.navigate('Paywall')}
        activeOpacity={0.88}
      >
        <View style={s.left}>
          <View style={s.fireBadge}>
            <Text style={s.fireText}>🔥 70% OFF</Text>
          </View>
          <Text style={s.msg}>
            <Text style={s.bold}>Unlock all laws</Text>
            {'  '}
            <Text style={s.old}>PKR 10,000</Text>
            {'  '}
            <Text style={s.price}>PKR 2,999</Text>
          </Text>
        </View>
        <View style={s.btn}>
          <Text style={s.btnText}>Upgrade ›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  fireBadge: {
    backgroundColor: '#000',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  fireText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  msg: { flex: 1, fontSize: 12 },
  bold: { fontWeight: '800', color: '#000' },
  old: { color: 'rgba(0,0,0,0.45)', textDecorationLine: 'line-through', fontWeight: '600' },
  price: { fontWeight: '800', color: '#000', fontSize: 13 },
  btn: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
});
