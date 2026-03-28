import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../src/api/client";
import { Member, Pagination } from "../../src/types";
import { Colors, Spacing, FontSize } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function MembersScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchMembers = useCallback(async (page = 1, append = false) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);

      const res = await api<{ success: boolean; data: Member[]; pagination: Pagination }>(
        `/api/admin/members?${params}`
      );

      if (res.success) {
        setMembers(append ? [...members, ...res.data] : res.data);
        setPagination(res.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [search]);

  useEffect(() => {
    setIsLoading(true);
    fetchMembers(1);
  }, [search]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMembers(1);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (pagination.page < pagination.totalPages && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchMembers(pagination.page + 1, true);
    }
  };

  const renderMember = ({ item }: { item: Member }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/members/${item.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.profileImage }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.fullNameAr}</Text>
        <Text style={styles.sub}>{item.fullNameEn}</Text>
        <View style={styles.badges}>
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>{item.memberNumber}</Text>
          </View>
          <View style={[styles.typeBadge, item.memberType === "student" ? styles.studentBadge : styles.graduateBadge]}>
            <Text style={[styles.typeBadgeText, item.memberType === "student" ? styles.studentText : styles.graduateText]}>
              {item.memberType === "student" ? "طالب" : "خريج"}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-back" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="بحث بالاسم أو الرقم القومي..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>عرض {members.length} من {pagination.total} عضو</Text>
      </View>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={isLoadingMore ? <ActivityIndicator color={Colors.primary} style={{ padding: 16 }} /> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>لا يوجد أعضاء</Text>
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
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: Spacing.md, marginTop: Spacing.md, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: FontSize.sm, textAlign: "right" },
  statsRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  statsText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: Spacing.md, marginTop: Spacing.sm, borderRadius: 10, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.border },
  name: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text },
  sub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  badges: { flexDirection: "row", gap: 6, marginTop: 4 },
  memberBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  memberBadgeText: { fontSize: 10, fontWeight: "600", color: Colors.primary },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  studentBadge: { backgroundColor: Colors.blueLight },
  graduateBadge: { backgroundColor: Colors.purpleLight },
  typeBadgeText: { fontSize: 10, fontWeight: "600" },
  studentText: { color: Colors.blue },
  graduateText: { color: Colors.purple },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.md },
});
