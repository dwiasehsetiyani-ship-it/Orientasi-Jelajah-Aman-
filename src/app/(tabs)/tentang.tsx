import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typeScale } from "../../constants/styles";

export default function TabTentang() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: spacing.besar,
      }}
    >
      <Text
        accessibilityLabel="Judul Halaman Tentang Aplikasi Jelajah Aman"
        style={{
          fontSize: typeScale.judul,
          fontWeight: "bold",
          marginBottom: spacing.sedang,
        }}
      >
        Jelajah Aman
      </Text>

      <Text
        style={{
          fontSize: typeScale.isi,
          color: "#666",
          marginBottom: spacing.sedang,
        }}
      >
        Panduan Informasi Cuaca untuk Perjalanan Aman
      </Text>

      <Text
        style={{
          fontSize: typeScale.subjudul,
          marginBottom: spacing.kecil,
        }}
      >
        Versi 1.0.0
      </Text>

      <Text
        style={{
          fontSize: typeScale.isi,
        }}
      >
        Dibuat oleh: Dwi Asih Setiani {"\n"}© 2025 orientasi jelajah aman. Semua
        hak dilindungi.
      </Text>
    </SafeAreaView>
  );
}
