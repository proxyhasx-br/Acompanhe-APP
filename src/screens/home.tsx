import { View, StyleSheet } from "react-native";
import { AcompanhanteCard } from "../components/AcompanhamentoCard";
import { Usuario } from "../types/user";

const usuario: Usuario = {
  id: "f3a8c1e2-9b4d-4a7f-8c2e-1a9b3c4d5e6f",
  username: "proxyhasx",
  nome: "Lucas Pereira",
  email: "lucas.pereira@teste.com",
  senhaHash: "a9f3c8e1b2d4a7f6c9e0b1a2c3d4e5f6",
  papel: "usuario",
  ativo: true,
  avatarUrl: "https://i.pravatar.cc/150?img=12",
  telefone: "+55 27 98765-4321",
  dataNascimento: "1998-07-22",
  idade: 28,
  acompanhante: true,
  endereco: {
    rua: "Rua das Flores, 123",
    cidade: "Vitória",
    estado: "ES",
    cep: "29010-123",
  },
  preferencias: {
    tema: "escuro",
    idioma: "pt-BR",
    receberEmails: false,
  },
  ultimoLoginEm: "2026-11-14T20:30:00Z",
  atualizadoEm: "2026-11-14T20:30:00Z",
};

export function Home() {
  return (
    <View style={styles.container}>
      <AcompanhanteCard usuario={usuario} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    backgroundColor: "#F5F0EB",
    paddingHorizontal: null,
    paddingTop: null,
    paddingBottom: null,
  },
});