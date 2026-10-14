import { GeocodingResponse, HasilGeocoding } from "../types/geocoding";
import { KOTA_LOKAL } from "../constants/kotaIndonesia";
import { ambilCache, simpanCache } from "./cacheService";

const BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const BATAS_WAKTU_MS = 4000;
const MAKS_HASIL = 8;

function cariLokal(nama: string): HasilGeocoding[] {
  const q = nama.trim().toLowerCase();
  return KOTA_LOKAL.filter((k) => k.name.toLowerCase().includes(q)).sort(
    (a, b) =>
      Number(!a.name.toLowerCase().startsWith(q)) -
      Number(!b.name.toLowerCase().startsWith(q))
  );
}

function gabungkan(...daftar: HasilGeocoding[][]): HasilGeocoding[] {
  const terlihat = new Set<string>();
  const hasil: HasilGeocoding[] = [];
  for (const k of daftar.flat()) {
    const kunci = `${k.name.toLowerCase()}|${k.latitude.toFixed(1)}|${k.longitude.toFixed(1)}`;
    if (terlihat.has(kunci)) continue;
    terlihat.add(kunci);
    hasil.push(k);
  }
  return hasil.slice(0, MAKS_HASIL);
}

// Urutan: API (online) -> cache pencarian -> daftar kota lokal
export async function cariKota(nama: string): Promise<HasilGeocoding[]> {
  const kunciCache = "cari:" + nama.trim().toLowerCase();
  const lokal = cariLokal(nama);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BATAS_WAKTU_MS);

  try {
    const url = `${BASE_URL}?name=${encodeURIComponent(nama)}&count=5&language=id&format=json`;
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Gagal memuat data (status ${response.status})`);
    const data: GeocodingResponse = await response.json();
    const dariApi = data.results ?? [];
    await simpanCache(kunciCache, dariApi);
    return gabungkan(dariApi, lokal);
  } catch {
    const tersimpan = await ambilCache<HasilGeocoding[]>(kunciCache);
    return gabungkan(tersimpan?.data ?? [], lokal);
  } finally {
    clearTimeout(timer);
  }
}