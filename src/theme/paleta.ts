export const paleta = {
  // Proporção 60-30-10
  fundoTela: "#F5F0EB", // 60%
  card: "#FFFFFF", // 30%
  destaque: "#B08D57", // 10%

  // Textos e neutros
  textoPrincipal: "#1C1C1C",
  textoSecundario: "#6B6B6B",
  bordaSutil: "#D9D0C5",
  placeholderFoto: "#E8E0D8",

  // Botões
  botaoPrimarioFundo: "#B08D57",
  botaoPrimarioTexto: "#1C1C1C",
  botaoSecundarioFundo: "transparent",
  botaoSecundarioBorda: "#D9D0C5",
  botaoSecundarioTexto: "#1C1C1C",

  // Formas
  raioCard: 20,
  raioBotao: 12,
  maxLarguraCard: 520,

  // Sombra do card
  sombraCor: "#000000",
  sombraOpacidade: 0.08,
  sombraRaio: 16,
  sombraOffset: { width: 0, height: 8 },
  elevationAndroid: 4,
};

export const tipografia = {
  nome: { tamanho: 18, tamanhoPequeno: 16, peso: "700" as const },
  texto: { tamanho: 14, tamanhoPequeno: 13, peso: "400" as const },
  botaoPrimario: { peso: "700" as const },
  botaoSecundario: { peso: "600" as const },
};