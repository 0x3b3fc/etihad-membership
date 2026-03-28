import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../src/api/client";
import { Application, Pagination } from "../../src/types";
import { Colors, Spacing, FontSize } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

const FILTERS = [
  { key: "ALL", label: "الكل" },
  { key: "PENDING", label: "قيد المراجعة" },
  { key: "ACCEPTED", label: "مقبول" },
  { key: "REJECTED", label: "مرفوض" },
];

export default function ApplicationsScreen() {
  const [apps, setApps] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filter, setFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchApps = useCallback(async (page = 1) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filter !== "ALL") params.set("status", filter);

      const res = await api<{ success: boolean; data: Application[]; pagination: Pagination }>(
        `/api/admin/applications?${params}`
      );
      if (res.success) {
        setApps(res.data);
        setPagination(res.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setIsLoading(true);
    fetchApps(1);
  }, [filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApps(1);
    setRefreshing(false);
  };

  const getStatusStyle = (status: string) => {
    if (status === "PENDING") return { bg: Colors.warningLight, text: Colors.warning, label: "قيد المراجعة" };
    if (status === "ACCEPTED") return { bg: Colors.successLight, text: Colors.success, label: "مقبول" };
    return { bg: Colors.dangerLight, text: Colors.danger, label: "مرفوض" };
  };

  const renderApp = ({ item }: { item: Application }) => {
    const st = getStatusStyle(item.status);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/applications/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.sub}>{item.governorate.name} · {new Date(item.submittedAt).toLocaleDateString("ar-EG")}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: st.bg }]}>
          <Text style={[styles.badgeText, { color: st.text }]}>{st.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Chips */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={apps}
          renderItem={renderApp}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>لا توجد طلبات</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filters: { flexDirection: "row", paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.sm },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.xs, fontWeight: "600", color: Colors.textSecondary },
  chipTextActive: { color: "#fff" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: Spacing.md, marginTop: Spacing.sm, borderRadius: 10, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  name: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text },
  sub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.md },
});
