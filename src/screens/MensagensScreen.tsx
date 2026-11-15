import { View, Text, Image, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { conversasIniciais } from "../data/mock";

export function MensagensScreen() {
  const { width } = useWindowDimensions();
  const isCelularPequeno = width < 360;
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conteudo}>
      <Text style={[styles.titulo, { fontSize: isCelularPequeno ? 22 : 26 }]}>Mensagens</Text>
      <Text style={styles.subtitulo}>Suas conversas com acompanhantes e membros</Text>
      {conversasIniciais.map((c) => (
        <View key={c.id} style={styles.card}>
          <Image source={{ uri: c.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.nome}>@{c.autor}</Text>
            <Text style={styles.ultima} numberOfLines={1}>{c.ultima}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.tempo}>{c.tempo}</Text>
            {c.naoLidas > 0 && (<View style={styles.badge}><Text style={styles.badgeTexto}>{c.naoLidas}</Text></View>)}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  conteudo: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 96, maxWidth: 520, width: "100%", alignSelf: "center" },
  titulo: { fontWeight: "800", color: "#1C1C1C", letterSpacing: -0.3, marginBottom: 6 },
  subtitulo: { fontSize: 14, color: "#6B6B6B", lineHeight: 20, marginBottom: 12 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#E8E0D8", marginRight: 12 },
  nome: { fontWeight: "700", color: "#1C1C1C", fontSize: 15 },
  ultima: { fontSize: 13, color: "#6B6B6B", marginTop: 2 },
  tempo: { fontSize: 12, color: "#6B6B6B" },
  badge: { backgroundColor: "#B08D57", borderRadius: 999, minWidth: 22, height: 22, alignItems: "center", justifyContent: "center", marginTop: 6, paddingHorizontal: 6 },
  badgeTexto: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
