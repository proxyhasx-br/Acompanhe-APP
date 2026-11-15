import { View, Text, Image, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { usuarioLogado } from "../data/mock";

export function PerfilScreen() {
  const { width } = useWindowDimensions();
  const isCelularPequeno = width < 360;
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conteudo}>
      <Text style={[styles.titulo, { fontSize: isCelularPequeno ? 22 : 26 }]}>Perfil</Text>
      <Text style={styles.subtitulo}>Seu perfil logado</Text>
      <View style={styles.card}>
        <Image source={{ uri: usuarioLogado.avatarUrl }} style={styles.avatar} />
        <Text style={styles.nome}>@{usuarioLogado.username}</Text>
        <Text style={styles.meta}>{usuarioLogado.nome}</Text>
        <Text style={styles.meta}>{usuarioLogado.endereco.cidade} - {usuarioLogado.endereco.estado} • {usuarioLogado.idade} anos</Text>
        <View style={styles.selo}><Text style={styles.seloTexto}>✓ Verificado</Text></View>
      </View>
      <View style={styles.menuPerfil}>
        <Text style={styles.itemPerfil}>Editar perfil →</Text>
        <Text style={styles.itemPerfil}>Meus agendamentos →</Text>
        <Text style={styles.itemPerfil}>Favoritos →</Text>
        <Text style={styles.itemPerfil}>Configurações →</Text>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  conteudo: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 96, maxWidth: 520, width: "100%", alignSelf: "center" },
  titulo: { fontWeight: "800", color: "#1C1C1C", letterSpacing: -0.3, marginBottom: 6 },
  subtitulo: { fontSize: 14, color: "#6B6B6B", lineHeight: 20, marginBottom: 12 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, alignItems: "center", marginBottom: 12 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#E8E0D8", marginBottom: 6 },
  nome: { fontWeight: "700", color: "#1C1C1C", fontSize: 15, marginBottom: 4 },
  meta: { fontSize: 14, color: "#6B6B6B" },
  selo: { marginTop: 8, backgroundColor: "#F5F0EB", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  seloTexto: { fontSize: 13, fontWeight: "700", color: "#B08D57" },
  menuPerfil: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16 },
  itemPerfil: { fontSize: 15, fontWeight: "600", color: "#1C1C1C", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F0EBE6" },
});
