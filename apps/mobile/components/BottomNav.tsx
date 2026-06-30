import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TABS = [
  { key: "home", label: "Home", route: "/home", lib: "ion", icon: "home-outline" },
  { key: "problems", label: "Problems", route: "/problems", lib: "ion", icon: "map-outline" },
  { key: "saathi", label: "Saathi", route: "/saathi", lib: "mci", icon: "robot-outline" },
  { key: "rozgar", label: "Rozgar", icon: "briefcase-outline", route: "/rozgar" },
  { key: "profile", label: "Profile", route: "/home", lib: "ion", icon: "person-outline" },
];

export default function BottomNav({ active }: { active: string }) {
  const router = useRouter();
  return (
    <View style={styles.nav}>
      {TABS.map((t) => {
        const on = t.key === active;
        const color = on ? "#1B8A52" : "#94A19A";
        return (
          <TouchableOpacity
            key={t.key}
            style={styles.item}
            onPress={() => router.push(t.route as any)}
          >
            {t.lib === "mci" ? (
              <MaterialCommunityIcons name={t.icon as any} size={22} color={color} />
            ) : (
              <Ionicons name={t.icon as any} size={22} color={color} />
            )}
            <Text style={[styles.label, { color }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row", backgroundColor: "#fff",
    borderTopWidth: 1, borderTopColor: "#E3E8E5",
    paddingTop: 8, paddingBottom: 10,
  },
  item: { flex: 1, alignItems: "center", gap: 3 },
  label: { fontSize: 10, fontWeight: "600" },
});