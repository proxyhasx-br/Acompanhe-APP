import { Usuario } from "../types/user";

export const acompanhantes: Usuario[] = [
  { id: "1", username: "proxyhasx", nome: "Lucas Pereira", email: "lucas@teste.com", papel: "usuario", ativo: true, avatarUrl: "https://i.pravatar.cc/150?img=12", telefone: "+55 27 90000-0001", dataNascimento: "1998-07-22", idade: 28, acompanhante: true, endereco: { rua: "Rua das Flores, 123", cidade: "Vitória", estado: "ES", cep: "29010-123" }, preferencias: { tema: "escuro", idioma: "pt-BR", receberEmails: false }, ultimoLoginEm: "2026-11-14T20:30:00Z", atualizadoEm: "2026-11-14T20:30:00Z" },
  { id: "2", username: "bia_vix", nome: "Beatriz Almeida", email: "bia@teste.com", papel: "usuario", ativo: true, avatarUrl: "https://i.pravatar.cc/150?img=47", telefone: "+55 27 90000-0002", dataNascimento: "2000-03-10", idade: 26, acompanhante: true, endereco: { rua: "Av. Beira Mar, 45", cidade: "Vitória", estado: "ES", cep: "29010-456" }, preferencias: { tema: "escuro", idioma: "pt-BR", receberEmails: false }, ultimoLoginEm: "2026-11-14T20:30:00Z", atualizadoEm: "2026-11-14T20:30:00Z" },
  { id: "3", username: "leo.eventos", nome: "Leonardo Costa", email: "leo@teste.com", papel: "usuario", ativo: true, avatarUrl: "https://i.pravatar.cc/150?img=33", telefone: "+55 27 90000-0003", dataNascimento: "1996-08-15", idade: 30, acompanhante: true, endereco: { rua: "Rua do Lazer, 78", cidade: "Vitória", estado: "ES", cep: "29010-789" }, preferencias: { tema: "escuro", idioma: "pt-BR", receberEmails: false }, ultimoLoginEm: "2026-11-14T20:30:00Z", atualizadoEm: "2026-11-14T20:30:00Z" },
  { id: "4", username: "cami_vix", nome: "Camila Souza", email: "cami@teste.com", papel: "usuario", ativo: true, avatarUrl: "https://i.pravatar.cc/150?img=44", telefone: "+55 27 90000-0004", dataNascimento: "1999-11-20", idade: 27, acompanhante: true, endereco: { rua: "Rua da Praia, 12", cidade: "Vila Velha", estado: "ES", cep: "29100-123" }, preferencias: { tema: "escuro", idioma: "pt-BR", receberEmails: false }, ultimoLoginEm: "2026-11-14T20:30:00Z", atualizadoEm: "2026-11-14T20:30:00Z" },
];

export const usuarioLogado = acompanhantes[0];

export type Post = {
  id: string;
  autor: string;
  nome: string;
  avatar: string;
  tempo: string;
  texto: string;
  tag: string;
  curtidas: number;
  comentarios: number;
  curtido: boolean;
};

export const postsIniciais: Post[] = [
  { id: "p1", autor: "bia_vix", nome: "Beatriz Almeida", avatar: "https://i.pravatar.cc/150?img=47", tempo: "há 2h", texto: "Recomendo para eventos corporativos. Pontual e super educada.", tag: "Eventos • Vitória", curtidas: 24, comentarios: 5, curtido: false },
  { id: "p2", autor: "leo.eventos", nome: "Leonardo Costa", avatar: "https://i.pravatar.cc/150?img=33", tempo: "há 5h", texto: "Ótimo para viajar junto. Conhece bem a região e monta roteiro.", tag: "Viagens • Vitória", curtidas: 18, comentarios: 3, curtido: false },
  { id: "p3", autor: "cami_vix", nome: "Camila Souza", avatar: "https://i.pravatar.cc/150?img=44", tempo: "ontem", texto: "Alguém já foi com a Bia para formatura? Quero indicação para sábado.", tag: "Festas • Vila Velha", curtidas: 9, comentarios: 12, curtido: false },
];

export type Conversa = { id: string; autor: string; avatar: string; ultima: string; tempo: string; naoLidas: number };
export const conversasIniciais: Conversa[] = [
  { id: "c1", autor: "bia_vix", avatar: "https://i.pravatar.cc/150?img=47", ultima: "Oi! Posso no sábado? Te mando os detalhes do evento...", tempo: "10:24", naoLidas: 2 },
  { id: "c2", autor: "leo.eventos", avatar: "https://i.pravatar.cc/150?img=33", ultima: "Roteiro de viagem pronto, quer que eu te mande?", tempo: "Ontem", naoLidas: 0 },
];