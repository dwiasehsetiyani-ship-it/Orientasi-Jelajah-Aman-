import { useState, useCallback } from "react";
import { View, Text, Button, Alert, Platform, TouchableOpacity } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { KotaFavorit } from "../../types/favorit";

export default function TabRiwayat() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);

  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then(setDaftarFavorit);
    }, [])
  );

  async function hapus(id: number) {
    await hapusFavorit(id);
    setDaftarFavorit((prev) => prev.filter((k) => k.id !== id));
  }

  function konfirmasiHapus(kota: KotaFavorit) {
    const judul = `Yakin hapus ${kota.nama}?`;

    // Alert.alert tidak jalan di web, pakai confirm bawaan browser
    if (Platform.OS === "web") {
      if (window.confirm(judul)) hapus(kota.id);
      return;
    }

    Alert.alert(judul, undefined, [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: () => hapus(kota.id) },
    ]);
  }

  function bukaDetail(kota: KotaFavorit) {
    router.push({
      pathname: "/detail/[kota]",
      params: {
        kota: kota.nama,
        id: String(kota.id),
        lat: String(kota.latitude),
        lon: String(kota.longitude),
      },
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Kota Favorit</Text>
      <Text>Tersimpan {daftarFavorit.length} kota</Text>
      {daftarFavorit.length === 0 && <Text>Belum ada kota favorit</Text>}

      {daftarFavorit.map((kota) => (
        <View
          key={kota.id}
          style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => bukaDetail(kota)}
            accessibilityLabel={`Lihat cuaca ${kota.nama}`}
          >
            <Text>{kota.nama}</Text>
          </TouchableOpacity>
          <Button title="Hapus" onPress={() => konfirmasiHapus(kota)} />
        </View>
      ))}
    </SafeAreaView>
  );
}