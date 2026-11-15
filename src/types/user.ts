export type Endereco = {
  rua: string;
  cidade: string;
  estado: string;
  cep: string;
};

export type Preferencias = {
  tema: "escuro" | "claro";
  idioma: string;
  receberEmails: boolean;
};

export type Usuario = {
  id: string;
  username: string;
  nome: string;
  email: string;
  senhaHash: string;
  papel: "usuario" | "admin" | "moderador";
  ativo: boolean;
  avatarUrl: string;
  telefone: string;
  dataNascimento: string;
  idade: number;
  acompanhante: boolean;
  endereco: Endereco;
  preferencias: Preferencias;
  ultimoLoginEm: string;
  atualizadoEm: string;
};