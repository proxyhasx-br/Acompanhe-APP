import { View, Text, Image, StyleSheet, Pressable, Linking } from "react-native";
import { Usuario } from "../types/user";

type Props = {
  usuario: Usuario;
};

export function AcompanhanteCard({ usuario }: Props) {
  const perfilUrl = `https://www.acompanhe.com.br/user/${usuario.username}`;

  function abrirPerfil() {
    Linking.openURL(perfilUrl);
  }

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: usuario.avatarUrl }}
        style={styles.fotoGrande}
      />

      <View style={styles.infoArea}>
        <Text style={styles.username}>@{usuario.username}</Text>
        <Text style={styles.texto}>{usuario.idade} anos</Text>
        <Text style={styles.texto}>{usuario.endereco.cidade} - {usuario.endereco.estado}</Text>

        <Pressable onPress={abrirPerfil}>
          <Text style={styles.verPerfil}>Ver perfil completo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 16,
    overflow: "hidden",
  },
  fotoGrande: {
    flex: 1,
    width: "100%",
    minHeight: 320,
    backgroundColor: "#FFD400",
  },
  infoArea: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
    backgroundColor: "#fff",
  },
  username: { fontWeight: "bold", color: "#000", fontSize: 18 },
  texto: { color: "#000", fontSize: 14 },
  verPerfil: { color: "#D60000", fontSize: 14, marginTop: 4, textDecorationLine: "underline", fontWeight: "bold" },
});