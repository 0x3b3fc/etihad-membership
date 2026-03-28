import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { Colors, Spacing, FontSize } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  color: string;
  onPress: () => void;
}

export default function MoreScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد من تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "خروج",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    { icon: "location-outline", label: "المحافظات", sub: "إدارة المحافظات", color: Colors.blue, onPress: () => router.push("/governorates") },
    { icon: "business-outline", label: "الوحدات", sub: "إدارة الوحدات", color: Colors.purple, onPress: () => router.push("/units") },
    { icon: "shield-checkmark-outline", label: "المسؤولين", sub: "إدارة مسؤولي النظام", color: Colors.success, onPress: () => router.push("/admins") },
    { icon: "settings-outline", label: "الإعدادات", sub: "إعدادات المنصة", color: Colors.textSecondary, onPress: () => router.push("/settings") },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.userAvatar}>
          <Text style={styles.userInitial}>{user?.name?.charAt(0) || "م"}</Text>
        </View>
        <View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: item.color + "15" }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-back" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>

      <Text style={styles.version}>عضويتي - اتحاد بشبابها v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  userCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", margin: Spacing.md, borderRadius: 12, padding: Spacing.lg, gap: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  userAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  userInitial: { color: "#fff", fontSize: FontSize.lg, fontWeight: "bold" },
  userName: { fontSize: FontSize.md, fontWeight: "bold", color: Colors.text },
  userEmail: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  menuSection: { backgroundColor: "#fff", marginHorizontal: Spacing.md, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: Spacing.lg, gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { width: 36, height: 36, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  menuLabel: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text },
  menuSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, marginHorizontal: Spacing.md, marginTop: Spacing.xl, backgroundColor: Colors.dangerLight, padding: Spacing.lg, borderRadius: 12 },
  logoutText: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.danger },
  version: { textAlign: "center", fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.xl, marginBottom: 40 },
});
