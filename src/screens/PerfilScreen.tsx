import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export default function PerfilScreen() {
  const { user, signOut } = useAuth();
  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("nome, bio, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setNome(data.nome || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || null);
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  async function handlePickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !user) return;

    try {
      setUploading(true);
      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();
      const filePath = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { upsert: true, contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      console.log("URL da foto:", publicUrl);
      setAvatarUrl(publicUrl);

      await supabase
        .from("profiles")
        .upsert({ id: user.id, email: user.email, avatar_url: publicUrl, updated_at: new Date().toISOString() }, { onConflict: "id" });

      Alert.alert("Foto atualizada", "Sua foto de perfil foi salva.");
    } catch (e: any) {
      console.log("Erro na foto:", e);
      Alert.alert("Erro na foto", e.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    console.log("Tentando salvar:", user.id, nome, bio, avatarUrl);

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        nome: nome.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" })
      .select()
      .single();

    console.log("Resultado do salvar:", data, error);
    setSaving(false);
    if (error) Alert.alert("Erro ao salvar", error.message);
    else Alert.alert("Salvo", "Seu perfil foi atualizado.");
  }

  async function handleLogout() {
    Alert.alert("Sair", "Deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: async () => await signOut() },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#B08D57" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarWrap}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarLetter}>{nome ? nome[0].toUpperCase() : user?.email?.[0].toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.changePhoto}>{uploading ? "Enviando..." : "Trocar foto"}</Text>
      </TouchableOpacity>

      <Text style={styles.email}>{user?.email}</Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Seu nome" />

      <Text style={styles.label}>Bio</Text>
      <TextInput style={[styles.input, { height: 80 }]} value={bio} onChangeText={setBio} placeholder="Fale um pouco sobre você" multiline />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveText}>{saving ? "Salvando..." : "Salvar perfil"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  avatarWrap: { alignItems: "center", marginBottom: 8 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: { backgroundColor: "#B08D57", alignItems: "center", justifyContent: "center" },
  avatarLetter: { color: "#fff", fontSize: 48, fontWeight: "bold" },
  changePhoto: { color: "#B08D57", fontWeight: "bold", marginTop: 8 },
  email: { color: "#888", marginBottom: 12, textAlign: "center" },
  label: { fontWeight: "bold", marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12 },
  saveButton: { backgroundColor: "#B08D57", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 20 },
  saveText: { color: "#fff", fontWeight: "bold" },
  logoutButton: { borderWidth: 1, borderColor: "#ff5a5a", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 12 },
  logoutText: { color: "#ff5a5a", fontWeight: "bold" },
});