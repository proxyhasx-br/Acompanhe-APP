import { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Animated, ScrollView } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

function senhaForte(senha: string) {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(senha);
}

export default function Login({ navigation }: any) {
  const { signIn } = useAuth();
  const [modo, setModo] = useState<"login" | "cadastro">("login");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [nomeCadastro, setNomeCadastro] = useState("");
  const [usernameCadastro, setUsernameCadastro] = useState("");
  const [emailCadastro, setEmailCadastro] = useState("");
  const [senhaCadastro, setSenhaCadastro] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loadingCadastro, setLoadingCadastro] = useState(false);
  const [erroCadastro, setErroCadastro] = useState("");
  const [sucessoCadastro, setSucessoCadastro] = useState("");

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function trocarModo(novoModo: "login" | "cadastro") {
    if (novoModo === modo) return;
    setErro("");
    setErroCadastro("");
    setSucessoCadastro("");
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: novoModo === "cadastro" ? -8 : 8, duration: 120, useNativeDriver: true }),
      ]),
      Animated.timing(slideAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start(() => {
      setModo(novoModo);
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  }

  async function handleLogin() {
    setLoading(true);
    setErro("");
    const { error } = await signIn(email.trim(), senha);
    setLoading(false);
    if (error) setErro(error.message);
  }

  async function handleCadastro() {
    setErroCadastro("");
    setSucessoCadastro("");
    const nome = nomeCadastro.trim();
    const username = usernameCadastro.trim().toLowerCase().replace("@", "").replace(/\s/g, "");
    const emailC = emailCadastro.trim().toLowerCase();
    const senhaC = senhaCadastro;

    if (!nome) return setErroCadastro("Digite seu nome.");
    if (!username) return setErroCadastro("Escolha um @username.");
    if (username.length < 3) return setErroCadastro("O @username precisa ter no mínimo 3 letras.");
    if (!emailC.includes("@")) return setErroCadastro("Digite um e-mail válido.");
    if (!senhaForte(senhaC)) return setErroCadastro("Senha fraca. Use 8+ caracteres com letra, número e especial. Ex: Acompanh3!");
    if (senhaC !== confirmarSenha) return setErroCadastro("As senhas não conferem.");

    setLoadingCadastro(true);
    const { data, error } = await supabase.auth.signUp({
      email: emailC,
      password: senhaC,
      options: { data: { nome, username } },
    });
    if (error) {
      setLoadingCadastro(false);
      return setErroCadastro(error.message);
    }
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: emailC,
        nome,
        username,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
    }
    setLoadingCadastro(false);
    setSucessoCadastro("Conta criada! Agora é só entrar.");
    setEmail(emailC);
    setSenha("");
    setTimeout(() => trocarModo("login"), 800);
  }

  return (
    <View style={styles.outer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>Acompanhe</Text>
        <Text style={styles.subtitle}>{modo === "login" ? "Bem-vindo de volta" : "Crie sua conta para começar"}</Text>

        <View style={styles.abas}>
          <TouchableOpacity style={[styles.aba, modo === "login" && styles.abaAtiva]} onPress={() => trocarModo("login")}>
            <Text style={[styles.abaTexto, modo === "login" && styles.abaTextoAtivo]}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.aba, modo === "cadastro" && styles.abaAtiva]} onPress={() => trocarModo("cadastro")}>
            <Text style={[styles.abaTexto, modo === "cadastro" && styles.abaTextoAtivo]}>Cadastrar</Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
          <Text style={styles.title}>{modo === "login" ? "Entrar" : "Cadastre-se"}</Text>

          {modo === "login" ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#999"
                secureTextEntry
                autoComplete="current-password"
                value={senha}
                onChangeText={setSenha}
              />
              {erro ? <Text style={styles.erro}>{erro}</Text> : null}
              <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => trocarModo("cadastro")} style={styles.link}>
                <Text style={styles.linkTexto}>Não tem conta? <Text style={styles.linkBold}>Cadastre-se</Text></Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                value={nomeCadastro}
                onChangeText={setNomeCadastro}
              />
              <TextInput
                style={styles.input}
                placeholder="@username"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                value={usernameCadastro}
                onChangeText={(t) => setUsernameCadastro(t.toLowerCase().replace(/\s/g, ""))}
              />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                keyboardType="email-address"
                value={emailCadastro}
                onChangeText={setEmailCadastro}
              />
              <View style={styles.senhaRow}>
                <TextInput
                  style={[styles.input, styles.senhaInput]}
                  placeholder="Senha (mín. 8)"
                  placeholderTextColor="#999"
                  secureTextEntry={!mostrarSenha}
                  autoComplete="off"
                  textContentType="newPassword"
                  value={senhaCadastro}
                  onChangeText={setSenhaCadastro}
                />
                <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.mostrarBtn}>
                  <Text style={styles.mostrarTexto}>{mostrarSenha ? "Ocultar" : "Mostrar"}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.dicaSenha}>Mín. 8 caracteres, com letra, número e especial. Ex: Acompanh3!</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirmar senha"
                placeholderTextColor="#999"
                secureTextEntry={!mostrarSenha}
                autoComplete="off"
                textContentType="newPassword"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
              />
              {erroCadastro ? <Text style={styles.erro}>{erroCadastro}</Text> : null}
              {sucessoCadastro ? <Text style={styles.sucesso}>{sucessoCadastro}</Text> : null}
              <TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loadingCadastro}>
                {loadingCadastro ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar conta</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => trocarModo("login")} style={styles.link}>
                <Text style={styles.linkTexto}>Já tem conta? <Text style={styles.linkBold}>Entrar</Text></Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#fff", overflow: "hidden" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
    paddingHorizontal: 20,
    paddingVertical: 24,
    overflow: "hidden",
  },
  logo: { fontSize: 32, fontWeight: "800", textAlign: "center", color: "#B08D57", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: "#6B6B6B", textAlign: "center", marginTop: 6, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  form: { width: "100%", overflow: "hidden" },
  input: {
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  button: { alignSelf: "stretch", backgroundColor: "#B08D57", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  erro: { color: "red", marginBottom: 8, textAlign: "center" },
  sucesso: { color: "#2e7d32", marginBottom: 8, textAlign: "center", fontWeight: "700" },
  abas: { flexDirection: "row", backgroundColor: "#F0EDE8", borderRadius: 999, padding: 4, marginBottom: 20, alignSelf: "stretch" },
  aba: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: "center" },
  abaAtiva: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  abaTexto: { fontWeight: "700", color: "#6B6B6B" },
  abaTextoAtivo: { color: "#1C1C1C" },
  link: { marginTop: 16, alignItems: "center", paddingBottom: 8 },
  linkTexto: { color: "#6B6B6B", textAlign: "center" },
  linkBold: { color: "#B08D57", fontWeight: "800" },
 
  senhaRow: { flexDirection: "row", alignItems: "center", alignSelf: "stretch", marginBottom: 4 },
  senhaInput: { flex: 1, minWidth: 0, marginRight: 8, marginBottom: 0 },
  mostrarBtn: { width: 60, flexShrink: 0, alignItems: "center", justifyContent: "center", paddingVertical: 14 },
  mostrarTexto: { color: "#B08D57", fontWeight: "700", fontSize: 13 },
  dicaSenha: { fontSize: 12, color: "#888", marginBottom: 12, marginTop: 6, flexWrap: "wrap" },
});