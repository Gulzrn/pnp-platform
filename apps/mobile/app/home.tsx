import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";

const STATS = [
  { v: "48K", l: "Members" },
  { v: "3.2K", l: "Complaints" },
  { v: "1.2K", l: "Ideas" },
  { v: "890", l: "Jobs" },
];

const PORTALS = [
  { name: "Rozgar", urdu: "روزگار پورٹل", tag: "Jobs · AI CV", lib: "ion", icon: "briefcase-outline", route: "/rozgar" },
  { name: "Problems", urdu: "مسائل پورٹل", tag: "Report · Map", lib: "ion", icon: "map-outline", route: "/problems" },
  { name: "Naujawan", urdu: "نوجوان آواز", tag: "Ideas · Vote", lib: "ion", icon: "bulb-outline", route: "/home" },
  { name: "Kisaan", urdu: "کسان پورٹل", tag: "Crops · AI", lib: "mci", icon: "leaf", route: "/home" },
  { name: "Mahfooz", urdu: "محفوظ", tag: "Safety · Route", lib: "ion", icon: "shield-checkmark-outline", route: "/home" },
  { name: "Qaanoon", urdu: "قانون", tag: "Legal · Rights", lib: "mci", icon: "scale-balance", route: "/home" },
  { name: "Skills", urdu: "اسکل پاکستان", tag: "Free Courses", lib: "ion", icon: "book-outline", route: "/home" },
  { name: "Emergency", urdu: "ہنگامی مدد", tag: "Blood · Aid", lib: "mci", icon: "alarm-light-outline", route: "/home" },
];

const TICKER_TEXT = "KISAAN PORTAL ✦ پاکستان مسائل ✦ SKILL PAKISTAN ✦ محفوظ ✦ ROZGAR     ";

