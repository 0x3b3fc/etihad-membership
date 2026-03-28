import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, TextInput } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { api } from "../../src/api/client";
import { Application, Unit } from "../../src/types";
import { Colors, Spacing, FontSize } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [app, setApp] = useState<Application | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const [appRes, unitsRes] = await Promise.all([
          api<{ success: boolean; data: Application }>(`/api/admin/applications/${id}`),
          api<{ success: boolean; data: Unit[] }>("/api/admin/units"),
        ]);
        if (appRes.success) {
          setApp(appRes.data);
          setSelectedUnit(appRes.data.assignedUnit?.id || "");
          setAdminNote(appRes.data.adminNote || "");
        }
        if (unitsRes.success) setUnits(unitsRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleDecision = async (status: "ACCEPTED" | "REJECTED") => {
    if (status === "ACCEPTED" && !selectedUnit) {
      Alert.alert("خطأ", "يرجى اختيار الوحدة أولاً");
      return;
    }

    const label = status === "ACCEPTED" ? "قبول" : "رفض";
    Alert.alert(label, `هل أنت متأكد من ${label} هذا الطلب؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: label,
        onPress: async () => {
          setIsSaving(true);
          try {
            const res = await api<{ success: boolean; data: Application }>(`/api/admin/applications/${id}`, {
              method: "PUT",
              body: JSON.stringify({ status, assignedUnitId: selectedUnit, adminNote }),
            });
            if (res.success) setApp(res.data);
          } catch (e) {
            Alert.alert("خطأ", e instanceof Error ? e.message : "فشل العملية");
          } finally {
            setIsSaving(false);
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert("حذف الطلب", "هل أنت متأكد؟ لا يمكن التراجع.", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/admin/applications/${id}`, { method: "DELETE" });
            router.back();
          } catch (e) {
            Alert.alert("خطأ", e instanceof Error ? e.message : "فشل الحذف");
          }
        },
      },
    ]);
  };

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!app) return <View style={styles.center}><Text>الطلب غير موجود</Text></View>;

  const getStatusStyle = () => {
    if (app.status === "PENDING") return { bg: Colors.warningLight, text: Colors.warning, label: "قيد المراجعة" };
    if (app.status === "ACCEPTED") return { bg: Colors.successLight, text: Colors.success, label: "مقبول" };
    return { bg: Colors.dangerLight, text: Colors.danger, label: "مرفوض" };
  };
  const st = getStatusStyle();

  const infoRows = [
    { label: "الاسم", value: app.fullName },
    { label: "الرقم القومي", value: app.nationalId },
    { label: "المحافظة", value: app.governorate.name },
    { label: "العنوان", value: app.address },
    { label: "الهاتف", value: app.phone },
    { label: "البريد", value: app.email },
    { label: "نوع العضوية", value: app.memberType === "student" ? "طالب" : "خريج" },
    { label: "الجامعة", value: app.universityName },
    { label: "الكلية", value: app.facultyName },
    { label: "الحالة الوظيفية", value: app.employmentStatus === "working" ? "يعمل" : "لا يعمل" },
    { label: "الوظيفة", value: app.jobTitle },
    { label: "تاريخ التقديم", value: new Date(app.submittedAt).toLocaleDateString("ar-EG") },
  ].filter((r) => r.value);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: "تفاصيل الطلب", headerStyle: { backgroundColor: Colors.primary }, headerTintColor: "#fff" }} />
      <ScrollView style={styles.container}>
        {/* Status Banner */}
        <View style={[styles.banner, { backgroundColor: st.bg }]}>
          <Text style={[styles.bannerText, { color: st.text }]}>{st.label}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          {infoRows.map((row, i) => (
            <View key={row.label} style={[styles.infoRow, i < infoRows.length - 1 && styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Decision Form (only for PENDING) */}
        {app.status === "PENDING" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>اتخاذ القرار</Text>

            <Text style={styles.fieldLabel}>الوحدة المخصصة</Text>
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => {
                const activeUnits = units.filter(u => u.isActive);
                Alert.alert("اختر الوحدة", "", activeUnits.map(u => ({
                  text: u.name,
                  onPress: () => setSelectedUnit(u.id),
                })).concat([{ text: "إلغاء", onPress: () => {}, style: "cancel" } as never]));
              }}
            >
              <Text style={styles.pickerText}>
                {selectedUnit ? units.find(u => u.id === selectedUnit)?.name : "اختر الوحدة..."}
              </Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>ملاحظة (اختياري)</Text>
            <TextInput
              style={styles.textArea}
              value={adminNote}
              onChangeText={setAdminNote}
              placeholder="أضف ملاحظة..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.decisionBtns}>
              <TouchableOpacity
                style={[styles.decisionBtn, styles.acceptBtn]}
                onPress={() => handleDecision("ACCEPTED")}
                disabled={isSaving}
              >
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.decisionBtnText}>قبول</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.decisionBtn, styles.rejectBtn]}
                onPress={() => handleDecision("REJECTED")}
                disabled={isSaving}
              >
                <Ionicons name="close-circle" size={18} color="#fff" />
                <Text style={styles.decisionBtnText}>رفض</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Decided Info */}
        {app.status !== "PENDING" && (
          <View style={styles.card}>
            {app.assignedUnit && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>الوحدة المخصصة</Text>
                <Text style={styles.infoValue}>{app.assignedUnit.name}</Text>
              </View>
            )}
            {app.adminNote && (
              <View style={[styles.infoRow, app.assignedUnit ? styles.infoRowBorder : undefined]}>
                <Text style={styles.infoLabel}>ملاحظة الإدارة</Text>
                <Text style={styles.infoValue}>{app.adminNote}</Text>
              </View>
            )}
            {app.decidedAt && (
              <View style={[styles.infoRow, styles.infoRowBorder]}>
                <Text style={styles.infoLabel}>تاريخ القرار</Text>
                <Text style={styles.infoValue}>{new Date(app.decidedAt).toLocaleDateString("ar-EG")}</Text>
              </View>
            )}
          </View>
        )}

        {/* Delete */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
          <Text style={styles.deleteText}>حذف الطلب</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  banner: { margin: Spacing.md, padding: Spacing.lg, borderRadius: 12, alignItems: "center" },
  bannerText: { fontSize: FontSize.md, fontWeight: "bold" },
  card: { backgroundColor: "#fff", marginHorizontal: Spacing.md, marginTop: Spacing.md, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: "hidden", padding: Spacing.lg },
  cardTitle: { fontSize: FontSize.md, fontWeight: "bold", color: Colors.text, marginBottom: Spacing.md },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: Spacing.sm, alignItems: "flex-start" },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, flex: 1 },
  infoValue: { fontSize: FontSize.sm, color: Colors.text, fontWeight: "500", flex: 2, textAlign: "left" },
  fieldLabel: { fontSize: FontSize.xs, fontWeight: "600", color: Colors.text, marginTop: Spacing.md, marginBottom: Spacing.xs },
  pickerBtn: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: Spacing.md, minHeight: 48 },
  pickerText: { fontSize: FontSize.sm, color: Colors.text },
  textArea: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: Spacing.md, fontSize: FontSize.sm, minHeight: 80, textAlign: "right" },
  decisionBtns: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.lg },
  decisionBtn: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, paddingVertical: 14, borderRadius: 10 },
  acceptBtn: { backgroundColor: Colors.success },
  rejectBtn: { backgroundColor: Colors.danger },
  decisionBtnText: { color: "#fff", fontWeight: "bold", fontSize: FontSize.sm },
  deleteBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: Spacing.sm, marginHorizontal: Spacing.md, marginTop: Spacing.xl, padding: Spacing.lg, backgroundColor: Colors.dangerLight, borderRadius: 12 },
  deleteText: { color: Colors.danger, fontWeight: "600", fontSize: FontSize.sm },
});
