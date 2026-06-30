import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StatusBar, StyleSheet, Text, View } from "react-native";

export default function Splash() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => router.replace("/login"), 2500);
    return () => clearTimeout(timer);
  }, []);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <LinearGradient colors={["#16804A", "#0E5A33"]} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Crescent moon + single star tucked into the opening */}
      <View style={styles.moonWrap}>
        <MaterialCommunityIcons
          name="moon-waning-crescent"
          size={104}
          color="rgba(255,255,255,0.16)"
        />
        <MaterialCommunityIcons
          name="star-four-points"
          size={26}
          color="rgba(255,255,255,0.16)"
          style={styles.star}
        />
      </View>

      <View style={styles.center}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>PNP</Text>
        </View>
        <Text style={styles.title}>PNP</Text>
        <Text style={styles.urdu}>پاکستان نوجوان پارٹی</Text>
        <Text style={styles.subtitle}>PAKISTAN · NAUJAWAN · PARTY</Text>
      </View>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth }]} />
      </View>
      <Text style={styles.version}>v1.0 · Beta</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  moonWrap: {
    position: "absolute", top: "15%",
    alignItems: "center", justifyContent: "center",
  },
  star: {
    position: "absolute", top: 22, right: 24,
  },
  center: { alignItems: "center", gap: 14, marginBottom: 36 },
  logoBox: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center", justifyContent: "center",
  },
  logoText: { fontSize: 22, fontWeight: "800", color: "#fff", letterSpacing: 1 },
  title: { fontSize: 34, fontWeight: "800", color: "#fff", letterSpacing: 1 },
  urdu: { fontSize: 24, color: "rgba(255,255,255,0.9)", lineHeight: 38 },
  subtitle: {
    fontSize: 11, letterSpacing: 2.5, fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
  },
  barTrack: {
    width: 140, height: 4, borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: "#fff" },
  version: {
    fontSize: 11, color: "rgba(255,255,255,0.6)",
    marginTop: 12, letterSpacing: 1,
  },
});