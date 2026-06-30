import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text, TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";

const FILTERS = [
  { label: "All", lib: "ion", icon: null },
  { label: "Water", lib: "ion", icon: "water-outline" },
  { label: "Electric", lib: "ion", icon: "flash-outline" },
  { label: "Hospital", lib: "mci", icon: "hospital-box-outline" },
];

const REPORTS = [
  {
    id: 1,
    category: "Water",
    chip: "💧 Water",
    severity: "CRITICAL",
    accent: "#D34F4F",
    lang: "ur",
    text: "\"ہمارے محلے میں 5 دن سے پانی نہیں آ رہا\"",
    ai: "AI: Formal complaint generated → WASA routed",
    loc: "📍 Karachi, Lyari   ⏱ 2h ago",
    votes: "↑ 247",
  },
  {
    id: 2,
    category: "Hospital",
    chip: "🏥 Hospital",
    severity: "HIGH",
    accent: "#B9852A",
    lang: "en",
    text: "BHU Rahim Yar Khan has no doctor for 3 weeks. Patients being turned away.",
    ai: null,
    loc: "📍 RYK, Punjab   ⏱ 5h ago",
    votes: "↑ 89",
  },
  {
    id: 3,
    category: "Electric",
    chip: "⚡ Electric",
    severity: "HIGH",
    accent: "#B9852A",
    lang: "en",
    text: "12-hour load shedding in Quetta for the past week. No schedule announced.",
    ai: "AI: Complaint drafted → QESCO routed",
    loc: "📍 Quetta, Balochistan   ⏱ 8h ago",
    votes: "↑ 156",
  },
  {
    id: 4,
    category: "Water",
    chip: "💧 Water",
    severity: "HIGH",
    accent: "#B9852A",
    lang: "en",
    text: "Contaminated water supply reported in Multan sector. Several cases of illness.",
    ai: null,
    loc: "📍 Multan, Punjab   ⏱ 1d ago",
    votes: "↑ 64",
  },
];

function severityChipStyle(severity: string) {
  if (severity === "CRITICAL") return { box: styles.redChip, text: styles.redChipText };
  return { box: styles.amberChip, text: styles.amberChipText };
}

