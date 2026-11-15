import { View, Text, StyleSheet } from "react-native";
import { AcompanhanteCard } from "./src/components/AcompanhamentoCard";
import { Home } from "./src/screens/home";

export default function App() {
  return (      
    <View style={styles.container}>
      <Home />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: null },
});
