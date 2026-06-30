import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PROVINCES = [
  { en: "Punjab", ur: "پنجاب" },
  { en: "Sindh", ur: "سندھ" },
  { en: "KPK", ur: "خیبر پختونخوا" },
  { en: "Balochistan", ur: "بلوچستان" },
];

const COUNTRY_CODES = [
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+93", flag: "🇦🇫", name: "Afghanistan" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" },
];

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState(PROVINCES[0]);
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState(COUNTRY_CODES[0]);
  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={{ paddingTop: insets.top + 56, paddingHorizontal: 22, paddingBottom: 18 }}>
        <Text style={styles.title}>Join PNP</Text>
        <View style={styles.subRow}>
          <Text style={styles.subUrdu}>ممبر بنیں</Text>
          <Text style={styles.subEn}> · Become a Member</Text>
        </View>
        <View style={styles.progressRow}>
          <View style={[styles.progress, styles.progressOn]} />
          <View style={styles.progress} />
          <View style={styles.progress} />
        </View>
        <Text style={styles.step}>Step 1 of 3 · مرحلہ 1</Text>
      </View>

      <ScrollView style={{ paddingHorizontal: 22 }} contentContainerStyle={{ gap: 40, paddingBottom: 24 }}>
        <View>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.labelUrdu}>پورا نام</Text>
          </View>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Muhammad Ali"
              placeholderTextColor="#94A19A"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <View>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.labelUrdu}>موبائل نمبر</Text>
          </View>
          <View style={[styles.inputWrap, styles.phoneWrap]}>
            <TouchableOpacity
              style={styles.codeBtn}
              onPress={() => setCodeOpen((v) => !v)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 15 }}>{country.flag}</Text>
              <Text style={styles.prefix}>{country.code}</Text>
              <Ionicons name={codeOpen ? "chevron-up" : "chevron-down"} size={14} color="#5C6962" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="3XX XXX XXXX"
              placeholderTextColor="#94A19A"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {codeOpen && (
            <View style={styles.dropdownList}>
              {COUNTRY_CODES.map((c, i) => {
                const selected = c.code === country.code && c.name === country.name;
                return (
                  <TouchableOpacity
                    key={c.code + c.name}
                    style={[
                      styles.codeItem,
                      i < COUNTRY_CODES.length - 1 && styles.dropItemBorder,
                      selected && styles.dropItemOn,
                    ]}
                    onPress={() => {
                      setCountry(c);
                      setCodeOpen(false);
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{c.flag}</Text>
                    <Text style={styles.codeName}>{c.name}</Text>
                    <Text style={styles.codeValue}>{c.code}</Text>
                    {selected && (
                      <Ionicons name="checkmark-circle" size={16} color="#16804A" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Province</Text>
            <Text style={styles.labelUrdu}>صوبہ</Text>
          </View>

          <TouchableOpacity
            style={[styles.inputWrap, styles.rowBetween]}
            onPress={() => setOpen((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropText}>{province.en} — {province.ur}</Text>
            <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color="#94A19A" />
          </TouchableOpacity>

          {open && (
            <View style={styles.dropdownList}>
              {PROVINCES.map((p, i) => {
                const selected = p.en === province.en;
                return (
                  <TouchableOpacity
                    key={p.en}
                    style={[
                      styles.dropItem,
                      i < PROVINCES.length - 1 && styles.dropItemBorder,
                      selected && styles.dropItemOn,
                    ]}
                    onPress={() => {
                      setProvince(p);
                      setOpen(false);
                    }}
                  >
                    <Text style={styles.dropItemText}>{p.en} — {p.ur}</Text>
                    {selected && (
                      <Ionicons name="checkmark-circle" size={16} color="#16804A" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View>
          <View style={styles.labelRow}>
            <Text style={styles.label}>District</Text>
            <Text style={styles.labelUrdu}>ضلع</Text>
          </View>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lahore"
              placeholderTextColor="#94A19A"
              value={district}
              onChangeText={setDistrict}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push("/home")}
        >
          <Text style={styles.btnPrimaryText}>Next  →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "800", color: "#18241F" },
  subRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  subUrdu: { fontSize: 14, color: "#5C6962" },
  subEn: { fontSize: 14, color: "#5C6962" },
  progressRow: { flexDirection: "row", gap: 5, marginTop: 14 },
  progress: { height: 4, flex: 1, backgroundColor: "#E3E8E5", borderRadius: 2 },
  progressOn: { backgroundColor: "#16804A" },
  step: { fontSize: 11, color: "#94A19A", fontWeight: "600", marginTop: 6 },
  labelRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 7,
  },
  label: { fontSize: 12, fontWeight: "600", color: "#3E4B45" },
  labelUrdu: { fontSize: 13, color: "#94A19A" },
  inputWrap: {
    backgroundColor: "#F7F9F8", borderWidth: 1.5, borderColor: "#E3E8E5",
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13,
  },
  phoneWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  codeBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRightWidth: 1, borderRightColor: "#E3E8E5", paddingRight: 10,
  },
  prefix: {
    fontSize: 14, fontWeight: "600", color: "#5C6962",
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dropText: { fontSize: 14, color: "#3E4B45" },
  input: { flex: 1, fontSize: 14, color: "#18241F", padding: 0 },

  // Inline dropdown (shared)
  dropdownList: {
    marginTop: 6, backgroundColor: "#fff",
    borderWidth: 1.5, borderColor: "#E3E8E5", borderRadius: 14,
    overflow: "hidden",
  },
  dropItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 13, paddingHorizontal: 14,
  },
  dropItemBorder: { borderBottomWidth: 1, borderBottomColor: "#EEF2EF" },
  dropItemOn: { backgroundColor: "#F2FAF5" },
  dropItemText: { fontSize: 14, color: "#18241F" },

  // Country-code rows
  codeItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 13, paddingHorizontal: 14,
  },
  codeName: { flex: 1, fontSize: 14, color: "#18241F", fontWeight: "500" },
  codeValue: { fontSize: 14, color: "#5C6962", fontWeight: "600" },

  btnPrimary: {
    backgroundColor: "#16804A", borderRadius: 14, paddingVertical: 15,
    alignItems: "center", marginTop: 10,
  },
  btnPrimaryText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});