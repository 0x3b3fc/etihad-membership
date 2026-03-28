import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { api } from "../../src/api/client";
import { AdminUser } from "../../src/types";
import { Colors, Spacing, FontSize } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function AdminsScreen() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch_ = useCallback(async () => {
    try {
      const res = await api<{ success: boolean; data: AdminUser[] }>("/api/admin/users");
      if (res.success) setAdmins(res.data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);
  const onRefresh = async () => { setRefreshing(true); await fetch_(); setRefreshing(false); };

  const deleteAdmin = (admin: AdminUser) => {
    if (admins.length <= 1) {
      Alert.alert("خطأ", "لا يمكن حذف المسؤول الوحيد");
      return;
    }
    Alert.alert("حذف المسؤول", `هل أنت متأكد من حذف "${admin.name}"؟`, [
      { text: "إلغاء", style: "cancel" },
      { text: "حذف", style: "destructive", onPress: async () => {
        try {
          await api(`/api/admin/users/${admin.id}`, { method: "DELETE" });
          fetch_();
        } catch (e) { Alert.alert("خطأ", e instanceof Error ? e.message : "فشل"); }
      }},
    ]);
  };

  const renderItem = ({ item }: { item: AdminUser }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}
        </Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteAdmin(item)} disabled={admins.length <= 1}>
        <Ionicons name="trash-outline" size={18} color={admins.length <= 1 ? Colors.textMuted : Colors.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: "المسؤولين", headerStyle: { backgroundColor: Colors.primary }, headerTintColor: "#fff" }} />
      <View style={styles.container}>
        {isLoading ? <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} /> : (
          <FlatList
            data={admins}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            contentContainerStyle={{ padding: Spacing.md, paddingBottom: 20 }}
            ListFooterComponent={<Text style={styles.footer}>إجمالي المسؤولين: {admins.length}</Text>}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, padding: Spacing.lg, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: FontSize.md },
  name: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text },
  email: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  date: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  deleteBtn: { padding: 8 },
  footer: { textAlign: "center", fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing.md },
});
