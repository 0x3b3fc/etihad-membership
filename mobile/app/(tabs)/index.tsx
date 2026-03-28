import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../src/api/client";
import { DashboardStats } from "../../src/types";
import { Colors, Spacing, FontSize } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ success: boolean; data: DashboardStats }>("/api/admin/dashboard");
      if (res.success) setStats(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const statCards = stats ? [
    { label: "إجمالي الأعضاء", value: stats.totalMembers, icon: "people", color: Colors.blue, bg: Colors.blueLight },
    { label: "إجمالي الطلبات", value: stats.totalApplications, icon: "document-text", color: Colors.purple, bg: Colors.purpleLight },
    { label: "قيد المراجعة", value: stats.pendingApplications, icon: "time", color: Colors.warning, bg: Colors.warningLight },
    { label: "مقبول", value: stats.acceptedApplications, icon: "checkmark-circle", color: Colors.success, bg: Colors.successLight },
    { label: "مرفوض", value: stats.rejectedApplications, icon: "close-circle", color: Colors.danger, bg: Colors.dangerLight },
    { label: "المحافظات", value: stats.totalGovernorates, icon: "location", color: Colors.primary, bg: Colors.primaryLight },
    { label: "الوحدات", value: stats.totalUnits, icon: "business", color: Colors.warning, bg: Colors.warningLight },
  ] : [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statCards.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
              <Ionicons name={s.icon as keyof typeof Ionicons.glyphMap} size={20} color={s.color} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Latest Applications */}
      {stats?.latestApplications && stats.latestApplications.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>آخر الطلبات</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/applications")}>
              <Text style={styles.sectionLink}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          {stats.latestApplications.map((app) => (
            <TouchableOpacity
              key={app.id}
              style={styles.appRow}
              onPress={() => router.push(`/applications/${app.id}`)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.appName}>{app.fullName}</Text>
                <Text style={styles.appSub}>{app.governorate.name} · {new Date(app.submittedAt).toLocaleDateString("ar-EG")}</Text>
              </View>
              <View style={[styles.badge, app.status === "PENDING" ? styles.badgeWarning : app.status === "ACCEPTED" ? styles.badgeSuccess : styles.badgeDanger]}>
                <Text style={[styles.badgeText, app.status === "PENDING" ? styles.badgeTextWarning : app.status === "ACCEPTED" ? styles.badgeTextSuccess : styles.badgeTextDanger]}>
                  {app.status === "PENDING" ? "قيد المراجعة" : app.status === "ACCEPTED" ? "مقبول" : "مرفوض"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: Spacing.md, gap: Spacing.md },
  statCard: { backgroundColor: "#fff", borderRadius: 12, padding: Spacing.lg, width: "47%", flexGrow: 1, borderWidth: 1, borderColor: Colors.border },
  statIcon: { width: 36, height: 36, borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: Spacing.sm },
  statValue: { fontSize: FontSize.xl, fontWeight: "bold", color: Colors.text },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  section: { backgroundColor: "#fff", borderRadius: 12, marginHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionTitle: { fontSize: FontSize.md, fontWeight: "bold", color: Colors.text },
  sectionLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: "600" },
  appRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  appName: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text },
  appSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeWarning: { backgroundColor: Colors.warningLight },
  badgeSuccess: { backgroundColor: Colors.successLight },
  badgeDanger: { backgroundColor: Colors.dangerLight },
  badgeText: { fontSize: 10, fontWeight: "600" },
  badgeTextWarning: { color: Colors.warning },
  badgeTextSuccess: { color: Colors.success },
  badgeTextDanger: { color: Colors.danger },
});
