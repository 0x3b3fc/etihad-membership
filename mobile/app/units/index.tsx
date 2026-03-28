import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { api } from "../../src/api/client";
import { Unit } from "../../src/types";
import { Colors, Spacing, FontSize } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function UnitsScreen() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch_ = useCallback(async () => {
    try {
      const res = await api<{ success: boolean; data: Unit[] }>("/api/admin/units");
      if (res.success) setUnits(res.data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const onRefresh = async () => { setRefreshing(true); await fetch_(); setRefreshing(false); };

  const toggleActive = async (unit: Unit) => {
    try {
      await api(`/api/admin/units/${unit.id}`, { method: "PUT", body: JSON.stringify({ toggleActive: true }) });
      fetch_();
    } catch (e) { Alert.alert("خطأ", e instanceof Error ? e.message : "فشل"); }
  };

  const deleteUnit = (unit: Unit) => {
    Alert.alert("حذف الوحدة", `هل أنت متأكد من حذف "${unit.name}"؟`, [
      { text: "إلغاء", style: "cancel" },
      { text: "حذف", style: "destructive", onPress: async () => {
        try {
          await api(`/api/admin/units/${unit.id}`, { method: "DELETE" });
          fetch_();
        } catch (e) { Alert.alert("خطأ", e instanceof Error ? e.message : "فشل الحذف"); }
      }},
    ]);
  };

  const renderItem = ({ item }: { item: Unit }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>{item.governorate?.name || "-"} · {item._count.users} عضو</Text>
        <View style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={[styles.statusText, item.isActive ? styles.activeText : styles.inactiveText]}>
            {item.isActive ? "نشط" : "غير نشط"}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => toggleActive(item)}>
          <Ionicons name={item.isActive ? "pause-circle-outline" : "play-circle-outline"} size={22} color={item.isActive ? Colors.warning : Colors.success} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => deleteUnit(item)}>
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: "الوحدات", headerStyle: { backgroundColor: Colors.primary }, headerTintColor: "#fff" }} />
      <View style={styles.container}>
        {isLoading ? <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} /> : (
          <FlatList
            data={units}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            contentContainerStyle={{ padding: Spacing.md, paddingBottom: 20 }}
            ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>لا توجد وحدات</Text></View>}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, padding: Spacing.lg, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  name: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text },
  sub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { marginTop: 4, alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  activeBadge: { backgroundColor: Colors.successLight },
  inactiveBadge: { backgroundColor: "#f3f4f6" },
  statusText: { fontSize: 10, fontWeight: "600" },
  activeText: { color: Colors.success },
  inactiveText: { color: Colors.textMuted },
  actions: { flexDirection: "row", gap: 4 },
  actionBtn: { padding: 8 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary },
});
