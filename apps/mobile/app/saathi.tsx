import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

export default function Saathi() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState("UR");

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1B8A52" />
        </TouchableOpacity>
        <View style={styles.iconChipSm}>
          <MaterialCommunityIcons name="robot-outline" size={18} color="#1B8A52" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.hTitle}>PNP Saathi  پی این پی ساتھی</Text>
          <View style={styles.onlineRow}>
            <View style={styles.greenDot} />
            <Text style={styles.online}>Online · AI Powered</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setLang("UR")} style={[styles.langChip, lang === "UR" && styles.langOn]}>
          <Text style={[styles.langText, lang === "UR" && styles.langTextOn]}>UR</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLang("EN")} style={[styles.langChip, lang === "EN" && styles.langOn]}>
          <Text style={[styles.langText, lang === "EN" && styles.langTextOn]}>EN</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.aiBar}>
        <View style={styles.greenDot} />
        <Text style={styles.aiBarText}>Claude AI · Multilingual support</Text>
      </View>

      <View style={styles.chipsRow}>
        <View style={styles.chip}><Text style={styles.chipText}>فصل کی قیمت</Text></View>
        <View style={styles.chip}><Text style={styles.chipText}>FIR کیسے کریں</Text></View>
        <View style={styles.chip}><Text style={styles.chipText}>Jobs near me</Text></View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.chatBody}>
        <View style={styles.botRow}>
          <View style={styles.iconChipSm}>
            <MaterialCommunityIcons name="robot-outline" size={16} color="#1B8A52" />
          </View>
          <View style={styles.botBubble}>
            <Text style={styles.urduMsg}>السلام علیکم! میں PNP Saathi ہوں۔ نوکری، فصل، شکایت، قانون — جو بھی سوال ہو پوچھیں!</Text>
          </View>
        </View>

        <View style={styles.botRow}>
          <View style={styles.iconChipSm}>
            <MaterialCommunityIcons name="robot-outline" size={16} color="#1B8A52" />
          </View>
          <View style={styles.botBubble}>
            <Text style={styles.enMsg}>I speak Urdu, English, Punjabi, Sindhi, Pashto & Balochi. Ask me anything about jobs, rights, farming, or scholarships.</Text>
          </View>
        </View>

        <View style={styles.userRow}>
          <View style={styles.userBubble}>
            <Text style={styles.urduUser}>میری فصل کی قیمت کم ہے، کیا کروں؟</Text>
          </View>
        </View>

        <View style={styles.botRow}>
          <View style={styles.iconChipSm}>
            <MaterialCommunityIcons name="robot-outline" size={16} color="#1B8A52" />
          </View>
          <View style={styles.botBubble}>
            <Text style={styles.urduMsg}>آج گندم کی قیمت فیصل آباد منڈی میں 3,800 روپے فی من ہے۔ ① اگلے 2 ہفتے انتظار کریں ② براہ راست خریدار سے رابطہ کریں ③ Kisaan Portal پر پیش گوئی دیکھیں</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.micChip}>
          <Ionicons name="mic-outline" size={18} color="#5C6962" />
        </View>
        <TextInput
          style={styles.chatInput}
          placeholder="Urdu / English میں لکھیں..."
          placeholderTextColor="#94A19A"
        />
        <TouchableOpacity style={styles.sendBtn}>
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: "#E3E8E5",
  },
  iconChipSm: {
    width: 32, height: 32, borderRadius: 9, backgroundColor: "#F2FAF5",
    alignItems: "center", justifyContent: "center",
  },
  hTitle: { fontSize: 13, fontWeight: "700", color: "#18241F" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#1B8A52" },
  online: { fontSize: 10, color: "#1B8A52", fontWeight: "600" },
  langChip: {
    backgroundColor: "#EEF2EF", borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8,
  },
  langOn: { backgroundColor: "#1B8A52" },
  langText: { fontSize: 11, fontWeight: "700", color: "#5C6962" },
  langTextOn: { color: "#fff" },
  aiBar: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#F2FAF5", paddingVertical: 7, paddingHorizontal: 16,
  },
  aiBarText: { fontSize: 10, color: "#146C43", fontWeight: "600" },
  chipsRow: {
    flexDirection: "row", gap: 8, flexWrap: "wrap",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#E3E8E5",
  },
  chip: { backgroundColor: "#EEF2EF", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  chipText: { fontSize: 14, color: "#5C6962" },
  chatBody: { padding: 16, gap: 12 },
  botRow: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  botBubble: {
    maxWidth: "78%", backgroundColor: "#F7F9F8", borderWidth: 1, borderColor: "#E3E8E5",
    borderRadius: 14, borderBottomLeftRadius: 4, padding: 11,
  },
  urduMsg: { fontSize: 14, lineHeight: 26, color: "#18241F", textAlign: "right", writingDirection: "rtl" },
  enMsg: { fontSize: 13, lineHeight: 20, color: "#18241F" },
  userRow: { flexDirection: "row", justifyContent: "flex-end" },
  userBubble: {
    maxWidth: "78%", backgroundColor: "#1B8A52",
    borderRadius: 14, borderBottomRightRadius: 4, padding: 11,
  },
  urduUser: { fontSize: 14, lineHeight: 26, color: "#fff", textAlign: "right", writingDirection: "rtl" },
  inputBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: "#E3E8E5",
  },
  micChip: {
    width: 36, height: 36, borderRadius: 11, backgroundColor: "#EEF2EF",
    alignItems: "center", justifyContent: "center",
  },
  chatInput: {
    flex: 1, backgroundColor: "#F7F9F8", borderWidth: 1, borderColor: "#E3E8E5",
    borderRadius: 20, paddingVertical: 9, paddingHorizontal: 14, fontSize: 13,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 11, backgroundColor: "#1B8A52",
    alignItems: "center", justifyContent: "center",
  },
});