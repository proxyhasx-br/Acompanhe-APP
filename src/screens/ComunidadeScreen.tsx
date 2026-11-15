import { useState } from "react";
import { View, Text, Image, TextInput, ScrollView, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { postsIniciais, Post } from "../data/mock";

export function ComunidadeScreen() {
  const [posts, setPosts] = useState<Post[]>(postsIniciais);
  const [novoPost, setNovoPost] = useState("");
  const { width } = useWindowDimensions();
  const isCelularPequeno = width < 360;

  function curtir(id: string) {
    setPosts((lista) => lista.map((p) => p.id === id ? { ...p, curtido: !p.curtido, curtidas: p.curtido ? p.curtidas - 1 : p.curtidas + 1 } : p));
  }

  function publicar() {
    if (!novoPost.trim()) return;
    const novo: Post = { id: String(Date.now()), autor: "proxyhasx", nome: "Você", avatar: "https://i.pravatar.cc/150?img=12", tempo: "agora", texto: novoPost.trim(), tag: "Vitória", curtidas: 0, comentarios: 0, curtido: false };
    setPosts((lista) => [novo, ...lista]);
    setNovoPost("");
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conteudo}>
      <Text style={[styles.titulo, { fontSize: isCelularPequeno ? 22 : 26 }]}>Comunidade</Text>
      <Text style={styles.subtitulo}>Recomendações, posts e indicações de membros verificados</Text>

      <View style={styles.composer}>
        <Image source={{ uri: "https://i.pravatar.cc/150?img=12" }} style={styles.avatarPequeno} />
        <TextInput value={novoPost} onChangeText={setNovoPost} placeholder="Compartilhe uma recomendação..." placeholderTextColor="#9A9A9A" style={styles.inputComposer} multiline />
        <Pressable onPress={publicar} style={({ pressed }) => [styles.botaoPostar, { opacity: pressed ? 0.7 : 1 }]}><Text style={styles.textoBotao}>Postar</Text></Pressable>
      </View>

      {posts.map((p) => (
        <View key={p.id} style={styles.post}>
          <View style={styles.postHeader}>
            <Image source={{ uri: p.avatar }} style={styles.avatarPequeno} />
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>@{p.autor}</Text>
              <Text style={styles.tempo}>{p.tempo} • {p.tag}</Text>
            </View>
          </View>
          <Text style={styles.textoPost}>{p.texto}</Text>
          <View style={styles.acoes}>
            <Pressable onPress={() => curtir(p.id)} hitSlop={8}><Text style={[styles.acao, p.curtido && styles.acaoAtiva]}>♡ {p.curtidas} Curtir</Text></Pressable>
            <Text style={styles.acao}>💬 {p.comentarios} Comentar</Text>
            <Text style={styles.acao}>↗ Compartilhar</Text>
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
  composer: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarPequeno: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#E8E0D8", marginRight: 8 },
  inputComposer: { flex: 1, fontSize: 14, color: "#1C1C1C", minHeight: 36 },
  botaoPostar: { backgroundColor: "#B08D57", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginLeft: 8 },
  textoBotao: { color: "#fff", fontWeight: "700", fontSize: 13 },
  post: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 12 },
  postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  nome: { fontWeight: "700", color: "#1C1C1C", fontSize: 15 },
  tempo: { fontSize: 12, color: "#6B6B6B" },
  textoPost: { fontSize: 14, color: "#1C1C1C", lineHeight: 20, marginBottom: 12 },
  acoes: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#F0EBE6", paddingTop: 10 },
  acao: { fontSize: 13, color: "#6B6B6B", fontWeight: "600" },
  acaoAtiva: { color: "#B08D57" },
});
