// src/app/_layout.tsx (root layout)
import { Stack } from "expo-router";
import { TemaProvider, useTema } from "../theme/tema";

function TumpukanLayar() {
  const { warna } = useTema();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: warna.kartu },
        headerTintColor: warna.teks,
        contentStyle: { backgroundColor: warna.latar },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="detail/[kota]" options={{ title: "Detail Cuaca" }} />
      <Stack.Screen
        name="tambah-favorit"
        options={{ presentation: "modal", title: "Tambah Favorit" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <TemaProvider>
      <TumpukanLayar />
    </TemaProvider>
  );
}