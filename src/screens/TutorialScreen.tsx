import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  FlatList, StatusBar, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '⚖️',
    titleEn: 'Welcome to Paaband',
    titleUr: 'پاابند میں خوش آمدید',
    descEn: 'Pakistan\'s first smart compliance assistant for small and medium businesses. Know your laws. Avoid fines. Run with confidence.',
    descUr: 'پاکستان کا پہلا ذہین تعمیلی معاون۔ اپنے قوانین جانیں، جرمانوں سے بچیں، اعتماد کے ساتھ کاروبار کریں۔',
    bg: '#C9A84C',
    light: true,
  },
  {
    icon: '🏪',
    titleEn: 'Set Up Your Business',
    titleUr: 'اپنا کاروبار ترتیب دیں',
    descEn: 'Tell us your business type, city, and size. We match the exact laws and regulations that apply to YOUR business — nothing extra.',
    descUr: 'اپنا کاروباری نوع، شہر اور سائز بتائیں۔ ہم صرف وہ قوانین دکھاتے ہیں جو آپ کے کاروبار پر لاگو ہوتے ہیں۔',
    bg: null,
    light: false,
  },
  {
    icon: '📋',
    titleEn: 'Know Your Laws',
    titleUr: 'اپنے قوانین جانیں',
    descEn: 'Browse 30+ laws covering Tax, Labour, Licensing, Food Safety, and more. Each law shows the fine for non-compliance so you know the risk.',
    descUr: '30 سے زائد قوانین براؤز کریں — ٹیکس، لیبر، لائسنس، فوڈ سیفٹی وغیرہ۔ ہر قانون کا جرمانہ بھی دیکھیں۔',
    bg: null,
    light: false,
  },
  {
    icon: '✅',
    titleEn: 'Track Your Score',
    titleUr: 'اپنا اسکور ٹریک کریں',
    descEn: 'Tick off each law as you comply. Your Compliance Score shows how safe your business is. Aim for 100% to stay fine-free.',
    descUr: 'ہر قانون کی تکمیل پر ٹک لگائیں۔ آپ کا تعمیلی اسکور دکھاتا ہے کہ آپ کتنے محفوظ ہیں۔ 100% کی کوشش کریں۔',
    bg: null,
    light: false,
  },
  {
    icon: '📰',
    titleEn: 'Stay Updated',
    titleUr: 'اپ ڈیٹ رہیں',
    descEn: 'Get the latest tax and regulatory news filtered for your sector. FBR updates, SECP changes, labour law news — all in one place.',
    descUr: 'اپنے شعبے کے لیے فلٹر کی گئی تازہ ٹیکس اور ریگولیٹری خبریں حاصل کریں۔ FBR، SECP، لیبر قوانین — سب ایک جگہ۔',
    bg: null,
    light: false,
  },
  {
    icon: '🔑',
    titleEn: 'Go Premium',
    titleUr: 'پریمیم بنیں',
    descEn: 'Free plan shows 5 laws. Upgrade once for PKR 2,999 to unlock ALL laws, pre-filled government letters, and full compliance checklists. Lifetime access.',
    descUr: 'مفت پلان میں 5 قوانین ہیں۔ صرف PKR 2,999 میں تمام قوانین، سرکاری خطوط اور مکمل چیک لسٹ ان لاک کریں۔ ہمیشہ کے لیے۔',
    bg: '#C9A84C',
    light: true,
  },
];

function AnimatedDot({ anim, color }: { anim: Animated.Value; color: string }) {
  const w = anim.interpolate({ inputRange: [0, 1], outputRange: [6, 20] });
  const op = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  return <Animated.View style={[{ height: 6, borderRadius: 3, marginHorizontal: 3, backgroundColor: color }, { width: w, opacity: op }]} />;
}

export default function TutorialScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const { lang } = useLang();
  const [index, setIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const dotsAnim = useRef(SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;

  const isLast = index === SLIDES.length - 1;

  const animateDots = (i: number) => {
    SLIDES.forEach((_, idx) => {
      Animated.spring(dotsAnim[idx], {
        toValue: idx === i ? 1 : 0,
        useNativeDriver: false,
        damping: 12,
      }).start();
    });
  };

  const goTo = (i: number) => {
    flatRef.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
    animateDots(i);
  };

  const finish = async () => {
    await AsyncStorage.setItem('@tutorialSeen', 'true');
    navigation.replace('Main');
  };

  const skip = async () => {
    await AsyncStorage.setItem('@tutorialSeen', 'true');
    navigation.replace('Main');
  };

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <StatusBar backgroundColor="transparent" translucent barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Skip */}
      <TouchableOpacity style={s.skipBtn} onPress={skip}>
        <Text style={[s.skipText, { color: colors.text3 }]}>
          {lang === 'ur' ? 'چھوڑیں' : 'Skip'}
        </Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => {
          const bg = item.bg ?? colors.bg2;
          const isGold = !!item.bg;
          return (
            <View style={[s.slide, { width, backgroundColor: bg }]}>
              <View style={[s.iconCircle, { backgroundColor: isGold ? 'rgba(0,0,0,0.12)' : colors.goldFaint, borderColor: isGold ? 'rgba(0,0,0,0.15)' : colors.borderGold }]}>
                <Text style={s.icon}>{item.icon}</Text>
              </View>
              <Text style={[s.title, { color: isGold ? '#000' : colors.text }]}>
                {lang === 'ur' ? item.titleUr : item.titleEn}
              </Text>
              <Text style={[s.subtitle, { color: lang === 'ur' ? item.titleEn : item.titleUr, opacity: 0.55 }]}>
                {lang === 'ur' ? item.titleEn : item.titleUr}
              </Text>
              <Text style={[s.desc, { color: isGold ? 'rgba(0,0,0,0.72)' : colors.text2 }]}>
                {lang === 'ur' ? item.descUr : item.descEn}
              </Text>
            </View>
          );
        }}
      />

      {/* Bottom nav */}
      <View style={[s.bottom, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
        {/* Dots */}
        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <AnimatedDot key={i} anim={dotsAnim[i]} color={colors.gold} />
          ))}
        </View>

        <View style={s.btnRow}>
          {index > 0 && (
            <TouchableOpacity style={[s.backBtn, { borderColor: colors.border }]} onPress={() => goTo(index - 1)}>
              <Text style={[s.backText, { color: colors.text3 }]}>‹</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[s.nextBtn, { backgroundColor: colors.gold, flex: index > 0 ? 0 : 1 }]}
            onPress={isLast ? finish : () => goTo(index + 1)}
          >
            <Text style={s.nextText}>
              {isLast
                ? (lang === 'ur' ? 'شروع کریں!' : "Let's Go!")
                : (lang === 'ur' ? 'آگے ›' : 'Next ›')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  skipBtn: { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  skipText: { fontSize: 14, fontWeight: '600' },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 20,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 32,
  },
  icon: { fontSize: 52 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 14, fontWeight: '500', textAlign: 'center', marginBottom: 20, fontStyle: 'italic' },
  desc: { fontSize: 15, lineHeight: 24, textAlign: 'center', fontWeight: '400' },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 20,
    borderTopWidth: 0.5,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20, gap: 6 },
  dot: { height: 6, borderRadius: 3 },
  btnRow: { flexDirection: 'row', gap: 10 },
  backBtn: {
    width: 48, height: 52, borderRadius: 14, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { fontSize: 22, fontWeight: '300' },
  nextBtn: {
    height: 52, borderRadius: 14, paddingHorizontal: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  nextText: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 0.3 },
});
