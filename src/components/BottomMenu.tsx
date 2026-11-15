import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";

export type Secao = "home" | "comunidade" | "busca" | "mensagens" | "perfil";

type Props = {
  ativa: Secao;
  onSelecionar: (secao: Secao) => void;
};

const ITENS: { id: Secao; titulo: string; icone: string }[] = [
  { id: "home", titulo: "Home", icone: "\u2302" },
  { id: "comunidade", titulo: "Comunidade", icone: "\u2661" },
  { id: "busca", titulo: "Busca", icone: "\u2315" },
  { id: "mensagens", titulo: "Mensagens", icone: "\u2709" },
  { id: "perfil", titulo: "Perfil", icone: "\u25CB" },
];

export function BottomMenu({ ativa, onSelecionar }: Props) {
  const { width } = useWindowDimensions();
  const isTabletOuWeb = width >= 768;
  const isCelularPequeno = width < 360;

  return (
    <View style={[styles.wrap, isTabletOuWeb && styles.wrapWeb]}>
      <View style={[styles.menu, isTabletOuWeb && styles.menuWeb]}>
        {ITENS.map((item) => {
          const selecionado = ativa === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelecionar(item.id)}
              hitSlop={8}
              style={({ pressed }) => [styles.item, { opacity: pressed ? 0.6 : 1 }]}
              accessibilityRole="button"
              accessibilityState={{ selected: selecionado }}
            >
              <View style={[styles.indicador, selecionado && styles.indicadorAtivo]} />
              <Text style={[styles.icone, selecionado && styles.textoAtivo]}>{item.icone}</Text>
              <Text
                style={[styles.titulo, { fontSize: isCelularPequeno ? 10 : 11 }, selecionado && styles.textoAtivo]}
                numberOfLines={1}
              >
                {item.titulo}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    backgroundColor: "#F5F0EB",
    paddingTop: 0,
  },
  wrapWeb: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
  menu: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8E0D8",
    paddingTop: 6,
    paddingBottom: 10,
    paddingHorizontal: 4,
    minHeight: 68,
  },
  menuWeb: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 20,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: "#E8E0D8",
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 2,
  },
  indicador: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginBottom: 4,
  },
  indicadorAtivo: {
    backgroundColor: "#B08D57",
  },
  icone: {
    fontSize: 20,
    lineHeight: 22,
    color: "#6B6B6B",
  },
  titulo: {
    color: "#6B6B6B",
    fontWeight: "600",
    marginTop: 2,
  },
  textoAtivo: {
    color: "#B08D57",
    fontWeight: "700",
  },
});
