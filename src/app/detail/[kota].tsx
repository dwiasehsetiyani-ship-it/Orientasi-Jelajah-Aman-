// src/app/detail/[kota].tsx
import { router, useLocalSearchParams } from "expo-router";
import { Button, View } from "react-native";
import WeatherCard from "../../components/WeatherCard";
import { useTema } from "../../theme/tema";

export default function HalamanDetail() {
  const { warna } = useTema();
  const { kota } = useLocalSearchParams<{ kota: string }>();

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: warna.latar }}>
      <WeatherCard kota={kota} suhu={29} tingkatAQI="BAIK" />
      <Button
        title="Tambahkan ke Favorit"
        onPress={() => router.push("/tambah-favorit")}
      />
    </View>
  );
}