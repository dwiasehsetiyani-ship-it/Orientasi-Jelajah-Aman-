// src/components/SearchBox.tsx
import { useState } from "react";
import { TextInput, View } from "react-native";
import { useTema } from "../theme/tema";

interface SearchBoxProps {
  onCari: (teks: string) => void;
  // Jika diisi, kolom mengikuti nilai dari luar (dipakai saat riwayat diklik)
  nilai?: string;
}

export default function SearchBox({ onCari, nilai }: SearchBoxProps) {
  const { warna } = useTema();
  const [teksLokal, setTeksLokal] = useState("");
  const teks = nilai !== undefined ? nilai : teksLokal;

  function handleChange(nilaiBaru: string) {
    setTeksLokal(nilaiBaru);
    onCari(nilaiBaru);
  }

  return (
    <View>
      <TextInput
        placeholder="Cari nama kota..."
        placeholderTextColor={warna.teksPelan}
        value={teks}
        onChangeText={handleChange}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        style={{
          borderWidth: 1,
          padding: 8,
          borderRadius: 8,
          borderColor: warna.garis,
          color: warna.teks,
          backgroundColor: warna.kartu,
        }}
      />
    </View>
  );
}