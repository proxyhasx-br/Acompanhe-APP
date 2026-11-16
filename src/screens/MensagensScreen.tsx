import { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, StyleSheet, useWindowDimensions, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

type Mensagem = { id: string; texto: string; minha: boolean; hora: string; sender_id: string; created_at: string };
type Outro = { id: string; nome: string; username: string; avatar_url: string | null; bio: string | null };
type Conversa = { id: string; outro: Outro; ultima: string; tempo: string; naoLidas: number; mensagens: Mensagem[] };

function formatarHora(data: string) {
  const d = new Date(data);
  const hoje = new Date();
  if (d.toDateString() === hoje.toDateString()) return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
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
  const [perfilVisitado, setPerfilVisitado] = useState<Outro | null>(null);
  const [mensagemParaApagar, setMensagemParaApagar] = useState<{ conversaId: string; mensagemId: string } | null>(null);
  const [usuarios, setUsuarios] = useState<Outro[]>([]);
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [outroSelecionado, setOutroSelecionado] = useState<Outro | null>(null);

  const conversaAberta = conversas.find((c) => c.id === conversaAbertaId);

  // AVISA O App.tsx pra zerar o badge do menu na hora
  async function avisarBadgeZerou() {
    await supabase.channel(`badge-${user?.id}`).send({ type: "broadcast", event: "refresh", payload: {} });
  }

  // CARREGAR - agora conta as não lidas de verdade
  async function carregarConversas() {
    if (!user) return;
    const { data: lista } = await supabase.from("conversas").select("*").or(`user1.eq.${user.id},user2.eq.${user.id}`).order("updated_at", { ascending: false });
    if (!lista) { setCarregando(false); return; }

    const montadas: Conversa[] = [];
    for (const conv of lista) {
      const outroId = conv.user1 === user.id ? conv.user2 : conv.user1;
      const { data: perfil } = await supabase.from("profiles").select("id, nome, username, avatar_url, bio").eq("id", outroId).single();
      const { data: msgs } = await supabase.from("mensagens").select("*").eq("conversa_id", conv.id).order("created_at", { ascending: true });
      const mensagens: Mensagem[] = (msgs || []).map((m: any) => ({ id: m.id, texto: m.texto, minha: m.sender_id === user.id, hora: formatarHora(m.created_at), sender_id: m.sender_id, created_at: m.created_at }));
      const ultimaMsg = mensagens[mensagens.length - 1];
      const { count } = await supabase.from("mensagens").select("*", { count: "exact", head: true }).eq("conversa_id", conv.id).neq("sender_id", user.id).eq("lida", false);
      montadas.push({
        id: conv.id,
        outro: perfil || { id: outroId, nome: "Usuário", username: "usuario", avatar_url: null, bio: "" },
        ultima: ultimaMsg ? ultimaMsg.texto : "Nova conversa",
        tempo: ultimaMsg ? ultimaMsg.hora : formatarHora(conv.created_at),
        naoLidas: count || 0,
        mensagens,
      });
    }
    setConversas(montadas);
    setCarregando(false);
  }

  useEffect(() => { carregarConversas(); }, [user?.id]);

  // REALTIME - mensagem nova na conversa aberta
  useEffect(() => {
    if (!conversaAbertaId || !user) return;
    const channel = supabase.channel(`chat-${conversaAbertaId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mensagens", filter: `conversa_id=eq.${conversaAbertaId}` }, async (payload: any) => {
        const m = payload.new;
        const nova: Mensagem = { id: m.id, texto: m.texto, minha: m.sender_id === user.id, hora: formatarHora(m.created_at), sender_id: m.sender_id, created_at: m.created_at };
        setConversas((prev) => prev.map((c) => c.id === conversaAbertaId ? { ...c, mensagens: [...c.mensagens.filter((x) => x.id !== nova.id), nova], ultima: nova.texto, tempo: nova.hora, naoLidas: 0 } : c));
        if (m.sender_id !== user.id) {
          await supabase.from("mensagens").update({ lida: true }).eq("id", m.id);
          avisarBadgeZerou();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversaAbertaId, user?.id]);

  // REALTIME - atualiza a lista quando chega mensagem em outra conversa
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`minhas-mensagens-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mensagens" }, (payload: any) => {
        if (payload.new?.conversa_id !== conversaAbertaId) carregarConversas();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, conversaAbertaId]);

  async function carregarUsuarios() {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("id, nome, username, avatar_url, bio").neq("id", user.id).limit(30);
    setUsuarios(data || []);
  }

  // ABRIR - marca tudo como lido + avisa o App.tsx
  async function abrirConversa(c: Conversa) {
    if (!user) return;
    await supabase.from("mensagens").update({ lida: true }).eq("conversa_id", c.id).neq("sender_id", user.id).eq("lida", false);
    setConversas((prev) => prev.map((x) => (x.id === c.id ? { ...x, naoLidas: 0 } : x)));
    setConversaAbertaId(c.id);
    avisarBadgeZerou();
  }

  // ENVIAR - nasce como não lida pro outro lado
  async function enviarMensagem() {
    if (!texto.trim() || !conversaAberta || !user) return;
    const textoEnviar = texto.trim();
    setTexto("");
    const { error } = await supabase.from("mensagens").insert({ conversa_id: conversaAberta.id, sender_id: user.id, texto: textoEnviar, lida: false });
    if (error) Alert.alert("Erro", error.message);
    await supabase.from("conversas").update({ updated_at: new Date().toISOString() }).eq("id", conversaAberta.id);
  }

  async function criarOuAbrirConversa(outro: Outro) {
    if (!user) return;
    const { data: existente } = await supabase.from("conversas").select("*").or(`and(user1.eq.${user.id},user2.eq.${outro.id}),and(user1.eq.${outro.id},user2.eq.${user.id})`).maybeSingle();
    if (existente) {
      setShowNovaMensagem(false);
      await carregarConversas();
      await supabase.from("mensagens").update({ lida: true }).eq("conversa_id", existente.id).neq("sender_id", user.id).eq("lida", false);
      setConversaAbertaId(existente.id);
      avisarBadgeZerou();
      return;
    }
    const { data: nova, error } = await supabase.from("conversas").insert({ user1: user.id, user2: outro.id }).select().single();
    if (error) { Alert.alert("Erro", error.message); return; }
    setShowNovaMensagem(false);
    setOutroSelecionado(null);
    await carregarConversas();
    setConversaAbertaId(nova.id);
  }

  async function limparConversa(id: string) {
    await supabase.from("mensagens").delete().eq("conversa_id", id);
    setConversas((prev) => prev.map((c) => c.id === id ? { ...c, mensagens: [], ultima: "Conversa limpa", tempo: "Agora", naoLidas: 0 } : c));
    setMenuConversa(null);
  }

  async function apagarConversa(id: string) {
    await supabase.from("conversas").delete().eq("id", id);
    setConversas((prev) => prev.filter((c) => c.id !== id));
    if (conversaAbertaId === id) setConversaAbertaId(null);
    setMenuConversa(null);
  }

  async function apagarMensagem() {
    if (!mensagemParaApagar) return;
    await supabase.from("mensagens").delete().eq("id", mensagemParaApagar.mensagemId);
    setConversas((prev) => prev.map((c) => c.id === mensagemParaApagar.conversaId ? { ...c, mensagens: c.mensagens.filter((m) => m.id !== mensagemParaApagar.mensagemId) } : c));
    setMensagemParaApagar(null);
  }

  const conversasFiltradas = conversas.filter((c) =>
    (c.outro.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
    (c.outro.username || "").toLowerCase().includes(busca.toLowerCase()) ||
    c.ultima.toLowerCase().includes(busca.toLowerCase())
  );

  const usuariosFiltrados = usuarios.filter((u) =>
    (u.nome || "").toLowerCase().includes(buscaUsuario.toLowerCase()) ||
    (u.username || "").toLowerCase().includes(buscaUsuario.toLowerCase())
  );

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
          <TouchableOpacity style={styles.chatPerfil} onPress={() => { setPerfilVisitado(conversaAberta.outro); setShowPerfil(true); }}>
            <Image source={{ uri: conversaAberta.outro.avatar_url || "https://i.pravatar.cc/150?img=1" }} style={styles.chatAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.chatNome}>@{conversaAberta.outro.username || conversaAberta.outro.nome}</Text>
              <Text style={styles.chatStatus}>Online • Toque para ver perfil</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuConversa(conversaAberta)}><Text style={styles.tresPontos}>⋮</Text></TouchableOpacity>
        </View>

        <ScrollView style={styles.mensagensArea} contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
          {conversaAberta.mensagens.length === 0 && <Text style={styles.vazio}>Nenhuma mensagem. Mande um oi!</Text>}
          {conversaAberta.mensagens.map((m) => (
            <TouchableOpacity key={m.id} onLongPress={() => { if (m.minha) setMensagemParaApagar({ conversaId: conversaAberta.id, mensagemId: m.id }); }} style={[styles.bolha, m.minha ? styles.bolhaMinha : styles.bolhaDeles]}>
              <Text style={[styles.bolhaTexto, m.minha ? { color: "#fff" } : {}]}>{m.texto}</Text>
              <Text style={[styles.bolhaHora, m.minha ? { color: "#E8E0D8" } : {}]}>{m.hora}{m.minha ? " • Segure para apagar" : ""}</Text>
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
              <TouchableOpacity style={styles.menuItem} onPress={() => { if (menuConversa) { setPerfilVisitado(menuConversa.outro); setMenuConversa(null); setShowPerfil(true); } }}><Text style={styles.menuItemTexto}>Visitar perfil</Text></TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { if (menuConversa) limparConversa(menuConversa.id); }}><Text style={styles.menuItemTexto}>Limpar conversa</Text></TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuConversa(null); setShowDenunciar(true); }}><Text style={styles.menuItemTexto}>Denunciar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => { if (menuConversa) apagarConversa(menuConversa.id); }}><Text style={[styles.menuItemTexto, { color: "#ff5a5a" }]}>Apagar conversa</Text></TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showDenunciar} transparent animationType="fade" onRequestClose={() => setShowDenunciar(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBoxGrande}>
              <Text style={styles.modalTitle}>Denunciar @{conversaAberta.outro.username}</Text>
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
                <Image source={{ uri: perfilVisitado.avatar_url || "https://i.pravatar.cc/150?img=1" }} style={styles.perfilAvatar} />
                <Text style={styles.perfilNome}>@{perfilVisitado.username || perfilVisitado.nome}</Text>
                <Text style={styles.perfilBio}>{perfilVisitado.bio || "Membro da comunidade Acompanhe."}</Text>
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
              <Text style={styles.modalSub}>Essa mensagem será apagada para todos.</Text>
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
        <TouchableOpacity style={styles.novaBtn} onPress={() => { carregarUsuarios(); setShowNovaMensagem(true); }}><Text style={styles.novaBtnTexto}>+ Nova</Text></TouchableOpacity>
      </View>

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
          <Image source={{ uri: c.outro.avatar_url || "https://i.pravatar.cc/150?img=1" }} style={styles.avatar} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.nome, c.naoLidas > 0 && { fontWeight: "800" }]} numberOfLines={1}>@{c.outro.username || c.outro.nome}</Text>
            <Text style={[styles.ultima, c.naoLidas > 0 && { color: "#1C1C1C", fontWeight: "700" }]} numberOfLines={1}>{c.ultima}</Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={[styles.tempo, c.naoLidas > 0 && { color: "#B08D57", fontWeight: "800" }]}>{c.tempo}</Text>
            {c.naoLidas > 0 && (<View style={styles.badge}><Text style={styles.badgeTexto}>{c.naoLidas > 99 ? "99+" : c.naoLidas}</Text></View>)}
          </View>
          <TouchableOpacity onPress={() => setMenuConversa(c)} style={styles.tresPontosBtn}><Text style={styles.tresPontos}>⋮</Text></TouchableOpacity>
        </TouchableOpacity>
      ))}

      <Modal visible={!!menuConversa && !conversaAbertaId} transparent animationType="fade" onRequestClose={() => setMenuConversa(null)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuConversa(null)}>
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { if (menuConversa) { setPerfilVisitado(menuConversa.outro); setMenuConversa(null); setShowPerfil(true); } }}><Text style={styles.menuItemTexto}>Visitar perfil</Text></TouchableOpacity>
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
            <Text style={styles.label}>Buscar usuário</Text>
            <TextInput style={styles.inputModal} value={buscaUsuario} onChangeText={setBuscaUsuario} placeholder="Buscar por nome ou @usuario" />
            <ScrollView style={{ maxHeight: 220, marginTop: 10 }}>
              {usuariosFiltrados.map((u) => (
                <TouchableOpacity key={u.id} style={[styles.usuarioRow, outroSelecionado?.id === u.id ? { backgroundColor: "#F7F2EC", borderColor: "#B08D57" } : {}]} onPress={() => setOutroSelecionado(u)}>
                  <Image source={{ uri: u.avatar_url || "https://i.pravatar.cc/150?img=1" }} style={styles.usuarioAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "700" }}>{u.nome || u.username}</Text>
                    <Text style={{ color: "#666", fontSize: 13 }}>@{u.username || u.nome}</Text>
                  </View>
                  {outroSelecionado?.id === u.id && <Text style={{ color: "#B08D57", fontWeight: "800" }}>✓</Text>}
                </TouchableOpacity>
              ))}
              {usuariosFiltrados.length === 0 && <Text style={styles.vazio}>Nenhum usuário encontrado. Crie outro usuário para testar.</Text>}
            </ScrollView>
            <TouchableOpacity style={[styles.verPerfilBtn, { marginTop: 12, opacity: outroSelecionado ? 1 : 0.5 }]} disabled={!outroSelecionado} onPress={() => outroSelecionado && criarOuAbrirConversa(outroSelecionado)}><Text style={styles.verPerfilTexto}>Começar conversa</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancelarBtn} onPress={() => { setShowNovaMensagem(false); setOutroSelecionado(null); }}><Text style={styles.cancelarTexto}>Cancelar</Text></TouchableOpacity>
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
              <Image source={{ uri: perfilVisitado.avatar_url || "https://i.pravatar.cc/150?img=1" }} style={styles.perfilAvatar} />
              <Text style={styles.perfilNome}>@{perfilVisitado.username || perfilVisitado.nome}</Text>
              <Text style={styles.perfilBio}>{perfilVisitado.bio || "Membro da comunidade Acompanhe."}</Text>
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
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#E8E0D8", marginRight: 4 },
  nome: { fontWeight: "700", color: "#1C1C1C", fontSize: 15 },
  ultima: { fontSize: 13, color: "#6B6B6B", marginTop: 2 },
  tempo: { fontSize: 12, color: "#6B6B6B" },
  cardRight: { width: 52, flexShrink: 0, alignItems: "flex-end", justifyContent: "center" },
  badge: { backgroundColor: "#B08D57", borderRadius: 999, minWidth: 22, height: 22, alignItems: "center", justifyContent: "center", marginTop: 6, paddingHorizontal: 6 },
  badgeTexto: { color: "#fff", fontSize: 12, fontWeight: "700" },
  tresPontosBtn: { width: 28, flexShrink: 0, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
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
  usuarioRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 10, marginBottom: 8 },
  usuarioAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E8E0D8" },
});