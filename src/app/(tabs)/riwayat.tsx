// src/app/(tabs)/riwayat.tsx
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Button, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  daftarKotaTersimpan,
  hapusCacheKota,
} from "../../services/cacheRepository";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { konfirmasi } from "../../services/konfirmasi";
import {
  ambilRiwayat,
  kosongkanRiwayat,
} from "../../services/riwayatPencarian";
import { useTema } from "../../theme/tema";
import { RingkasanKotaTersimpan } from "../../types/cache";
import { KotaFavorit } from "../../types/favorit";

export default function TabRiwayat() {
  const { warna } = useTema();
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [riwayat, setRiwayat] = useState<string[]>([]);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>(
    [],
  );

  async function muatSemua() {
    setDaftarFavorit(await ambilSemuaFavorit());
    setRiwayat(await ambilRiwayat());
    setKotaTersimpan(await daftarKotaTersimpan().catch(() => []));
  }

  useFocusEffect(
    useCallback(() => {
      muatSemua();
    }, []),
  );

  function konfirmasiHapusFavorit(kota: KotaFavorit) {
    konfirmasi(
      "Yakin hapus " + kota.nama + "?",
      "Kota ini akan dihapus dari daftar favorit.",
      "Hapus",
      async () => {
        await hapusFavorit(kota.id);
        setDaftarFavorit((prev) => prev.filter((k) => k.id !== kota.id));
      },
    );
  }

  // UTS fitur 3: hapus cache satu kota, dengan konfirmasi
  function konfirmasiHapusCache(k: RingkasanKotaTersimpan) {
    konfirmasi(
      "Hapus cache kota?",
      "Data tersimpan untuk " + k.nama + " akan dihapus dari perangkat.",
      "Hapus",
      async () => {
        await hapusCacheKota(k.kunci);
        setKotaTersimpan((prev) => prev.filter((x) => x.kunci !== k.kunci));
      },
    );
  }

  // UTS fitur 2: klik riwayat -> buka Beranda dengan pencarian kota tersebut
  function cariUlang(teks: string) {
    router.navigate({
      pathname: "/",
      params: { cari: teks, t: String(Date.now()) },
    });
  }

  function hapusSemuaRiwayat() {
    konfirmasi(
      "Hapus semua riwayat?",
      "Seluruh riwayat pencarian akan dihapus.",
      "Hapus",
      async () => {
        await kosongkanRiwayat();
        setRiwayat([]);
      },
    );
  }

  const judulBagian = {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: warna.teks,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.latar }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={judulBagian}>Kota Favorit</Text>
        <Text style={{ color: warna.teks }}>
          Tersimpan {daftarFavorit.length} kota
        </Text>
        {daftarFavorit.length === 0 && (
          <Text style={{ color: warna.teksPelan }}>Belum ada kota favorit</Text>
        )}
        {daftarFavorit.map((kota) => (
          <View
            key={kota.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: warna.teks }}>{kota.nama}</Text>
            <Button title="Hapus" onPress={() => konfirmasiHapusFavorit(kota)} />
          </View>
        ))}

        <Text style={[judulBagian, { marginTop: 12 }]}>Riwayat Pencarian</Text>
        {riwayat.length === 0 && (
          <Text style={{ color: warna.teksPelan }}>
            Belum ada riwayat pencarian
          </Text>
        )}
        {riwayat.map((teks) => (
          <TouchableOpacity
            key={teks}
            onPress={() => cariUlang(teks)}
            accessibilityLabel={"Cari ulang " + teks}
          >
            <Text style={{ color: warna.aksen }}>{teks}</Text>
          </TouchableOpacity>
        ))}
        {riwayat.length > 0 && (
          <Button title="Hapus Semua Riwayat" onPress={hapusSemuaRiwayat} />
        )}

        <Text style={[judulBagian, { marginTop: 12 }]}>
          Kota Tersimpan di Perangkat
        </Text>
        {kotaTersimpan.length === 0 && (
          <Text style={{ color: warna.teksPelan }}>
            Belum ada data kota tersimpan
          </Text>
        )}
        {kotaTersimpan.map((k) => (
          <View
            key={k.kunci}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: warna.teks }}>{k.nama}</Text>
            <Button title="Hapus Cache" onPress={() => konfirmasiHapusCache(k)} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}