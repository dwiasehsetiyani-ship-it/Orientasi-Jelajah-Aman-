// src/app/(tabs)/index.tsx
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {ActivityIndicator,Button,ScrollView,Text,TouchableOpacity,View,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import SearchBox from "../../components/SearchBox";
import StatusData from "../../components/StatusData";
import WeatherCard from "../../components/WeatherCard";
import { labelKodeCuaca } from "../../constants/WeatherCodes";
import { useDebounce } from "../../hooks/use-debounce";
import {bersihkanCacheLama,daftarKotaTersimpan,hapusCacheKota,} from "../../services/cacheRepository";
import {ambilCuacaOfflineFirst,BATAS_CACHE_MS,} from "../../services/cuacaRepository";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { cariKota } from "../../services/geocodingService";
import { konfirmasi } from "../../services/konfirmasi";
import {ambilKoordinatSaatIni,mintaIzinLokasi,} from "../../services/locationService";
import { tambahRiwayat } from "../../services/riwayatPencarian";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { useTema } from "../../theme/tema";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache";
import { HasilGeocoding } from "../../types/geocoding";

export default function HalamanUtama() {
  const { warna } = useTema();
  // Dikirim dari tab Favorit & Riwayat saat sebuah riwayat pencarian diklik
  const { cari, t } = useLocalSearchParams<{ cari?: string; t?: string }>();

  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>(
    [],
  );
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [sudahFavorit, setSudahFavorit] = useState(false);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition

  async function muatKotaTersimpan() {
    setKotaTersimpan(await daftarKotaTersimpan());
  }

  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, []);

  // UTS fitur 2: riwayat yang diklik langsung memunculkan pencarian kota itu
  useEffect(() => {
    if (cari) setTeksCari(cari);
  }, [cari, t]);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  // Perbarui daftar tersimpan dan status favorit setiap Beranda difokuskan
  useFocusEffect(
    useCallback(() => {
      muatKotaTersimpan().catch(() => {});
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

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);

    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui },
      );
      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
      setHasil(data);
      muatKotaTersimpan().catch(() => {});
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi.",
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  // Memilih kota dari hasil pencarian dicatat sebagai riwayat
  function pilihDariPencarian(kota: HasilGeocoding) {
    tambahRiwayat(kota.name).catch(() => {});
    pilihKota(kota);
  }

  // UTS fitur 3: hapus cache satu kota, dengan konfirmasi
  function hapusCache(k: RingkasanKotaTersimpan) {
    konfirmasi(
      "Hapus cache kota?",
      "Data tersimpan untuk " + k.nama + " akan dihapus dari perangkat.",
      "Hapus",
      async () => {
        await hapusCacheKota(k.kunci);
        await muatKotaTersimpan();
      },
    );
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
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.latar }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox onCari={setTeksCari} nilai={teksCari} />
        <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />
        {pesanLokasi && (
          <Text style={{ color: warna.teks }} accessibilityLabel={pesanLokasi}>
            {pesanLokasi}
          </Text>
        )}

        {hasilPencarian.map((kota) => (
          <TouchableOpacity
            key={kota.id}
            onPress={() => pilihDariPencarian(kota)}
          >
            <Text style={{ color: warna.teks }}>{kota.name}</Text>
          </TouchableOpacity>
        ))}

        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "bold", color: warna.teks }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>
            {kotaTersimpan.map((k) => (
              <View
                key={k.kunci}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() =>
                    pilihKota({
                      id: k.id,
                      name: k.nama,
                      latitude: k.latitude,
                      longitude: k.longitude,
                      country: "",
                    })
                  }
                >
                  <Text style={{ color: warna.teks }}>{k.nama}</Text>
                </TouchableOpacity>
                <Button title="Hapus" onPress={() => hapusCache(k)} />
              </View>
            ))}
          </View>
        )}

        {sedangMemuat && <ActivityIndicator />}

        {pesanError && (
          <View>
            <Text style={{ color: warna.teks }} accessibilityLabel={pesanError}>
              {pesanError}
            </Text>
            <Button
              title="Coba Lagi"
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            />
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData sumber={hasil.sumber} disimpanPada={hasil.disimpanPada} />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
              indeksAQI={hasil.kualitasUdara.indeksAQI}
            />
            <View>
              <Text style={{ fontSize: 12, color: warna.teksPelan }}>
                Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}{" "}
                {"\u2022"} Angin {hasil.cuaca.saatIni.kecepatanAngin} km/j
              </Text>
              <Text style={{ fontSize: 12, color: warna.teksPelan }}>
                Hari ini: maks {hasil.cuaca.harian.suhuMaksimal[0]}°C / min{" "}
                {hasil.cuaca.harian.suhuMinimal[0]}°C
              </Text>
              <Text style={{ fontSize: 11, color: warna.teksPelan }}>
                PM2.5: {hasil.kualitasUdara.pm25} µg/m³ {"\u2022"} PM10:{" "}
                {hasil.kualitasUdara.pm10} µg/m³
              </Text>
            </View>
            <Button
              title="Perbarui Sekarang"
              onPress={() => pilihKota(kotaTerpilih, true)}
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

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}