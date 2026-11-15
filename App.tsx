import { View, StyleSheet, Platform } from "react-native";
import { Home } from "./src/screens/home";

export default function App() {
  return (
    <View style={styles.container}>
      <Home />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0EB",
    ...(Platform.OS === "web" ? ({ height: "100vh" } as any) : {}),
  },
});
