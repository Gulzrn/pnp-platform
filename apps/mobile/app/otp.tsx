import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from "react-native";

export default function Otp() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const displayEmail = params.email || "you@example.com";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(TextInput | null)[]>([]);
  const [seconds, setSeconds] = useState(45);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const handleChange = (text: string, index: number) => {
    const next = [...code];
    next[index] = text;
    setCode(next);
    if (text && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={["#16804A", "#0E5A33"]} style={styles.header}>
        <View style={styles.iconBox}>
          <Text style={{ fontSize: 24 }}>✉️</Text>
        </View>
        <Text style={styles.headerTitle}>Verify OTP</Text>
        <Text style={styles.headerUrdu}>کوڈ تصدیق کریں</Text>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Email sent to <Text style={{ fontWeight: "700" }}>{displayEmail}</Text>
          </Text>
          <Text style={styles.infoUrdu}>ای میل بھیج دی گئی</Text>
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>Enter 6-digit code</Text>
          <Text style={styles.labelUrdu}>کوڈ درج کریں</Text>
        </View>

        <View style={styles.otpRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              style={[styles.otpBox, digit ? styles.otpBoxActive : null]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push("/home")}
        >
          <Text style={styles.btnPrimaryText}>Verify  →</Text>
        </TouchableOpacity>

        <Text style={styles.resend}>
          Didn't get code?{" "}
          {seconds > 0 ? (
            <Text style={styles.resendLink}>Resend ({seconds}s)</Text>
          ) : (
            <Text style={styles.resendLink} onPress={() => setSeconds(45)}>Resend</Text>
          )}
        </Text>

        <View style={styles.privacyCard}>
          <Text style={styles.privacyText}>
            🔒  Your email stays private. We never share your data.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 72, paddingBottom: 72, paddingHorizontal: 24,
    alignItems: "center", gap: 18,
  },
  iconBox: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#fff", marginTop: 4 },
  headerUrdu: { fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  body: { padding: 22, gap: 18 },
  infoCard: {
    backgroundColor: "#F2FAF5", borderWidth: 1, borderColor: "#DFF2E6",
    borderRadius: 16, padding: 14,
  },
  infoText: { fontSize: 12, color: "#3E4B45", lineHeight: 20 },
  infoUrdu: { fontSize: 13, color: "#5C6962", marginTop: 2 },
  labelRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  label: { fontSize: 12, fontWeight: "600", color: "#3E4B45" },
  labelUrdu: { fontSize: 13, color: "#94A19A" },
  otpRow: { flexDirection: "row", justifyContent: "space-between" },
  otpBox: {
    width: 46, height: 54, backgroundColor: "#F7F9F8",
    borderWidth: 1.5, borderColor: "#E3E8E5", borderRadius: 12,
    textAlign: "center", fontSize: 20, fontWeight: "700", color: "#0E5A33",
  },
  otpBoxActive: { backgroundColor: "#F2FAF5", borderColor: "#16804A" },
  btnPrimary: {
    backgroundColor: "#16804A", borderRadius: 14, paddingVertical: 14,
    alignItems: "center",
  },
  btnPrimaryText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  resend: { textAlign: "center", fontSize: 12, color: "#5C6962" },
  resendLink: { color: "#16804A", fontWeight: "700" },
  privacyCard: {
    backgroundColor: "#F7F9F8", borderWidth: 1, borderColor: "#E3E8E5",
    borderRadius: 14, padding: 14,
  },
  privacyText: { fontSize: 12, color: "#5C6962", lineHeight: 18 },
});