function Marquee() {
  const x = useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0);

  useEffect(() => {
    if (!w) return;
    x.setValue(0);
    const loop = Animated.loop(
      Animated.timing(x, {
        toValue: -w,
        duration: w * 28, // speed: higher = slower
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [w]);

  return (
    <View style={styles.ticker}>
      <Animated.View style={{ flexDirection: "row", transform: [{ translateX: x }] }}>
        <Text
          numberOfLines={1}
          style={styles.tickerText}
          onLayout={(e) => setW(e.nativeEvent.layout.width)}
        >
          {TICKER_TEXT}
        </Text>
        <Text numberOfLines={1} style={styles.tickerText}>
          {TICKER_TEXT}
        </Text>
      </Animated.View>
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={[styles.topBar, { paddingTop: insets.top + 22 }]}>
        <View>
          <Text style={styles.welcome}>WELCOME BACK</Text>
          <Text style={styles.name}>Jahanzaib</Text>
          <Text style={styles.nameUrdu}>جہانزیب، خوش آمدید</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={20} color="#1B8A52" />
          <View style={styles.dot} />
        </View>
      </View>

      <Marquee />

      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.l} style={styles.stat}>
              <Text style={styles.statV}>{s.v}</Text>
              <Text style={styles.statL}>{s.l}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionLabel}>AI ASSISTANT</Text>
          <Text style={styles.sectionTitle}>
            Saathi  <Text style={styles.sectionTitleUrdu}>ساتھی</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.saathiCard} onPress={() => router.push("/saathi")}>
          <View style={styles.iconChip}>
            <MaterialCommunityIcons name="robot-outline" size={22} color="#1B8A52" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.saathiTitle}>PNP Saathi  پی این پی ساتھی</Text>
            <Text style={styles.saathiSub}>Ask in Urdu, English, Punjabi,{"\n"}Sindhi...</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#1B8A52" />
        </TouchableOpacity>

        <View style={[styles.sectionHead, { paddingTop: 0 }]}>
          <Text style={styles.sectionLabel}>ALL PORTALS</Text>
          <Text style={styles.sectionTitle}>
            Choose Portal  <Text style={styles.sectionTitleUrdu}>پورٹل منتخب کریں</Text>
          </Text>
        </View>

        <View style={styles.grid}>
          {PORTALS.map((p) => (
            <TouchableOpacity key={p.name} style={styles.portalCard} onPress={() => router.push(p.route as any)}>
              <View style={styles.iconChip}>
                {p.lib === "mci" ? (
                  <MaterialCommunityIcons name={p.icon as any} size={22} color="#1B8A52" />
                ) : (
                  <Ionicons name={p.icon as any} size={22} color="#1B8A52" />
                )}
              </View>
              <Text style={styles.portalName}>{p.name}</Text>
              <Text style={styles.portalUrdu}>{p.urdu}</Text>
              <View style={styles.tagChip}>
                <Text style={styles.tagText}>{p.tag}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom nav lifted above the phone's gesture/back-button area */}
      <View style={{ paddingBottom: insets.bottom + 10, backgroundColor: "#fff" }}>
        <BottomNav active="home" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  topBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 18, paddingBottom: 14,
  },
  welcome: { fontSize: 11, letterSpacing: 1.5, color: "#94A19A", fontWeight: "600" },
  name: { fontSize: 19, fontWeight: "800", color: "#18241F", marginTop: 1 },
  nameUrdu: { fontSize: 13, color: "#1B8A52", marginTop: 6 },
  avatar: {
    width: 42, height: 42, borderRadius: 13, backgroundColor: "#F2FAF5",
    alignItems: "center", justifyContent: "center",
  },
  dot: {
    position: "absolute", top: -3, right: -3, width: 10, height: 10,
    borderRadius: 5, backgroundColor: "#1B8A52", borderWidth: 2, borderColor: "#fff",
  },
  ticker: {
    backgroundColor: "#F2FAF5", paddingVertical: 7,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#DFF2E6",
    overflow: "hidden",
  },
  tickerText: { fontSize: 10, letterSpacing: 1.2, color: "#146C43", fontWeight: "700" },
  statsRow: { flexDirection: "row", backgroundColor: "#E3E8E5", gap: 1, marginTop: 1 },
  stat: { flex: 1, backgroundColor: "#fff", paddingVertical: 12, alignItems: "center" },
  statV: { fontSize: 18, fontWeight: "800", color: "#1B8A52" },
  statL: { fontSize: 9, color: "#94A19A", fontWeight: "600", textTransform: "uppercase", marginTop: 2 },
  sectionHead: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10 },
  sectionLabel: { fontSize: 11, letterSpacing: 1.5, color: "#1B8A52", fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#18241F", marginTop: 8 },
  sectionTitleUrdu: { fontSize: 14, fontWeight: "700", color: "#1B8A52" },
  saathiCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#F2FAF5", borderWidth: 1, borderColor: "#DFF2E6",
    borderRadius: 16, padding: 14, marginHorizontal: 16, marginBottom: 4,
  },
  iconChip: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: "#F2FAF5",
    alignItems: "center", justifyContent: "center",
  },
  saathiTitle: { fontSize: 14, fontWeight: "700", color: "#18241F" },
  saathiSub: { fontSize: 11, color: "#5C6962", marginTop: 2, lineHeight: 16 },
  grid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10,
    paddingHorizontal: 16, marginTop: 6,
  },
  portalCard: {
    width: "47.8%", backgroundColor: "#fff", borderWidth: 1, borderColor: "#E3E8E5",
    borderRadius: 16, padding: 14,
  },
  portalName: { fontSize: 14, fontWeight: "700", color: "#18241F", marginTop: 8 },
  portalUrdu: { fontSize: 11, color: "#94A19A" },
  tagChip: {
    alignSelf: "flex-start", backgroundColor: "#EEF2EF",
    borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10, marginTop: 8,
  },
  tagText: { fontSize: 11, fontWeight: "700", color: "#5C6962" },
});