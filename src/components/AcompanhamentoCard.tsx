import { View, Text, Image, StyleSheet, Pressable, Linking, useWindowDimensions } from "react-native";
import { Usuario } from "../types/user";

type Props = {
  usuario: Usuario;
};

export function AcompanhanteCard({ usuario }: Props) {
  const { width } = useWindowDimensions();
  const perfilUrl = `https://www.acompanhe.com.br/user/${usuario.username}`;

  function abrirPerfil() {
    Linking.openURL(perfilUrl);
  }

  const isCelularPequeno = width < 360;
  const isTabletOuWeb = width >= 768;

  const alturaCard = isTabletOuWeb ? 520 : 480;
  const paddingCard = isCelularPequeno ? 12 : 16;
  const tamanhoUsername = isCelularPequeno ? 16 : 18;
  const tamanhoTexto = isCelularPequeno ? 13 : 14;

  return (
    <View style={[styles.card, { height: alturaCard }]}>
      <Image
        source={{ uri: usuario.avatarUrl }}
        style={styles.fotoGrande}
        resizeMode="cover"
      />

      <View style={[styles.infoArea, { paddingHorizontal: paddingCard }]}>
        <Text style={[styles.username, { fontSize: tamanhoUsername }]} numberOfLines={1}>
          @{usuario.username}
        </Text>
        <Text style={[styles.texto, { fontSize: tamanhoTexto }]}>{usuario.idade} anos</Text>
        <Text style={[styles.texto, { fontSize: tamanhoTexto }]}>
          {usuario.endereco.cidade} - {usuario.endereco.estado}
        </Text>

        <View style={styles.botoesArea}>
          <Pressable
            onPress={abrirPerfil}
            hitSlop={8}
            style={({ pressed }) => [
              styles.botao,
              styles.botaoPrimario,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.textoBotaoPrimario, { fontSize: tamanhoTexto }]}>
              Ver perfil completo
            </Text>
          </Pressable>

          <Pressable
            onPress={abrirPerfil}
            hitSlop={8}
            style={({ pressed }) => [
              styles.botao,
              styles.botaoSecundario,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.textoBotaoSecundario, { fontSize: tamanhoTexto }]}>
              Outro
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    flexDirection: "column",
    justifyContent: "flex-start",
    // Sombra suave no lugar da borda preta
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  fotoGrande: {
    width: "100%",
    backgroundColor: "#E8E0D8",
    flex: 1,
  },
  infoArea: {
    paddingVertical: 16,
    justifyContent: "flex-start",
    gap: 4,
    backgroundColor: "#FFFFFF",
    minHeight: 148,
  },
  username: {
    fontWeight: "700",
    color: "#1C1C1C",
    letterSpacing: -0.2,
  },
  texto: {
    color: "#6B6B6B",
  },
  botoesArea: {
    gap: 10,
    marginTop: 12,
  },
  botao: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoPrimario: {
    backgroundColor: "#B08D57",
  },
  botaoSecundario: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D9D0C5",
  },
  textoBotaoPrimario: {
    color: "#1C1C1C",
    fontWeight: "700",
  },
  textoBotaoSecundario: {
    color: "#1C1C1C",
    fontWeight: "600",
  },
});