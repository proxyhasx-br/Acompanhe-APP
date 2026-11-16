import { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, StyleSheet, useWindowDimensions, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { conversasIniciais } from "../data/mock";

type Mensagem = { id: string; texto: string; minha: boolean; hora: string };
type Conversa = { id: string; autor: string; avatar: string; ultima: string; tempo: string; naoLidas: number; bio: string; mensagens: Mensagem[] };

function criarConversasIniciais(): Conversa[] {
  return conversasIniciais.map((c: any) => ({
    id: String(c.id),
    autor: c.autor,
    avatar: c.avatar,
    ultima: c.ultima,
    tempo: c.tempo,
    naoLidas: c.naoLidas || 0,
    bio: "Membro da comunidade Acompanhe. Adora conversar e conhecer gente nova.",
    mensagens: [{ id: "m1", texto: c.ultima, minha: false, hora: c.tempo }],
  }));
}

export function MensagensScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isCelularPequeno = width < 360;

  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [conversaAbertaId, setConversaAbertaId] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");
  const [menuConversa, setMenuConversa] = useState<Conversa | null>(null);
  const [showNovaMensagem, setShowNovaMensagem] = useState(false);
  const [showDenunciar, setShowDenunciar] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);
  const [perfilVisitado, setPerfilVisitado] = useState<Conversa | null>(null);
  const [mensagemParaApagar, setMensagemParaApagar] = useState<{ conversaId: string; mensagemId: string } | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [novaMensagem, setNovaMensagem] = useState("");

  const storageKey = `acompanhhe_mensagens_${user?.id || "anonimo"}`;
  const conversaAberta = conversas.find((c) => c.id === conversaAbertaId);

  // CARREGAR - quando abre a tela, busca o que estava salvo
  useEffect(() => {
    async function carregar() {
      try {
        const salvo = await AsyncStorage.getItem(storageKey);
        if (salvo) {
          setConversas(JSON.parse(salvo));
        } else {
          setConversas(criarConversasIniciais());
        }
      } catch {
        setConversas(criarConversasIniciais());
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [user?.id]);

  // SALVAR AUTOMÁTICO - toda vez que conversas muda, salva
  useEffect(() => {
    if (carregando) return;
    AsyncStorage.setItem(storageKey, JSON.stringify(conversas));
  }, [conversas, carregando]);

  // Filtro da busca
  const conversasFiltradas = conversas.filter((c) =>
    c.autor.toLowerCase().includes(busca.toLowerCase()) ||
    c.ultima.toLowerCase().includes(busca.toLowerCase())
  );

  function abrirConversa(c: Conversa) {
    setConversas((prev) => prev.map((x) => (x.id === c.id ? { ...x, naoLidas: 0 } : x)));
    setConversaAbertaId(c.id);
  }

  async function enviarMensagem() {
    if (!texto.trim() || !conversaAberta) return;
    const nova: Mensagem = { id: Date.now().toString(), texto: texto.trim(), minha: true, hora: "Agora" };
    setConversas((prev) => prev.map((c) => c.id === conversaAberta.id ? { ...c, mensagens: [...c.mensagens, nova], ultima: nova.texto, tempo: "Agora" } : c));
    setTexto("");
    // Tenta salvar no Supabase também, mas não trava se a tabela ainda não existir
    if (user) {
      try {
        await supabase.from("mensagens").insert({ conversa_id: conversaAberta.id, sender_id: user.id, texto: nova.texto });
      } catch {}
    }
    setTimeout(() => {
      const resposta: Mensagem = { id: (Date.now() + 1).toString(), texto: "Entendi! Vamos conversar mais sobre isso.", minha: false, hora: "Agora" };
      setConversas((prev) => prev.map((c) => c.id === conversaAberta.id ? { ...c, mensagens: [...c.mensagens, resposta], ultima: resposta.texto } : c));
    }, 1500);
  }

  function limparConversa(id: string) {
    setConversas((prev) => prev.map((c) => c.id === id ? { ...c, mensagens: [], ultima: "Conversa limpa", tempo: "Agora" } : c));
    setMenuConversa(null);
  }

  function apagarConversa(id: string) {
    setConversas((prev) => prev.filter((c) => c.id !== id));
    if (conversaAbertaId === id) setConversaAbertaId(null);
    setMenuConversa(null);
  }

  function apagarMensagem() {
    if (!mensagemParaApagar) return;
    setConversas((prev) => prev.map((c) => c.id === mensagemParaApagar.conversaId ? { ...c, mensagens: c.mensagens.filter((m) => m.id !== mensagemParaApagar.mensagemId) } : c));
    setMensagemParaApagar(null);
  }

  function criarNovaConversa() {
    if (!novoNome.trim()) return;
    const nova: Conversa = {
      id: Date.now().toString(),
      autor: novoNome.trim().replace("@", ""),
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
      ultima: novaMensagem.trim() || "Nova conversa",
      tempo: "Agora",
      naoLidas: 0,
      bio: "Novo contato da comunidade Acompanhe.",
      mensagens: novaMensagem.trim() ? [{ id: "m1", texto: novaMensagem.trim(), minha: true, hora: "Agora" }] : [],
    };
    setConversas((prev) => [nova, ...prev]);
    setNovoNome("");
    setNovaMensagem("");
    setShowNovaMensagem(false);
    setConversaAbertaId(nova.id);
  }

  if (carregando) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#B08D57" />
      </View>
    );
  }

  // ============ TELA DO CHAT ABERTO ============
  if (conversaAberta) {
    return (
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setConversaAbertaId(null)}><Text style={styles.voltar}>{"< Voltar"}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.chatPerfil} onPress={() => { setPerfilVisitado(conversaAberta); setShowPerfil(true); }}>
            <Image source={{ uri: conversaAberta.avatar }} style={styles.chatAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.chatNome}>@{conversaAberta.autor}</Text>
              <Text style={styles.chatStatus}>Online • Toque para ver perfil</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuConversa(conversaAberta)}><Text style={styles.tresPontos}>⋮</Text></TouchableOpacity>
        </View>

        <ScrollView style={styles.mensagensArea} contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
          {conversaAberta.mensagens.length === 0 && <Text style={styles.vazio}>Nenhuma mensagem. Mande um oi!</Text>}
          {conversaAberta.mensagens.map((m) => (
            <TouchableOpacity key={m.id} onLongPress={() => setMensagemParaApagar({ conversaId: conversaAberta.id, mensagemId: m.id })} style={[styles.bolha, m.minha ? styles.bolhaMinha : styles.bolhaDeles]}>
              <Text style={[styles.bolhaTexto, m.minha ? { color: "#fff" } : {}]}>{m.texto}</Text>
              <Text style={[styles.bolhaHora, m.minha ? { color: "#E8E0D8" } : {}]}>{m.hora} • Segure para apagar</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputArea}>
          <TextInput style={styles.inputChat} value={texto} onChangeText={setTexto} placeholder="Digite sua mensagem..." multiline />
          <TouchableOpacity style={styles.enviarBtn} onPress={enviarMensagem}><Text style={styles.enviarTexto}>Enviar</Text></TouchableOpacity>
        </View>

        <Modal visible={!!menuConversa} transparent animationType="fade" onRequestClose={() => setMenuConversa(null)}>
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuConversa(null)}>
            <View style={styles.menuBox}>
              <TouchableOpacity style={styles.menuItem} onPress={() => { if (menuConversa) { setPerfilVisitado(menuConversa); setMenuConversa(null); setShowPerfil(true); } }}><Text style={styles.menuItemTexto}>Visitar perfil</Text></TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { if (menuConversa) limparConversa(menuConversa.id); }}><Text style={styles.menuItemTexto}>Limpar conversa</Text></TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuConversa(null); setShowDenunciar(true); }}><Text style={styles.menuItemTexto}>Denunciar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => { if (menuConversa) apagarConversa(menuConversa.id); }}><Text style={[styles.menuItemTexto, { color: "#ff5a5a" }]}>Apagar conversa</Text></TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showDenunciar} transparent animationType="fade" onRequestClose={() => setShowDenunciar(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBoxGrande}>
              <Text style={styles.modalTitle}>Denunciar @{conversaAberta.autor}</Text>
              <Text style={styles.modalSub}>Por que você está denunciando essa conversa?</Text>
              {["Spam", "Conteúdo inapropriado", "Assédio", "Outro motivo"].map((motivo) => (
                <TouchableOpacity key={motivo} style={styles.motivoBtn} onPress={() => { setShowDenunciar(false); Alert.alert("Denúncia enviada", `Obrigado por denunciar por: ${motivo}`); }}>
                  <Text style={styles.motivoTexto}>{motivo}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.cancelarBtn} onPress={() => setShowDenunciar(false)}><Text style={styles.cancelarTexto}>Cancelar</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showPerfil} transparent animationType="fade" onRequestClose={() => setShowPerfil(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBoxGrande}>
              {perfilVisitado && (<>
                <Image source={{ uri: perfilVisitado.avatar }} style={styles.perfilAvatar} />
                <Text style={styles.perfilNome}>@{perfilVisitado.autor}</Text>
                <Text style={styles.perfilBio}>{perfilVisitado.bio}</Text>
                <TouchableOpacity style={styles.verPerfilBtn} onPress={() => { setShowPerfil(false); Alert.alert("Perfil", "Aqui vai abrir a tela de perfil completa desse usuário."); }}><Text style={styles.verPerfilTexto}>Ver perfil completo</Text></TouchableOpacity>
              </>)}
              <TouchableOpacity style={styles.cancelarBtn} onPress={() => setShowPerfil(false)}><Text style={styles.cancelarTexto}>Fechar</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={!!mensagemParaApagar} transparent animationType="fade" onRequestClose={() => setMensagemParaApagar(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBoxGrande}>
              <Text style={styles.modalTitle}>Apagar mensagem?</Text>
              <Text style={styles.modalSub}>Essa mensagem será apagada só para você.</Text>
              <TouchableOpacity style={[styles.verPerfilBtn, { backgroundColor: "#ff5a5a" }]} onPress={apagarMensagem}><Text style={styles.verPerfilTexto}>Apagar mensagem</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelarBtn} onPress={() => setMensagemParaApagar(null)}><Text style={styles.cancelarTexto}>Cancelar</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ============ LISTA DE CONVERSAS ============
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conteudo}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={[styles.titulo, { fontSize: isCelularPequeno ? 22 : 26 }]}>Mensagens</Text>
          <Text style={styles.subtitulo}>Suas conversas com acompanhantes e membros</Text>
        </View>
        <TouchableOpacity style={styles.novaBtn} onPress={() => setShowNovaMensagem(true)}><Text style={styles.novaBtnTexto}>+ Nova</Text></TouchableOpacity>
      </View>

      {/* CAMPO DE BUSCA */}
      <View style={styles.buscaBox}>
        <Text style={styles.buscaIcone}>🔍</Text>
        <TextInput style={styles.buscaInput} value={busca} onChangeText={setBusca} placeholder="Buscar por nome ou mensagem..." placeholderTextColor="#999" />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca("")}><Text style={styles.buscaLimpar}>✕</Text></TouchableOpacity>
        )}
      </View>

      {conversasFiltradas.length === 0 && <Text style={styles.vazio}>{busca ? `Nenhuma conversa encontrada para "${busca}"` : "Nenhuma conversa ainda. Clique em + Nova para começar."}</Text>}

      {conversasFiltradas.map((c) => (
        <TouchableOpacity key={c.id} style={styles.card} onPress={() => abrirConversa(c)}>
          <Image source={{ uri: c.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.nome}>@{c.autor}</Text>
            <Text style={styles.ultima} numberOfLines={1}>{c.ultima}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.tempo}>{c.tempo}</Text>
            {c.naoLidas > 0 && (<View style={styles.badge}><Text style={styles.badgeTexto}>{c.naoLidas}</Text></View>)}
          </View>
          <TouchableOpacity onPress={() => setMenuConversa(c)} style={styles.tresPontosBtn}><Text style={styles.tresPontos}>⋮</Text></TouchableOpacity>
        </TouchableOpacity>
      ))}

      <Modal visible={!!menuConversa && !conversaAbertaId} transparent animationType="fade" onRequestClose={() => setMenuConversa(null)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuConversa(null)}>
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { if (menuConversa) { setPerfilVisitado(menuConversa); setMenuConversa(null); setShowPerfil(true); } }}><Text style={styles.menuItemTexto}>Visitar perfil</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { if (menuConversa) limparConversa(menuConversa.id); }}><Text style={styles.menuItemTexto}>Limpar conversa</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuConversa(null); setShowDenunciar(true); }}><Text style={styles.menuItemTexto}>Denunciar</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => { if (menuConversa) apagarConversa(menuConversa.id); }}><Text style={[styles.menuItemTexto, { color: "#ff5a5a" }]}>Apagar conversa</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showNovaMensagem} transparent animationType="fade" onRequestClose={() => setShowNovaMensagem(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBoxGrande}>
            <Text style={styles.modalTitle}>Nova mensagem</Text>
            <Text style={styles.label}>Para quem?</Text>
            <TextInput style={styles.inputModal} value={novoNome} onChangeText={setNovoNome} placeholder="@usuario" />
            <Text style={styles.label}>Primeira mensagem</Text>
            <TextInput style={[styles.inputModal, { height: 70 }]} value={novaMensagem} onChangeText={setNovaMensagem} placeholder="Oi! Tudo bem?" multiline />
            <TouchableOpacity style={styles.verPerfilBtn} onPress={criarNovaConversa}><Text style={styles.verPerfilTexto}>Começar conversa</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancelarBtn} onPress={() => setShowNovaMensagem(false)}><Text style={styles.cancelarTexto}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showDenunciar && !conversaAbertaId} transparent animationType="fade" onRequestClose={() => setShowDenunciar(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBoxGrande}>
            <Text style={styles.modalTitle}>Denunciar</Text>
            {["Spam", "Conteúdo inapropriado", "Assédio", "Outro motivo"].map((motivo) => (
              <TouchableOpacity key={motivo} style={styles.motivoBtn} onPress={() => { setShowDenunciar(false); Alert.alert("Denúncia enviada", `Obrigado por denunciar por: ${motivo}`); }}><Text style={styles.motivoTexto}>{motivo}</Text></TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelarBtn} onPress={() => setShowDenunciar(false)}><Text style={styles.cancelarTexto}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPerfil && !conversaAbertaId} transparent animationType="fade" onRequestClose={() => setShowPerfil(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBoxGrande}>
            {perfilVisitado && (<>
              <Image source={{ uri: perfilVisitado.avatar }} style={styles.perfilAvatar} />
              <Text style={styles.perfilNome}>@{perfilVisitado.autor}</Text>
              <Text style={styles.perfilBio}>{perfilVisitado.bio}</Text>
              <TouchableOpacity style={styles.verPerfilBtn} onPress={() => { setShowPerfil(false); Alert.alert("Perfil", "Aqui vai abrir a tela de perfil completa desse usuário."); }}><Text style={styles.verPerfilTexto}>Ver perfil completo</Text></TouchableOpacity>
            </>)}
            <TouchableOpacity style={styles.cancelarBtn} onPress={() => setShowPerfil(false)}><Text style={styles.cancelarTexto}>Fechar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 96, maxWidth: 520, width: "100%", alignSelf: "center" },
  titulo: { fontWeight: "800", color: "#1C1C1C", letterSpacing: -0.3, marginBottom: 6 },
  subtitulo: { fontSize: 14, color: "#6B6B6B", lineHeight: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  headerLeft: { flex: 1, flexShrink: 1 },
  novaBtn: { backgroundColor: "#B08D57", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, flexShrink: 0 },
  novaBtnTexto: { color: "#fff", fontWeight: "700" },
  buscaBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0EDE8", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 14, marginBottom: 14, gap: 8 },
  buscaIcone: { fontSize: 16 },
  buscaInput: { flex: 1, fontSize: 14, color: "#1C1C1C" },
  buscaLimpar: { fontSize: 14, color: "#999", paddingHorizontal: 4 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#E8E0D8", marginRight: 12 },
  nome: { fontWeight: "700", color: "#1C1C1C", fontSize: 15 },
  ultima: { fontSize: 13, color: "#6B6B6B", marginTop: 2 },
  tempo: { fontSize: 12, color: "#6B6B6B" },
  badge: { backgroundColor: "#B08D57", borderRadius: 999, minWidth: 22, height: 22, alignItems: "center", justifyContent: "center", marginTop: 6, paddingHorizontal: 6 },
  badgeTexto: { color: "#fff", fontSize: 12, fontWeight: "700" },
  tresPontosBtn: { padding: 8, marginLeft: 6 },
  tresPontos: { fontSize: 22, fontWeight: "700", color: "#6B6B6B" },
  vazio: { textAlign: "center", color: "#6B6B6B", marginTop: 30 },

  chatContainer: { flex: 1, backgroundColor: "#fff" },
  chatHeader: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee", gap: 10 },
  voltar: { color: "#B08D57", fontWeight: "700" },
  chatPerfil: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  chatAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E8E0D8" },
  chatNome: { fontWeight: "700", fontSize: 15 },
  chatStatus: { fontSize: 12, color: "#6B6B6B" },
  mensagensArea: { flex: 1, backgroundColor: "#F7F2EC" },
  bolha: { maxWidth: "80%", padding: 10, borderRadius: 14, marginBottom: 10 },
  bolhaMinha: { backgroundColor: "#B08D57", alignSelf: "flex-end", borderBottomRightRadius: 4 },
  bolhaDeles: { backgroundColor: "#fff", alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  bolhaTexto: { fontSize: 14, color: "#1C1C1C" },
  bolhaHora: { fontSize: 11, color: "#888", marginTop: 4 },
  inputArea: { flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: "#eee", alignItems: "flex-end" },
  inputChat: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, maxHeight: 90 },
  enviarBtn: { backgroundColor: "#B08D57", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  enviarTexto: { color: "#fff", fontWeight: "700" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 20 },
  menuBox: { backgroundColor: "#fff", width: "100%", maxWidth: 340, borderRadius: 16, overflow: "hidden" },
  menuItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  menuItemTexto: { fontSize: 15, fontWeight: "600" },
  modalBoxGrande: { backgroundColor: "#fff", width: "100%", maxWidth: 380, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "800", textAlign: "center" },
  modalSub: { color: "#666", textAlign: "center", marginTop: 8, marginBottom: 16 },
  motivoBtn: { borderWidth: 1, borderColor: "#eee", borderRadius: 10, padding: 12, marginBottom: 8 },
  motivoTexto: { fontWeight: "600" },
  cancelarBtn: { padding: 12, alignItems: "center", marginTop: 6 },
  cancelarTexto: { fontWeight: "700", color: "#666" },
  perfilAvatar: { width: 90, height: 90, borderRadius: 45, alignSelf: "center", marginBottom: 12, backgroundColor: "#E8E0D8" },
  perfilNome: { fontSize: 18, fontWeight: "800", textAlign: "center" },
  perfilBio: { color: "#666", textAlign: "center", marginTop: 8, marginBottom: 16, lineHeight: 20 },
  verPerfilBtn: { backgroundColor: "#B08D57", padding: 12, borderRadius: 10, alignItems: "center" },
  verPerfilTexto: { color: "#fff", fontWeight: "700" },
  label: { fontWeight: "700", marginTop: 12, marginBottom: 6 },
  inputModal: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12 },
});