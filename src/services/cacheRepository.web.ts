// src/services/cacheRepository.web.ts
// Versi web: expo-sqlite belum stabil di browser, jadi cache memakai AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataCuacaLengkap, DataKualitasUdara } from "../types/weather";
import {
  DataTersimpan,
  KotaUntukCache,
  RingkasanKotaTersimpan,
} from "../types/cache";

const KUNCI_PENYIMPANAN = "@jelajah_aman:cache_cuaca_web";

interface Baris {
  kunci: string;
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
  cuaca: DataCuacaLengkap;
  kualitasUdara: DataKualitasUdara;
  disimpanPada: number;
}

async function bacaSemua(): Promise<Record<string, Baris>> {
  try {
    const json = await AsyncStorage.getItem(KUNCI_PENYIMPANAN);
    return json ? (JSON.parse(json) as Record<string, Baris>) : {};
  } catch {
    return {};
  }
}

async function tulisSemua(data: Record<string, Baris>): Promise<void> {
  await AsyncStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(data));
}

export function buatKunci(latitude: number, longitude: number): string {
  return latitude.toFixed(2) + "," + longitude.toFixed(2);
}

export async function simpanCache(
  kota: KotaUntukCache,
  cuaca: DataCuacaLengkap,
  kualitasUdara: DataKualitasUdara,
): Promise<void> {
  const semua = await bacaSemua();
  const kunci = buatKunci(kota.latitude, kota.longitude);
  semua[kunci] = {
    kunci,
    id: kota.id,
    nama: kota.nama,
    latitude: kota.latitude,
    longitude: kota.longitude,
    cuaca,
    kualitasUdara,
    disimpanPada: Date.now(),
  };
  await tulisSemua(semua);
}

export async function ambilCache(
  latitude: number,
  longitude: number,
): Promise<DataTersimpan | null> {
  const semua = await bacaSemua();
  const baris = semua[buatKunci(latitude, longitude)];
  if (!baris) return null;
  return {
    cuaca: baris.cuaca,
    kualitasUdara: baris.kualitasUdara,
    disimpanPada: baris.disimpanPada,
  };
}

export async function daftarKotaTersimpan(): Promise<RingkasanKotaTersimpan[]> {
  const semua = await bacaSemua();
  return Object.values(semua)
    .sort((a, b) => b.disimpanPada - a.disimpanPada)
    .slice(0, 5)
    .map((b) => ({
      kunci: b.kunci,
      id: b.id,
      nama: b.nama,
      latitude: b.latitude,
      longitude: b.longitude,
      disimpanPada: b.disimpanPada,
    }));
}

export async function bersihkanCacheLama(batasUmurMs: number): Promise<void> {
  const semua = await bacaSemua();
  const batas = Date.now() - batasUmurMs;
  for (const kunci of Object.keys(semua)) {
    if (semua[kunci].disimpanPada < batas) delete semua[kunci];
  }
  await tulisSemua(semua);
}

export async function hapusSemuaCache(): Promise<void> {
  await AsyncStorage.removeItem(KUNCI_PENYIMPANAN);
}

export async function hapusCacheKota(kunci: string): Promise<void> {
  const semua = await bacaSemua();
  delete semua[kunci];
  await tulisSemua(semua);
}