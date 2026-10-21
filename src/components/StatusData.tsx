// src/components/StatusData.tsx
import { Text, View } from "react-native";
import { useTema } from "../theme/tema";
import { SumberData } from "../types/cache";

interface StatusDataProps {
  sumber: SumberData;
  disimpanPada: number;
}

function formatUmur(disimpanPada: number): string {
  const menit = Math.floor((Date.now() - disimpanPada) / 60000);
  if (menit < 1) return "baru saja";
  if (menit < 60) return menit + " menit lalu";
  const jam = Math.floor(menit / 60);
  if (jam < 24) return jam + " jam lalu";
  return Math.floor(jam / 24) + " hari lalu";
}

function labelSumber(sumber: SumberData): string {
  if (sumber === "jaringan") return "Data terbaru dari internet";
  if (sumber === "cache-segar") return "Data tersimpan (masih segar)";
  return "Mode offline - data tersimpan mungkin sudah usang";
}

export default function StatusData({ sumber, disimpanPada }: StatusDataProps) {
  const { warna } = useTema();
  const basi = sumber === "cache-basi";
  const label = labelSumber(sumber);
  const umur = formatUmur(disimpanPada);

  return (
    <View
      accessible
      accessibilityLabel={label + ", diperbarui " + umur}
      style={{
        padding: 8,
        borderRadius: 8,
        backgroundColor: basi ? warna.peringatanLatar : warna.suksesLatar,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          color: basi ? warna.peringatanTeks : warna.suksesTeks,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: 11, color: warna.teksPelan }}>
        Diperbarui {umur}
      </Text>
    </View>
  );
}