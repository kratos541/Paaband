import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  BIZ_TYPES, PROVINCES, CITIES, REG_TYPES, REV_BANDS, EMP_BANDS,
  LICENCE_TYPES, DESIGNATIONS, getBizLabel,
} from '../data/laws';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STEP_LABELS = [
  'Who You Are', 'Business & Location', 'Size & Registration',
  'Your Licences', 'Business Activities', 'Specific Details',
];

interface Form {
  name: string; ownerName: string; designation: string; phone: string;
  type: string; province: string; city: string; address: string;
  regType: string; ntn: string; revM: number; emp: number;
  licences: string[]; products: string;
  doesImport: boolean; doesExport: boolean; handlesFood: boolean;
  hasFactory: boolean; hasWarehouse: boolean; sellsOnline: boolean;
  hasMultipleLocations: boolean; dealsForeignCurrency: boolean;
  hasLongTermEmployees: boolean; hasGenerator: boolean; hasSignboard: boolean;
  acceptsDigitalPayments: boolean; hasBoiler: boolean; hasVehicles: boolean;
}

function SelectRow({ label, value, options, onSelect }: {
  label: string; value: string;
  options: { v: string; l: string }[];
  onSelect: (v: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[sel.label, { color: colors.text3 }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map(o => {
          const active = value === o.v;
          return (
            <TouchableOpacity
              key={o.v}
              style={[
                sel.chip,
                { backgroundColor: colors.bg2, borderColor: colors.border },
                active && { backgroundColor: colors.goldFaint, borderColor: colors.borderGold },
              ]}
              onPress={() => onSelect(o.v)}
            >
              <Text style={[sel.chipText, { color: active ? colors.gold : colors.text3 }, active && { fontWeight: '700' }]}>
                {o.l}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ToggleRow({ label, value, onToggle, icon }: {
  label: string; value: boolean; onToggle: () => void; icon?: string;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[
        tog.row,
        { backgroundColor: colors.bg2, borderColor: colors.border },
        value && { backgroundColor: colors.greenFaint, borderColor: 'rgba(5,150,105,0.25)' },
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[tog.box, { borderColor: colors.border }, value && { backgroundColor: colors.green, borderColor: colors.green }]}>
        {value && <Text style={tog.check}>✓</Text>}
      </View>
      {icon && <Text style={tog.icon}>{icon}</Text>}
      <Text style={[tog.label, { color: value ? colors.text : colors.text3 }, value && { fontWeight: '600' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; keyboardType?: any;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[field.label, { color: colors.text3 }]}>{label}</Text>
      <TextInput
        style={[field.input, { backgroundColor: colors.bg2, borderColor: colors.border, color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text3}
        keyboardType={keyboardType}
      />
    </View>
  );
}

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();
  const { setProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [err, setErr] = useState('');
  const [form, setForm] = useState<Form>({
    name: '', ownerName: '', designation: 'Owner', phone: '',
    type: '', province: '', city: '', address: '',
    regType: 'sole', ntn: '', revM: 3, emp: 3,
    licences: [], products: '',
    doesImport: false, doesExport: false, handlesFood: false,
    hasFactory: false, hasWarehouse: false, sellsOnline: false,
    hasMultipleLocations: false, dealsForeignCurrency: false,
    hasLongTermEmployees: false, hasGenerator: false, hasSignboard: false,
    acceptsDigitalPayments: false, hasBoiler: false, hasVehicles: false,
  });

  const upd = (k: keyof Form, v: any) => { setForm(p => ({ ...p, [k]: v })); setErr(''); };
  const toggle = (k: keyof Form) => setForm(p => ({ ...p, [k]: !(p[k] as boolean) }));
  const toggleLic = (l: string) => setForm(p => ({
    ...p,
    licences: p.licences.includes(l) ? p.licences.filter(x => x !== l) : [...p.licences, l],
  }));

  const handleNext = async () => {
    setErr('');
    if (step === 0 && (!form.name.trim() || !form.ownerName.trim() || !form.phone.trim())) {
      setErr('Please fill in all required fields.'); return;
    }
    if (step === 1 && (!form.type || !form.province || !form.city || !form.address.trim())) {
      setErr('Please fill in all required fields.'); return;
    }
    if (step < 5) { setStep(s => s + 1); return; }
    const revBand = REV_BANDS.find(b => b.v === form.revM);
    const empBand = EMP_BANDS.find(b => b.v === form.emp);
    await setProfile({
      ...form,
      typeLabel: getBizLabel(form.type),
      revLabel: revBand?.l || '',
      empLabel: empBand?.l || '',
    });
    navigation.reset({ index: 0, routes: [{ name: 'Tutorial' }] });
  };

  const cities = form.province ? (CITIES[form.province] ?? []) : [];
  const progress = ((step + 1) / 6) * 100;

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <StatusBar backgroundColor={colors.bg} barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[s.header, { backgroundColor: colors.bg2, borderBottomColor: colors.border }]}>
        <View style={[s.progressTrack, { backgroundColor: colors.bg3 }]}>
          <View style={[s.progressBar, { width: `${progress}%` as any, backgroundColor: colors.gold }]} />
        </View>
        <Text style={[s.stepIndicator, { color: colors.text3 }]}>
          Step {step + 1} of 6 — {STEP_LABELS[step]}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {step === 0 && (
          <>
            <Text style={[s.stepTitle, { color: colors.text }]}>👤 Who You Are</Text>
            <Field label="Business / Shop name *" value={form.name} onChangeText={v => upd('name', v)} placeholder="e.g. Ali General Store" />
            <Field label="Owner / Manager name *" value={form.ownerName} onChangeText={v => upd('ownerName', v)} placeholder="e.g. Muhammad Ali" />
            <Field label="WhatsApp / Phone *" value={form.phone} onChangeText={v => upd('phone', v)} placeholder="+92 300 1234567" keyboardType="phone-pad" />
            <SelectRow label="Your role" value={form.designation} options={DESIGNATIONS.map(d => ({ v: d, l: d }))} onSelect={v => upd('designation', v)} />
          </>
        )}

        {step === 1 && (
          <>
            <Text style={[s.stepTitle, { color: colors.text }]}>🏢 Business & Location</Text>
            <SelectRow label="Type of business *" value={form.type}
              options={BIZ_TYPES.map(b => ({ v: b.v, l: `${b.i} ${b.l}` }))} onSelect={v => upd('type', v)} />
            <SelectRow label="Province *" value={form.province}
              options={PROVINCES.map(p => ({ v: p, l: p }))} onSelect={v => { upd('province', v); upd('city', ''); }} />
            {cities.length > 0 && (
              <SelectRow label="City *" value={form.city}
                options={cities.map(c => ({ v: c, l: c }))} onSelect={v => upd('city', v)} />
            )}
            <Field label="Full address *" value={form.address} onChangeText={v => upd('address', v)} placeholder="Street, area, city" />
          </>
        )}

        {step === 2 && (
          <>
            <Text style={[s.stepTitle, { color: colors.text }]}>📊 Size & Registration</Text>
            <SelectRow label="Registration type" value={form.regType}
              options={REG_TYPES.map(r => ({ v: r.v, l: r.l }))} onSelect={v => upd('regType', v)} />
            <SelectRow label="Annual revenue" value={String(form.revM)}
              options={REV_BANDS.map(b => ({ v: String(b.v), l: b.l }))} onSelect={v => upd('revM', parseFloat(v))} />
            <SelectRow label="Number of employees" value={String(form.emp)}
              options={EMP_BANDS.map(b => ({ v: String(b.v), l: b.l }))} onSelect={v => upd('emp', parseInt(v))} />
            <Field label="NTN (optional)" value={form.ntn} onChangeText={v => upd('ntn', v)} placeholder="e.g. 1234567-8" keyboardType="numbers-and-punctuation" />
          </>
        )}

        {step === 3 && (
          <>
            <Text style={[s.stepTitle, { color: colors.text }]}>📋 Your Licences</Text>
            <Text style={[s.stepSub, { color: colors.text3 }]}>Select licences you already have.</Text>
            {LICENCE_TYPES.map(l => (
              <ToggleRow key={l} label={l} value={form.licences.includes(l)} onToggle={() => toggleLic(l)} />
            ))}
            <Field label="What do you sell / do?" value={form.products} onChangeText={v => upd('products', v)} placeholder="e.g. Groceries, electronics, clothing…" />
          </>
        )}

        {step === 4 && (
          <>
            <Text style={[s.stepTitle, { color: colors.text }]}>⚙️ Business Activities</Text>
            <Text style={[s.stepSub, { color: colors.text3 }]}>Select all that apply.</Text>
            <ToggleRow icon="🚢" label="I import goods from abroad" value={form.doesImport} onToggle={() => toggle('doesImport')} />
            <ToggleRow icon="✈️" label="I export goods abroad" value={form.doesExport} onToggle={() => toggle('doesExport')} />
            <ToggleRow icon="🍽️" label="I handle / prepare / sell food" value={form.handlesFood} onToggle={() => toggle('handlesFood')} />
            <ToggleRow icon="🏭" label="I have a factory or production unit" value={form.hasFactory} onToggle={() => toggle('hasFactory')} />
            <ToggleRow icon="🏗️" label="I have a warehouse or storage facility" value={form.hasWarehouse} onToggle={() => toggle('hasWarehouse')} />
            <ToggleRow icon="🛒" label="I sell online (e-commerce)" value={form.sellsOnline} onToggle={() => toggle('sellsOnline')} />
            <ToggleRow icon="📍" label="I have multiple locations" value={form.hasMultipleLocations} onToggle={() => toggle('hasMultipleLocations')} />
            <ToggleRow icon="💱" label="I deal in foreign currency" value={form.dealsForeignCurrency} onToggle={() => toggle('dealsForeignCurrency')} />
          </>
        )}

        {step === 5 && (
          <>
            <Text style={[s.stepTitle, { color: colors.text }]}>🔍 Specific Details</Text>
            <Text style={[s.stepSub, { color: colors.text3 }]}>Almost done! A few more details.</Text>
            <ToggleRow icon="👴" label="I have employees with 5+ years service" value={form.hasLongTermEmployees} onToggle={() => toggle('hasLongTermEmployees')} />
            <ToggleRow icon="⚡" label="I have a generator on premises" value={form.hasGenerator} onToggle={() => toggle('hasGenerator')} />
            <ToggleRow icon="🪧" label="I have a signboard / outdoor advertising" value={form.hasSignboard} onToggle={() => toggle('hasSignboard')} />
            <ToggleRow icon="💳" label="I accept digital payments (POS / QR)" value={form.acceptsDigitalPayments} onToggle={() => toggle('acceptsDigitalPayments')} />
            <ToggleRow icon="🔩" label="I have a boiler or pressure vessel" value={form.hasBoiler} onToggle={() => toggle('hasBoiler')} />
            <ToggleRow icon="🚚" label="I have commercial vehicles" value={form.hasVehicles} onToggle={() => toggle('hasVehicles')} />
          </>
        )}

        {!!err && (
          <View style={[s.errorBox, { backgroundColor: colors.redFaint, borderColor: colors.redBorder }]}>
            <Text style={[s.errorText, { color: colors.red }]}>⚠ {err}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[s.footer, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
        {step > 0 && (
          <TouchableOpacity
            style={[s.backBtn, { backgroundColor: colors.bg2, borderColor: colors.border }]}
            onPress={() => setStep(s => s - 1)}
          >
            <Text style={[s.backText, { color: colors.text3 }]}>‹ Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[s.nextBtn, { backgroundColor: colors.gold }, step === 0 && { flex: 1 }]}
          onPress={handleNext}
        >
          <Text style={s.nextText}>{step === 5 ? '✓ Build My Profile ›' : 'Continue ›'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 0.5,
  },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 10 },
  progressBar: { height: 4, borderRadius: 2 },
  stepIndicator: { fontSize: 12, fontWeight: '600' },
  scroll: { padding: 20, paddingBottom: 16 },
  stepTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  stepSub: { fontSize: 13, marginBottom: 16, lineHeight: 19 },
  errorBox: { borderWidth: 0.5, borderRadius: 8, padding: 10, marginTop: 12 },
  errorText: { fontSize: 13 },
  footer: {
    flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 24,
    borderTopWidth: 0.5,
  },
  backBtn: { borderWidth: 0.5, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18 },
  backText: { fontWeight: '600', fontSize: 14 },
  nextBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  nextText: { color: '#000', fontWeight: '700', fontSize: 14 },
});

const sel = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  chip: { marginRight: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 0.5 },
  chipText: { fontSize: 13 },
});

const tog = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12,
    borderRadius: 10, marginBottom: 8, borderWidth: 0.5,
  },
  box: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  check: { color: '#fff', fontSize: 11, fontWeight: '700' },
  icon: { fontSize: 16 },
  label: { fontSize: 13, flex: 1 },
});

const field = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  input: { borderWidth: 0.5, borderRadius: 10, padding: 13, fontSize: 14 },
});
