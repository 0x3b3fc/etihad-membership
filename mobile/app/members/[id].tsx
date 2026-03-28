import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Alert, Linking } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { api } from "../../src/api/client";
import { Member } from "../../src/types";
import { Colors, Spacing, FontSize } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ success: boolean; data: Member }>(`/api/admin/members/${id}`);
        if (res.success) setMember(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = () => {
    Alert.alert("حذف العضو", "هل أنت متأكد من حذف هذا العضو؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/admin/members/${id}`, { method: "DELETE" });
            router.back();
          } catch (e) {
            Alert.alert("خطأ", e instanceof Error ? e.message : "فشل الحذف");
          }
        },
      },
    ]);
  };

  const handlePrint = (type: "print" | "print-card") => {
    const url = `${__DEV__ ? "http://192.168.1.100:3000" : "https://your-app.vercel.app"}/api/admin/members/${id}/${type}`;
    Linking.openURL(url);
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (!member) {
    return <View style={styles.center}><Text>العضو غير موجود</Text></View>;
  }

  const infoRows = [
    { label: "الرقم القومي", value: member.nationalId },
    { label: "المحافظة", value: member.governorate },
    { label: "العنوان", value: member.address },
    { label: "الموبايل (1)", value: member.phone1 },
    { label: "الموبايل (2)", value: member.phone2 },
    { label: "البريد", value: member.email },
    { label: "نوع العضو", value: member.memberType === "student" ? "طالب" : "خريج" },
    { label: "الوحدة/اللجنة", value: member.entityName },
    { label: "الصفة", value: member.role },
    { label: "الحالة الوظيفية", value: member.employmentStatus === "working" ? "يعمل" : "لا يعمل" },
    { label: "المسمى الوظيفي", value: member.jobTitle },
    { label: "جهة العمل", value: member.employer },
    { label: "تاريخ التسجيل", value: new Date(member.createdAt).toLocaleDateString("ar-EG") },
  ].filter((r) => r.value);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: "تفاصيل العضو", headerStyle: { backgroundColor: Colors.primary }, headerTintColor: "#fff" }} />
      <ScrollView style={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: member.profileImage }} style={styles.avatar} />
          <Text style={styles.name}>{member.fullNameAr}</Text>
          <Text style={styles.nameEn}>{member.fullNameEn}</Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>{member.memberNumber}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handlePrint("print")}>
            <Ionicons name="print-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>الاستمارة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handlePrint("print-card")}>
            <Ionicons name="card-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>الكارنيه</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionDanger]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            <Text style={[styles.actionText, { color: Colors.danger }]}>حذف</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          {infoRows.map((row, i) => (
            <View key={row.label} style={[styles.infoRow, i < infoRows.length - 1 && styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Skills & Experiences */}
        {(member.previousExperiences || member.skills) && (
          <View style={styles.infoCard}>
            {member.previousExperiences && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>الخبرات السابقة</Text>
                <Text style={styles.infoValue}>{member.previousExperiences}</Text>
              </View>
            )}
            {member.skills && (
              <View style={[styles.infoRow, member.previousExperiences ? styles.infoRowBorder : undefined]}>
                <Text style={styles.infoLabel}>المهارات</Text>
                <Text style={styles.infoValue}>{member.skills}</Text>
              </View>
            )}
          </View>
        )}

        {/* QR Code */}
        {member.qrCode && (
          <View style={styles.qrCard}>
            <Image source={{ uri: member.qrCode }} style={styles.qrImage} />
            <Text style={styles.qrText}>رمز QR للعضوية</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileHeader: { backgroundColor: Colors.primary, alignItems: "center", paddingVertical: 24, paddingBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: "#fff", marginBottom: 12 },
  name: { fontSize: FontSize.xl, fontWeight: "bold", color: "#fff" },
  nameEn: { fontSize: FontSize.sm, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  memberBadge: { marginTop: 8, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  memberBadgeText: { color: "#fff", fontSize: FontSize.sm, fontWeight: "600" },
  actions: { flexDirection: "row", marginHorizontal: Spacing.md, marginTop: -16, gap: Spacing.sm },
  actionBtn: { flex: 1, backgroundColor: "#fff", borderRadius: 10, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: Colors.border, gap: 4 },
  actionDanger: { borderColor: Colors.dangerLight },
  actionText: { fontSize: FontSize.xs, fontWeight: "600", color: Colors.primary },
  infoCard: { backgroundColor: "#fff", marginHorizontal: Spacing.md, marginTop: Spacing.md, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", padding: Spacing.lg, alignItems: "flex-start" },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, flex: 1 },
  infoValue: { fontSize: FontSize.sm, color: Colors.text, fontWeight: "500", flex: 2, textAlign: "left" },
  qrCard: { backgroundColor: "#fff", marginHorizontal: Spacing.md, marginTop: Spacing.md, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: Spacing.xl, alignItems: "center" },
  qrImage: { width: 150, height: 150 },
  qrText: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing.sm },
});
