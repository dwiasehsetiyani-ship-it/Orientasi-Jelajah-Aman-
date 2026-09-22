// app/detail/[kota].tsx
import { Button, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import WeatherCard from "../../components/WeatherCard";

export default function HalamanDetail() {
    const { kota } = useLocalSearchParams<{ kota: string }>();
    return (
        <View style={{ padding: 16 }}>
            <WeatherCard kota={kota} suhu={29} tingkatAQI="BAIK" />
            <Button title="Tambahkan ke Favorit" onPress={() => router.push("/tambah-favorit")} />
        </View>
    );
}