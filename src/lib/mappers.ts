import { Usuario } from "../types/user";

export function profileParaUsuario(profile: any, email = ""): Usuario {
  return {
    id: profile.id,
    username: profile.username,
    nome: profile.nome ?? "",
    email: email,
    papel: "usuario",
    ativo: profile.ativo ?? true,
    avatarUrl: profile.avatar_url ?? "",
    telefone: profile.telefone ?? "",
    dataNascimento: profile.data_nascimento ?? "",
    idade: profile.idade ?? 0,
    acompanhante: profile.acompanhante ?? false,
    endereco: {
      rua: profile.rua ?? "",
      cidade: profile.cidade ?? "",
      estado: profile.estado ?? "",
      cep: profile.cep ?? "",
    },
    preferencias: { tema: "escuro", idioma: "pt-BR", receberEmails: false },
    ultimoLoginEm: profile.updated_at ?? "",
    atualizadoEm: profile.updated_at ?? "",
  };
}