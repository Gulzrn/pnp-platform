import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={["#16804A", "#0E5A33"]} style={styles.header}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>PNP</Text>
        </View>
        <Text style={styles.headerTitle}>Login</Text>
        <View style={styles.urduRow}>
          <Text style={styles.headerUrdu}>خوش آمدید</Text>
          <Text style={styles.headerUrdu}> — Welcome Back</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={{ gap: 16 }}>
        <View>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.labelUrdu}>ای میل</Text>
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color="#5C6962" />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#94A19A"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push("/otp")}
        >
          <Text style={styles.btnPrimaryText}>Send OTP  →</Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>
          New member?{" "}
          <Text style={styles.registerLink} onPress={() => router.push("/register")}>
            Register here
          </Text>
        </Text>
        <Text style={styles.registerUrdu}>نیا ممبر؟ یہاں رجسٹر کریں</Text>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>PNP MEMBER BENEFITS</Text>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark" size={16} color="#16804A" style={styles.tick} />
            <Text style={styles.benefit}>All 12 portals access</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark" size={16} color="#16804A" style={styles.tick} />
            <Text style={styles.benefit}>AI Saathi chatbot</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark" size={16} color="#16804A" style={styles.tick} />
            <Text style={styles.benefit}>Submit ideas · Vote</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 72, paddingBottom: 72, paddingHorizontal: 24,
    alignItems: "center", gap: 18,
  },
  logoBox: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center", justifyContent: "center",
  },
  logoText: { fontSize: 18, fontWeight: "800", color: "#fff" },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#fff", marginTop: 4 },
  urduRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  headerUrdu: { fontSize: 14, color: "rgba(255,255,255,0.85)" },
  body: { backgroundColor: "#fff", paddingHorizontal: 22, paddingTop: 22 },
  labelRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 7,
  },
  label: { fontSize: 12, fontWeight: "600", color: "#3E4B45" },
  labelUrdu: { fontSize: 13, color: "#94A19A" },
  inputWrap: {
    backgroundColor: "#F7F9F8", borderWidth: 1.5, borderColor: "#E3E8E5",
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  input: { flex: 1, fontSize: 14, color: "#18241F" },
  btnPrimary: {
    backgroundColor: "#16804A", borderRadius: 14, paddingVertical: 14,
    alignItems: "center",
  },
  btnPrimaryText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  registerText: { textAlign: "center", fontSize: 12, color: "#5C6962" },
  registerLink: { color: "#16804A", fontWeight: "700" },
  registerUrdu: { textAlign: "center", fontSize: 13, color: "#5C6962" },
  benefitsCard: {
    backgroundColor: "#F2FAF5", borderWidth: 1, borderColor: "#DFF2E6",
    borderRadius: 16, padding: 14, marginBottom: 22,
  },
  benefitsTitle: {
    fontSize: 11, letterSpacing: 1, fontWeight: "700",
    color: "#0E5A33", marginBottom: 8,
  },
  benefitRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  tick: { fontWeight: "900", marginRight: 8 },
  benefit: { fontSize: 12, color: "#5C6962" },
});