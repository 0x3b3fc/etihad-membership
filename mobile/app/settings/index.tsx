import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Switch } from "react-native";
import { Stack } from "expo-router";
import { api } from "../../src/api/client";
import { Colors, Spacing, FontSize } from "../../src/constants/theme";

interface Settings {
  platformName: string;
  platformSubtitle: string;
  primaryColor: string;
  membershipFee: number;
  enableRegistration: boolean;
  enableApplications: boolean;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ success: boolean; data: Settings }>("/api/admin/settings");
        if (res.success) setSettings(res.data);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const updateSetting = async (key: string, value: boolean) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await api("/api/admin/settings", { method: "PUT", body: JSON.stringify(updated) });
    } catch (e) {
      setSettings(settings); // revert
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, headerTitle: "الإعدادات", headerStyle: { backgroundColor: Colors.primary }, headerTintColor: "#fff" }} />
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: "الإعدادات", headerStyle: { backgroundColor: Colors.primary }, headerTintColor: "#fff" }} />
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>معلومات المنصة</Text>
          <View style={styles.row}>
            <Text style={styles.label}>اسم المنصة</Text>
            <Text style={styles.value}>{settings?.platformName}</Text>
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.label}>العنوان الفرعي</Text>
            <Text style={styles.value}>{settings?.platformSubtitle}</Text>
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.label}>اللون الرئيسي</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: settings?.primaryColor }} />
              <Text style={styles.value}>{settings?.primaryColor}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>التحكم</Text>
          <View style={styles.row}>
            <Text style={styles.label}>تفعيل التسجيل</Text>
            <Switch
              value={settings?.enableRegistration}
              onValueChange={(v) => updateSetting("enableRegistration", v)}
              trackColor={{ true: Colors.primary }}
            />
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.label}>تفعيل الطلبات</Text>
            <Switch
              value={settings?.enableApplications}
              onValueChange={(v) => updateSetting("enableApplications", v)}
              trackColor={{ true: Colors.primary }}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#fff", marginHorizontal: Spacing.md, marginTop: Spacing.md, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg },
  cardTitle: { fontSize: FontSize.md, fontWeight: "bold", color: Colors.text, marginBottom: Spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: Spacing.sm },
  rowBorder: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.sm },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary },
  value: { fontSize: FontSize.sm, fontWeight: "500", color: Colors.text },
});
