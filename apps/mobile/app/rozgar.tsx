import { Ionicons } from "@expo/vector-icons";
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

const FILTERS = ["All", "Govt", "Private", "Freelance", "Scholarship"];

const JOBS = [
  { category: "Govt", org: "FPSC · Federal Public Service", role: "CSS Officer (BS-17)", tag: "GOVT", tagColor: "green",
    meta: "📍 Islamabad    💰 Rs. 80K+    📅 Dec 31", match: 78 },
  { category: "Private", org: "Arbisoft · Tech Company", role: "React Developer", tag: "REMOTE", tagColor: "gray",
    meta: "🌐 Remote    💰 $800–1200    📅 Jan 15", match: 92 },
  { category: "Freelance", org: "Upwork · Client Project", role: "Flutter App Developer", tag: "FREELANCE", tagColor: "gray",
    meta: "🌐 Remote    💰 $25/hr    📅 Ongoing", match: 88 },
  { category: "Scholarship", org: "HEC Pakistan", role: "Overseas Scholarship 2025", tag: "SCHOLAR", tagColor: "amber",
    meta: "🌍 UK · US · China    💰 Full Funded", match: null },
];

export default function Rozgar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("All");

  const visibleJobs =
    filter === "All" ? JOBS : JOBS.filter((j) => j.category === filter);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <LinearGradient
        colors={["#16804A", "#0E5A33"]}
        style={{ paddingTop: insets.top + 24, paddingHorizontal: 18, paddingBottom: 30 }}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={16} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.hIcon}>
            <Ionicons name="briefcase-outline" size={18} color="#fff" />
          </View>
        </View>
        <Text style={styles.hTitle}>Rozgar</Text>
        <Text style={styles.hUrdu}>روزگار پورٹل · Jobs for Youth</Text>
        <Text style={styles.hDesc}>Government · Private · Freelance · Scholarships</Text>
      </LinearGradient>

      <ScrollView>
        <TouchableOpacity style={styles.cvCard}>
          <View style={styles.iconChip}>
            <Ionicons name="document-text-outline" size={24} color="#16804A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cvTitle}>AI CV Analyzer</Text>
            <Text style={styles.cvSub}>Upload CV → AI scores + Urdu feedback</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#16804A" />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={{ gap: 7, paddingHorizontal: 16 }}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.pill, filter === f && styles.pillOn]}
            >
              <Text style={[styles.pillText, filter === f && styles.pillTextOn]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 10 }}>
          {visibleJobs.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No {filter.toLowerCase()} jobs available.</Text>
            </View>
          ) : (
            visibleJobs.map((j) => (
              <View key={j.role} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.org}>{j.org}</Text>
                    <View style={styles.verifiedRow}>
                      <Ionicons name="checkmark-circle" size={11} color="#16804A" />
                      <Text style={styles.verified}>Verified</Text>
                    </View>
                  </View>
                  <View style={[styles.tag, tagStyle(j.tagColor)]}>
                    <Text style={[styles.tagText, tagTextStyle(j.tagColor)]}>{j.tag}</Text>
                  </View>
                </View>
                <Text style={styles.role}>{j.role}</Text>
                <Text style={styles.meta}>{j.meta}</Text>
                {j.match !== null && (
                  <View style={styles.matchRow}>
                    <Text style={styles.matchLabel}>AI Match</Text>
                    <View style={styles.matchTrack}>
                      <View style={[styles.matchFill, { width: `${j.match}%` }]} />
                    </View>
                    <Text style={styles.matchPct}>{j.match}%</Text>
                  </View>
                )}
              </View>
            ))
          )}
          <View style={{ height: 12 }} />
        </View>
      </ScrollView>

      {/* Bottom nav lifted above the phone's gesture/back-button area */}
      <View style={{ paddingBottom: insets.bottom + 10, backgroundColor: "#fff" }}>
        <BottomNav active="rozgar" />
      </View>
    </View>
  );
}

function tagStyle(c: string) {
  if (c === "green") return { backgroundColor: "#DFF2E6" };
  if (c === "amber") return { backgroundColor: "#FAF1DD" };
  return { backgroundColor: "#EEF2EF" };
}
function tagTextStyle(c: string) {
  if (c === "green") return { color: "#146C43" };
  if (c === "amber") return { color: "#B9852A" };
  return { color: "#5C6962" };
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
  hTitle: { fontSize: 21, fontWeight: "800", color: "#fff", marginTop: 14 },
  hUrdu: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 8 },
  hDesc: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 6 },
  cvCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#F2FAF5", borderWidth: 1, borderColor: "#DFF2E6",
    borderRadius: 18, padding: 20, margin: 16,
  },
  iconChip: {
    width: 46, height: 46, borderRadius: 13, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  cvTitle: { fontSize: 15, fontWeight: "700", color: "#18241F" },
  cvSub: { fontSize: 12, color: "#5C6962", marginTop: 3 },
  filterRow: { borderTopWidth: 1, borderTopColor: "#E3E8E5", paddingVertical: 12 },
  pill: {
    borderWidth: 1.5, borderColor: "#E3E8E5", borderRadius: 20,
    paddingVertical: 7, paddingHorizontal: 14,
  },
  pillOn: { backgroundColor: "#16804A", borderColor: "#16804A" },
  pillText: { fontSize: 12, fontWeight: "600", color: "#5C6962" },
  pillTextOn: { color: "#fff" },
  card: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E3E8E5",
    borderRadius: 16, padding: 14,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  org: { fontSize: 11, color: "#5C6962", fontWeight: "600" },
  verifiedRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 1 },
  verified: { fontSize: 10, color: "#16804A" },
  tag: { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  tagText: { fontSize: 11, fontWeight: "700" },
  role: { fontSize: 15, fontWeight: "700", color: "#18241F", marginBottom: 6 },
  meta: { fontSize: 11, color: "#5C6962", marginBottom: 10 },
  matchRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: "#E3E8E5",
  },
  matchLabel: { fontSize: 10, color: "#94A19A", fontWeight: "600" },
  matchTrack: { flex: 1, height: 5, backgroundColor: "#EEF2EF", borderRadius: 3, overflow: "hidden" },
  matchFill: { height: "100%", backgroundColor: "#16804A" },
  matchPct: { fontSize: 11, color: "#16804A", fontWeight: "700" },
  emptyBox: { paddingVertical: 40, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 13, color: "#94A19A", fontWeight: "600" },
});