export default function Problems() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("All");

  const visibleReports =
    filter === "All" ? REPORTS : REPORTS.filter((r) => r.category === filter);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <LinearGradient
        colors={["#16804A", "#0E5A33"]}
        style={{ paddingTop: insets.top + 24, paddingHorizontal: 18, paddingBottom: 28 }}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={16} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.hIcon}>
            <Ionicons name="map-outline" size={18} color="#fff" />
          </View>
        </View>
        <Text style={styles.hTitle}>Problems Map</Text>
        <Text style={styles.hUrdu}>پاکستان مسائل نقشہ</Text>
      </LinearGradient>

      {/* Map placeholder */}
      <View style={styles.map}>
        <View style={styles.mapStats}>
          <View style={styles.mapStat}>
            <Text style={styles.mapStatV}>3.2K</Text>
            <Text style={styles.mapStatL}>REPORTS</Text>
          </View>
          <View style={styles.mapStat}>
            <Text style={styles.mapStatV}>127</Text>
            <Text style={styles.mapStatL}>RESOLVED</Text>
          </View>
        </View>
        <View style={[styles.pin, { backgroundColor: "#D34F4F", left: "33%", top: "38%" }]} />
        <View style={[styles.pin, { backgroundColor: "#B9852A", left: "54%", top: "24%" }]} />
        <View style={[styles.pin, { backgroundColor: "#16804A", left: "60%", top: "18%" }]} />
        <View style={[styles.pin, { backgroundColor: "#D34F4F", left: "46%", top: "30%" }]} />
        <View style={styles.legend}>
          <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: "#D34F4F" }]} /><Text style={styles.legendText}>Critical</Text></View>
          <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: "#B9852A" }]} /><Text style={styles.legendText}>High</Text></View>
          <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: "#16804A" }]} /><Text style={styles.legendText}>Medium</Text></View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ gap: 14, paddingHorizontal: 16 }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.label;
          return (
            <TouchableOpacity
              key={f.label}
              onPress={() => setFilter(f.label)}
              style={[styles.pill, active && styles.pillOn]}
            >
              {f.icon && (
                f.lib === "mci" ? (
                  <MaterialCommunityIcons
                    name={f.icon as any}
                    size={16}
                    color={active ? "#fff" : "#5C6962"}
                    style={styles.pillIcon}
                  />
                ) : (
                  <Ionicons
                    name={f.icon as any}
                    size={16}
                    color={active ? "#fff" : "#5C6962"}
                    style={styles.pillIcon}
                  />
                )
              )}
              <Text style={[styles.pillText, active && styles.pillTextOn]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
        {visibleReports.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No {filter.toLowerCase()} problems reported.</Text>
          </View>
        ) : (
          visibleReports.map((r) => {
            const sev = severityChipStyle(r.severity);
            return (
              <View key={r.id} style={[styles.card, { borderLeftWidth: 3, borderLeftColor: r.accent }]}>
                <View style={styles.cardHead}>
                  <View style={styles.grayChip}><Text style={styles.grayChipText}>{r.chip}</Text></View>
                  <View style={sev.box}><Text style={sev.text}>{r.severity}</Text></View>
                </View>
                <Text style={r.lang === "ur" ? styles.urduReport : styles.enReport}>{r.text}</Text>
                {r.ai && <Text style={styles.aiNote}>{r.ai}</Text>}
                <View style={styles.cardFoot}>
                  <Text style={styles.footText}>{r.loc}</Text>
                  <Text style={styles.votes}>{r.votes}</Text>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 64 }} />
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 96 }]}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Bottom nav moved down a bit */}
      <View style={{ paddingBottom: insets.bottom + 2, backgroundColor: "#fff" }}>
        <BottomNav active="problems" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  backRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  backText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  hIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  hTitle: { fontSize: 19, fontWeight: "800", color: "#fff", marginTop: 14 },
  hUrdu: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 8 },
  map: {
    height: 190, backgroundColor: "#F2FAF5",
    borderBottomWidth: 1, borderBottomColor: "#E3E8E5", position: "relative",
  },
  mapStats: { flexDirection: "row", gap: 6, position: "absolute", top: 10, left: 10 },
  mapStat: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E3E8E5",
    borderRadius: 8, paddingVertical: 5, paddingHorizontal: 9,
  },
  mapStatV: { fontSize: 14, fontWeight: "800", color: "#16804A" },
  mapStatL: { fontSize: 7, color: "#94A19A", fontWeight: "600" },
  pin: { position: "absolute", width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: "#fff" },
  legend: {
    position: "absolute", bottom: 8, right: 8, backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#E3E8E5", borderRadius: 8, padding: 6, gap: 3,
  },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 8, color: "#5C6962", fontWeight: "600" },
  filterRow: {
    flexGrow: 0, backgroundColor: "#fff", paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#E3E8E5",
  },
  pill: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderColor: "#E3E8E5", borderRadius: 20,
    paddingVertical: 12, paddingHorizontal: 18,
  },
  pillIcon: { marginRight: 6 },
  pillOn: { backgroundColor: "#16804A", borderColor: "#16804A" },
  pillText: { fontSize: 13, fontWeight: "600", color: "#5C6962" },
  pillTextOn: { color: "#fff" },
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E3E8E5", borderRadius: 16, padding: 18 },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  grayChip: { backgroundColor: "#EEF2EF", borderRadius: 8, paddingVertical: 5, paddingHorizontal: 12 },
  grayChipText: { fontSize: 11, fontWeight: "700", color: "#5C6962" },
  redChip: { backgroundColor: "#FBEAEA", borderRadius: 8, paddingVertical: 5, paddingHorizontal: 12 },
  redChipText: { fontSize: 11, fontWeight: "700", color: "#D34F4F" },
  amberChip: { backgroundColor: "#FAF1DD", borderRadius: 8, paddingVertical: 5, paddingHorizontal: 12 },
  amberChipText: { fontSize: 11, fontWeight: "700", color: "#B9852A" },
  urduReport: { fontSize: 14, lineHeight: 28, color: "#18241F", textAlign: "right", writingDirection: "rtl", marginBottom: 14 },
  enReport: { fontSize: 14, lineHeight: 22, color: "#18241F", marginBottom: 16 },
  aiNote: { fontSize: 11, color: "#16804A", fontWeight: "600", marginBottom: 16 },
  cardFoot: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 14, borderTopWidth: 1, borderTopColor: "#E3E8E5",
  },
  footText: { fontSize: 10, color: "#94A19A" },
  votes: { fontSize: 11, color: "#16804A", fontWeight: "700" },
  emptyBox: {
    paddingVertical: 40, alignItems: "center", justifyContent: "center",
  },
  emptyText: { fontSize: 13, color: "#94A19A", fontWeight: "600" },
  fab: {
    position: "absolute", right: 16, width: 46, height: 46, borderRadius: 14,
    backgroundColor: "#16804A", alignItems: "center", justifyContent: "center",
    shadowColor: "#16804A", shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});