// app/index.tsx
import { View } from "react-native";
import { useState, useEffect } from "react";

import WeatherCard from "../../components/WeatherCard";
import SearchBox from "../../components/SearchBox";
import RiwayatList from "../../components/RiwayatList";
import IndikatorAQI from "../../components/IndikatorAQI";

export default function HalamanUtama() {
  const [kotaAktif, setKotaAktif] = useState("Pekalongan");
  const [riwayat, setRiwayat] = useState<string[]> (["Pekalongan"]);

  // Tambahkan useEffect untuk mencatat perubahan kota aktif
  useEffect(() => {
    console.log ("Kota aktif berubah menjadi:", kotaAktif);
  }, [kotaAktif]);

function handleCari(kota: string) {
  setKotaAktif(kota);
if (!riwayat.includes(kota)) {
  setRiwayat([...riwayat, kota]);
  }
}

return (
  <View style={{ padding: 16, paddingTop :45 , gap: 16 }}>
    <SearchBox onCari={handleCari} />
    <WeatherCard kota={kotaAktif} suhu={29} tingkatAQI="BAIK" />
    <RiwayatList daftarKota={riwayat} />

    <IndikatorAQI
      laporan={{
        kota: kotaAktif,
        indeksAQI: 45,
        tingkat: "BAIK",
        diperbaruiPada: "14 September 2026",
      }}
    />
  </View>
);
}