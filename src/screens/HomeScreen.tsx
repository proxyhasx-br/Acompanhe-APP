import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { AcompanhanteCard } from "../components/AcompanhamentoCard";
import { acompanhantes } from "../data/mock";

export function HomeScreen() {
  const [indice, setIndice] = useState(0);
  const { width } = useWindowDimensions();
  const isCelularPequeno = width < 360;
  const atual = acompanhantes[indice];

  function proximo() {
    setIndice((p) => (p + 1) % acompanhantes.length);
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conteudo}>
      <Text style={[styles.titulo, { fontSize: isCelularPequeno ? 22 : 26 }]}>Acompanhê.App</Text>
      <Text style={styles.subtitulo}>Acompanhantes em destaque em Vitória - ES</Text>
      <Text style={styles.contador}>{indice + 1} de {acompanhantes.length}</Text>
      <AcompanhanteCard usuario={atual} onOutro={proximo} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 96, maxWidth: 520, width: "100%", alignSelf: "center" },
  titulo: { fontWeight: "800", color: "#1C1C1C", letterSpacing: -0.3, marginBottom: 6 },
  subtitulo: { fontSize: 14, color: "#6B6B6B", lineHeight: 20, marginBottom: 12 },
  contador: { fontSize: 13, fontWeight: "600", color: "#B08D57", marginBottom: 12 },
  dots: { flexDirection: "row", justifyContent: "center", marginTop: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#D9D0C5", marginHorizontal: 3 },
  dotAtivo: { backgroundColor: "#B08D57", width: 22 },
});
