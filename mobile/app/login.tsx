import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { Colors, Spacing, FontSize } from "../src/constants/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("يرجى ملء جميع الحقول");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "فشل تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>عضويتي</Text>
          <Text style={styles.subtitle}>اتحاد بشبابها</Text>
          <Text style={styles.adminLabel}>لوحة تحكم المسؤولين</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>تسجيل الدخول</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="admin@example.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign="left"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>كلمة المرور</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              textAlign="left"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>تسجيل الدخول</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>جميع الحقوق محفوظة © اتحاد بشبابها 2026</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1, justifyContent: "center", padding: Spacing.xl },
  header: { alignItems: "center", marginBottom: 32 },
  logo: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: FontSize.md, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  adminLabel: { fontSize: FontSize.sm, color: "rgba(255,255,255,0.5)", marginTop: 8, backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: Spacing.xxl, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  cardTitle: { fontSize: FontSize.xl, fontWeight: "bold", color: Colors.text, textAlign: "center", marginBottom: Spacing.xl },
  errorBox: { backgroundColor: Colors.dangerLight, borderRadius: 8, padding: Spacing.md, marginBottom: Spacing.lg },
  errorText: { color: Colors.danger, fontSize: FontSize.sm, textAlign: "center" },
  field: { marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text, marginBottom: Spacing.xs, textAlign: "right" },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: Spacing.lg, paddingVertical: 14, fontSize: FontSize.md, backgroundColor: "#fafafa" },
  button: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: "center", marginTop: Spacing.sm },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: FontSize.md, fontWeight: "bold" },
  footer: { textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: FontSize.xs, marginTop: 24 },
});
