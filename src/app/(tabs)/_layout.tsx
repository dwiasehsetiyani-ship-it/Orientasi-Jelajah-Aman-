// src/app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";
import { useTema } from "../../theme/tema";

type NamaIkon = ComponentProps<typeof Ionicons>["name"];

// Ikon solid saat tab aktif, ikon garis saat tidak aktif
function ikonTab(aktif: NamaIkon, tidakAktif: NamaIkon) {
  return function IkonTab({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) {
    return (
      <Ionicons name={focused ? aktif : tidakAktif} size={size} color={color} />
    );
  };
}

export default function TabLayout() {
  const { warna } = useTema();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: warna.kartu },
        headerTintColor: warna.teks,
        tabBarActiveTintColor: warna.aksen,
        tabBarInactiveTintColor: warna.teksPelan,
        tabBarStyle: {
          backgroundColor: warna.kartu,
          borderTopColor: warna.garis,
        },
        sceneStyle: { backgroundColor: warna.latar },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ikonTab("home", "home-outline"),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Favorit & Riwayat",
          tabBarLabel: "Favorit",
          tabBarIcon: ikonTab("heart", "heart-outline"),
        }}
      />
      <Tabs.Screen
        name="pengaturan"
        options={{
          title: "Pengaturan",
          tabBarIcon: ikonTab("settings", "settings-outline"),
        }}
      />
      <Tabs.Screen
        name="tentang"
        options={{
          title: "Tentang",
          tabBarIcon: ikonTab(
            "information-circle",
            "information-circle-outline",
          ),
        }}
      />
    </Tabs>
  );
}