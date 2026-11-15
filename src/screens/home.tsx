import { useRef, useState } from "react";
import { View, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { BottomMenu, Secao } from "../components/BottomMenu";
import { HomeScreen } from "./HomeScreen";
import { ComunidadeScreen } from "./ComunidadeScreen";
import { BuscaScreen } from "./BuscaScreen";
import { MensagensScreen } from "./MensagensScreen";
import { PerfilScreen } from "./PerfilScreen";

const ORDEM: Secao[] = ["home", "comunidade", "busca", "mensagens", "perfil"];

// Home aqui é o CONTAINER das telas
export function Home() {
  const pagerRef = useRef<any>(null);
  const [ativa, setAtiva] = useState<Secao>("home");
  const { width } = useWindowDimensions();

  function irPara(secao: Secao) {
    const i = ORDEM.indexOf(secao);
    setAtiva(secao);
    pagerRef.current?.scrollTo({ x: i * width, animated: true });
  }

  function aoMudarPagina(e: any) {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / width);
    const secao = ORDEM[i] ?? "home";
    if (secao !== ativa) setAtiva(secao);
  }

  return (
    <View style={styles.container}>
      <ScrollView ref={pagerRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={aoMudarPagina} scrollEventThrottle={16} style={styles.pager}>
        <View style={{ width, flex: 1 }}><HomeScreen /></View>
        <View style={{ width, flex: 1 }}><ComunidadeScreen /></View>
        <View style={{ width, flex: 1 }}><BuscaScreen /></View>
        <View style={{ width, flex: 1 }}><MensagensScreen /></View>
        <View style={{ width, flex: 1 }}><PerfilScreen /></View>
      </ScrollView>
      <BottomMenu ativa={ativa} onSelecionar={irPara} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", flex: 1, flexDirection: "column", backgroundColor: "#F5F0EB" },
  pager: { flex: 1, width: "100%" },
});
  