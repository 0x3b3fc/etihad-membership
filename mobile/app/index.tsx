import { Redirect } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "../src/constants/theme";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.primary }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
