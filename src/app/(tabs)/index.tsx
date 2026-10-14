// src/app/(tabs)/index.tsx
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import BannerOffline from "../../components/Banneroffline";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import { labelKodeCuaca } from "../../constants/WeatherCodes";
import { useDebounce } from "../../hooks/use-debounce";
import { muatDataKota } from "../../services/dataKotaService";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { cariKota } from "../../services/geocodingService";
import {ambilKoordinatSaatIni,mintaIzinLokasi,} from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { HasilGeocoding } from "../../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../../types/weather";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
  const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(
    null,
  );
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [sudahFavorit, setSudahFavorit] = useState(false);
  const [dariCache, setDariCache] = useState(false);
  const [waktuData, setWaktuData] = useState(0);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  // Cek apakah kota terpilih sudah ada di favorit.
  // Berjalan saat kota berganti dan setiap kali Beranda kembali difokuskan.
  useFocusEffect(
    useCallback(() => {
      if (!kotaTerpilih) {
        setSudahFavorit(false);
        return;
      }
      ambilSemuaFavorit()
        .then((daftar) =>
          setSudahFavorit(daftar.some((k) => k.id === kotaTerpilih.id)),
        )
        .catch(() => setSudahFavorit(false));
    }, [kotaTerpilih]),
  );

  async function pilihKota(kota: HasilGeocoding) {
    setKotaTerpilih(kota);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);

    try {
      const data = await muatDataKota(kota.latitude, kota.longitude);
      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
      setCuaca(data.cuaca);
      setKualitasUdara(data.kualitasUdara);
      setDariCache(data.dariCache);
      setWaktuData(data.waktu);
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setCuaca(null);
      setKualitasUdara(null);
      setDariCache(false);
      setPesanError(
        "Belum ada data tersimpan untuk kota ini. Hubungkan ke internet sekali agar data bisa disimpan untuk mode offline.",
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();

    if (status === "denied") {
      setPesanLokasi(
        "Izin lokasi ditolak. Silakan cari kota secara manual di atas.",
      );
      return;
    }

    if (status === "unavailable") {
      setPesanLokasi(
        "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.",
      );
      return;
    }

    setPesanLokasi(null);

    try {
      const koordinat = await ambilKoordinatSaatIni();
      pilihKota({
        id: -1,
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
    } catch {
      setPesanLokasi(
        "Gagal mengambil lokasi. Silakan coba lagi atau cari kota secara manual.",
      );
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 16 }}>
      <SearchBox onCari={setTeksCari} />
      <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />
      {pesanLokasi && <Text>{pesanLokasi}</Text>}

      {hasilPencarian.map((kota) => (
        <TouchableOpacity key={kota.id} onPress={() => pilihKota(kota)}>
          <Text>
            {kota.name}
            {kota.admin1 ? `, ${kota.admin1}` : ""}
          </Text>
        </TouchableOpacity>
      ))}

      {sedangMemuat && <ActivityIndicator />}

      {pesanError && (
        <View>
          <Text>{pesanError}</Text>
          <Button
            title="Coba Lagi"
            onPress={() => kotaTerpilih && pilihKota(kotaTerpilih)}
          />
        </View>
      )}

      {cuaca && kualitasUdara && kotaTerpilih && !sedangMemuat && (
        <>
          {dariCache && <BannerOffline waktu={waktuData} />}
          <WeatherCard
            kota={kotaTerpilih.name}
            suhu={cuaca.saatIni.suhu}
            tingkatAQI={konversiTingkatAQI(kualitasUdara.indeksAQI)}
            indeksAQI={kualitasUdara.indeksAQI}
          />
          <Button
            title={sudahFavorit ? "Sudah di Favorit" : "Tambahkan ke Favorit"}
            disabled={sudahFavorit}
            onPress={() =>
              router.push({
                pathname: "/tambah-favorit",
                params: {
                  id: String(kotaTerpilih.id),
                  nama: kotaTerpilih.name,
                  lat: String(kotaTerpilih.latitude),
                  lon: String(kotaTerpilih.longitude),
                },
              })
            }
          />
        </>
      )}

      {cuaca && (
        <View>
          <Text style={{ fontSize: 12, color: "#888" }}>
            Kondisi: {labelKodeCuaca(cuaca.saatIni.kodeCuaca)} • Angin{" "}
            {cuaca.saatIni.kecepatanAngin} km/j
          </Text>
          <Text style={{ fontSize: 12, color: "#888" }}>
            Hari ini: maks {cuaca.harian.suhuMaksimal[0]}°C / min{" "}
            {cuaca.harian.suhuMinimal[0]}°C
          </Text>
        </View>
      )}

      {kualitasUdara && (
        <Text style={{ fontSize: 11, color: "#888", textAlign: "center" }}>
          PM2.5: {kualitasUdara.pm25} µg/m³ • PM10: {kualitasUdara.pm10} µg/m³
        </Text>
      )}

      <AtribusiCuaca />
    </SafeAreaView>
  );
}