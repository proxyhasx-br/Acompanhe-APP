export type User = {
  id: string;
  name: string;
  email: string;
};

export type Acompanhamento = {
  id: string;
  titulo: string;
  status: "ativo" | "pausado" | "concluido";
  criadoEm: string;
};