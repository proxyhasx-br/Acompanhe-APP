import { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, useWindowDimensions, Image, Pressable } from "react-native";
import { acompanhantes } from "../data/mock";

const CATEGORIAS = ["Todos", "Eventos", "Festas", "Viagens", "Terapêutico"];

export function BuscaScreen() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const { width } = useWindowDimensions();
  const isCelularPequeno = width < 360;

  const filtrados = acompanhantes.filter((a) => {
    const termo = busca.toLowerCase();
    if (termo && !a.username.toLowerCase().includes(termo) && !a.nome.toLowerCase().includes(termo) && !a.endereco.cidade.toLowerCase().includes(termo)) return false;
    return true;
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conteudo}>
      <Text style={[styles.titulo, { fontSize: isCelularPequeno ? 22 : 26 }]}>Busca</Text>
      <Text style={styles.subtitulo}>Busque por nickname, cidade ou categoria</Text>
      <TextInput value={busca} onChangeText={setBusca} placeholder="Buscar acompanhante..." placeholderTextColor="#9A9A9A" style={styles.input} returnKeyType="search" />
      <View style={styles.chips}>{CATEGORIAS.map((c) => (<Pressable key={c} onPress={() => setCategoria(c)} style={[styles.chip, categoria === c && styles.chipAtivo]}><Text style={[styles.chipTexto, categoria === c && styles.chipTextoAtivo]}>{c}</Text></Pressable>))}</View>
      <Text style={styles.resultado}>{filtrados.length} resultado(s) • {categoria}</Text>
      {filtrados.map((a) => (
        <View key={a.id} style={styles.card}>
          <Image source={{ uri: a.avatarUrl }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.nome}>@{a.username}</Text>
            <Text style={styles.meta}>{a.nome} • {a.idade} anos</Text>
            <Text style={styles.meta}>{a.endereco.cidade} - {a.endereco.estado}</Text>
          </View>
          <Text style={styles.ver}>Ver →</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 96, maxWidth: 520, width: "100%", alignSelf: "center" },
  titulo: { fontWeight: "800", color: "#1C1C1C", letterSpacing: -0.3, marginBottom: 6 },
  subtitulo: { fontSize: 14, color: "#6B6B6B", lineHeight: 20, marginBottom: 12 },
  input: { backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#D9D0C5", paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: "#1C1C1C", marginBottom: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  chip: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D9D0C5", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginRight: 8, marginBottom: 8 },
  chipAtivo: { backgroundColor: "#1C1C1C", borderColor: "#1C1C1C" },
  chipTexto: { fontSize: 13, fontWeight: "600", color: "#1C1C1C" },
  chipTextoAtivo: { color: "#FFFFFF" },
  resultado: { fontSize: 13, color: "#6B6B6B", marginBottom: 12 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#E8E0D8", marginRight: 12 },
  nome: { fontWeight: "700", color: "#1C1C1C", fontSize: 15 },
  meta: { fontSize: 13, color: "#6B6B6B" },
  ver: { fontSize: 14, fontWeight: "700", color: "#B08D57" },
});
