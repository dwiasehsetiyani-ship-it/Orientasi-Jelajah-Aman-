// src/app/(tabs)/tentang.tsx
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typeScale } from "../../constants/styles";
import { useTema } from "../../theme/tema";

export default function TabTentang() {
  const { warna } = useTema();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: spacing.besar,
        backgroundColor: warna.latar,
      }}
    >
      <Text
        accessibilityLabel="Judul Halaman Tentang Aplikasi Jelajah Aman"
        style={{
          fontSize: typeScale.judul,
          fontWeight: "bold",
          marginBottom: spacing.sedang,
          color: warna.teks,
        }}
      >
        Jelajah Aman
      </Text>

      <Text
        style={{
          fontSize: typeScale.isi,
          color: warna.teksPelan,
          marginBottom: spacing.sedang,
        }}
      >
        Panduan Informasi Cuaca untuk Perjalanan Aman
      </Text>

      <Text
        style={{
          fontSize: typeScale.subjudul,
          marginBottom: spacing.kecil,
          color: warna.teks,
        }}
      >
        Versi 1.0.0
      </Text>

      <Text
        style={{
          fontSize: typeScale.isi,
          color: warna.teks,
        }}
      >
        Dibuat oleh: Dwi Asih Setiani {"\n"}© 2025 orientasi jelajah aman. Semua
        hak dilindungi.
      </Text>
    </SafeAreaView>
  );
}