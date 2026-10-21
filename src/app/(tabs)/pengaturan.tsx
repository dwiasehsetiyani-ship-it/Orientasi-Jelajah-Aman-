// src/app/(tabs)/pengaturan.tsx
import { useState } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { ModeTema, useTema } from "../../theme/tema";

const PILIHAN: { mode: ModeTema; label: string }[] = [
  { mode: "terang", label: "Terang" },
  { mode: "gelap", label: "Gelap" },
  { mode: "sistem", label: "Ikuti Sistem" },
];

export default function TabPengaturan() {
  const { warna, mode, setMode } = useTema();
  const [pesan, setPesan] = useState<string | null>(null);

  async function hapusDataTersimpan() {
    await hapusSemuaCache();
    setPesan("Data cuaca tersimpan sudah dihapus.");
  }

  return (
    <SafeAreaView
      style={{ flex: 1, padding: 16, gap: 12, backgroundColor: warna.latar }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold", color: warna.teks }}>
        Jelajah Aman
      </Text>
      <Text style={{ color: warna.teks }}>Versi 1.0.0</Text>

      <Text style={{ fontWeight: "bold", color: warna.teks, marginTop: 8 }}>
        Mode Tampilan
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {PILIHAN.map((p) => {
          const aktif = mode === p.mode;
          return (
            <TouchableOpacity
              key={p.mode}
              onPress={() => setMode(p.mode)}
              accessibilityRole="button"
              accessibilityState={{ selected: aktif }}
              accessibilityLabel={"Mode tampilan " + p.label}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: aktif ? warna.aksen : warna.garis,
                backgroundColor: aktif ? warna.aksen : warna.kartu,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: aktif ? "#FFFFFF" : warna.teks,
                  fontWeight: aktif ? "bold" : "normal",
                }}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button title="Hapus Data Cuaca Tersimpan" onPress={hapusDataTersimpan} />
      {pesan && (
        <Text style={{ color: warna.teks }} accessibilityLabel={pesan}>
          {pesan}
        </Text>
      )}
    </SafeAreaView>
  );
}