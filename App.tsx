import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, AppState } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { supabase } from "./src/lib/supabase";

import Login from "./src/screens/Login";
import { HomeScreen } from "./src/screens/HomeScreen";
import { BuscaScreen } from "./src/screens/BuscaScreen";
import { ComunidadeScreen } from "./src/screens/ComunidadeScreen";
import { MensagensScreen } from "./src/screens/MensagensScreen";
import PerfilScreen from "./src/screens/PerfilScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Conta todas as mensagens não lidas pra esse usuário, em tempo real
function useTotalNaoLidas() {
  const { user } = useAuth();
  const [total, setTotal] = useState(0);

  async function contar() {
    if (!user) { setTotal(0); return; }
    const { data: convs } = await supabase.from("conversas").select("id").or(`user1.eq.${user.id},user2.eq.${user.id}`);
    if (!convs || convs.length === 0) { setTotal(0); return; }
    const ids = convs.map((c: any) => c.id);
    const { count } = await supabase.from("mensagens").select("*", { count: "exact", head: true }).in("conversa_id", ids).neq("sender_id", user.id).eq("lida", false);
    setTotal(count || 0);
  }

  useEffect(() => {
    contar();
    if (!user) return;
    const channel = supabase.channel(`badge-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mensagens" }, () => contar())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "mensagens" }, () => contar())
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "mensagens" }, () => contar())
      // Quando o MensagensScreen marca como lido, ele manda esse broadcast pra zerar na hora
      .on("broadcast", { event: "refresh" }, () => contar())
      .subscribe();

    const sub = AppState.addEventListener("change", (s) => { if (s === "active") contar(); });
    return () => { supabase.removeChannel(channel); sub.remove(); };
  }, [user?.id]);

  return total;
}

function MainTabs() {
  const totalNaoLidas = useTotalNaoLidas();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#B08D57",
        tabBarInactiveTintColor: "#999",
        tabBarIcon: ({ color, size }) => {
          const icon = {
            Home: "⌂",
            Busca: "⌕",
            Comunidade: "♧",
            Mensagens: "◉",
            Perfil: "●",
          }[route.name] ?? "•";
          return <Text style={{ color, fontSize: size }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Busca" component={BuscaScreen} />
      <Tab.Screen name="Comunidade" component={ComunidadeScreen} />
      <Tab.Screen
        name="Mensagens"
        component={MensagensScreen}
        options={{
          tabBarBadge: totalNaoLidas > 0 ? totalNaoLidas : undefined,
          tabBarBadgeStyle: { backgroundColor: "#B08D57", color: "#fff", fontSize: 11, minWidth: 18, height: 18, lineHeight: 18 },
        }}
      />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

function Main() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#B08D57" />
      </View>
    );
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Main />
      </NavigationContainer>
    </AuthProvider>
  );
}