// src/services/riwayatPencarian.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const KUNCI = "@jelajah_aman:riwayat_pencarian";
const MAKS_RIWAYAT = 10;

export async function ambilRiwayat(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(KUNCI);
    return json ? (JSON.parse(json) as string[]) : [];
  } catch {
    return [];
  }
}

// Pencarian terbaru ada di urutan pertama, tanpa duplikat, maksimal 10
export async function tambahRiwayat(teks: string): Promise<void> {
  const bersih = teks.trim();
  if (bersih.length === 0) return;
  const daftar = await ambilRiwayat();
  const tanpaDuplikat = daftar.filter(
    (t) => t.toLowerCase() !== bersih.toLowerCase(),
  );
  const baru = [bersih, ...tanpaDuplikat].slice(0, MAKS_RIWAYAT);
  await AsyncStorage.setItem(KUNCI, JSON.stringify(baru));
}

export async function kosongkanRiwayat(): Promise<void> {
  await AsyncStorage.removeItem(KUNCI);
}