import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import WeatherCard from "../../components/WeatherCard";
import BannerOffline from "../../components/Banneroffline";
import { DataKota, muatDataKota } from "../../services/dataKotaService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { labelKodeCuaca } from "../../constants/WeatherCodes";

export default function HalamanDetail() {
    const { kota, id, lat, lon } = useLocalSearchParams<{
        kota: string; id?: string; lat?: string; lon?: string;
    }>();

    const latitude = Number(lat);
    const longitude = Number(lon);
    const adaKoordinat = lat !== undefined && lon !== undefined &&
        Number.isFinite(latitude) && Number.isFinite(longitude);

    const [data, setData] = useState<DataKota | null>(null);
    const [memuat, setMemuat] = useState(adaKoordinat);
    const [error, setError] = useState<string | null>(null);
    const [sudahFavorit, setSudahFavorit] = useState(false);

    useEffect(() => {
        if (!adaKoordinat) return;
        let batal = false;
        setMemuat(true);
        setError(null);
        muatDataKota(latitude, longitude)
            .then((hasil) => { if (!batal) setData(hasil); })
            .catch(() => {
                if (!batal) setError("Belum ada data tersimpan untuk kota ini. Hubungkan ke internet sekali untuk menyimpannya.");
            })
            .finally(() => { if (!batal) setMemuat(false); });
        return () => { batal = true; };
    }, [adaKoordinat, latitude, longitude]);

    useFocusEffect(
        useCallback(() => {
            if (id === undefined) return;
            ambilSemuaFavorit().then((daftar) =>
                setSudahFavorit(daftar.some((k) => k.id === Number(id)))
            );
        }, [id])
    );

    return (
        <View style={{ padding: 16, gap: 16 }}>
            {memuat && <ActivityIndicator />}
            {error && <Text>{error}</Text>}
            {!adaKoordinat && <Text>Koordinat kota tidak tersedia.</Text>}

            {data && (
                <>
                    {data.dariCache && <BannerOffline waktu={data.waktu} />}
                    <WeatherCard
                        kota={kota}
                        suhu={data.cuaca.saatIni.suhu}
                        tingkatAQI={konversiTingkatAQI(data.kualitasUdara.indeksAQI)}
                        indeksAQI={data.kualitasUdara.indeksAQI}
                    />
                    <Text style={{ fontSize: 12, color: "#888" }}>
                        Kondisi: {labelKodeCuaca(data.cuaca.saatIni.kodeCuaca)} • Angin {data.cuaca.saatIni.kecepatanAngin} km/j
                    </Text>
                    <Text style={{ fontSize: 11, color: "#888" }}>
                        PM2.5: {data.kualitasUdara.pm25} µg/m³ • PM10: {data.kualitasUdara.pm10} µg/m³
                    </Text>
                </>
            )}

            {adaKoordinat && id !== undefined && (
                <Button
                    title={sudahFavorit ? "Sudah di Favorit" : "Tambahkan ke Favorit"}
                    disabled={sudahFavorit}
                    onPress={() =>
                        router.push({ pathname: "/tambah-favorit", params: { id, nama: kota, lat, lon } })
                    }
                />
            )}
        </View>
    );
}