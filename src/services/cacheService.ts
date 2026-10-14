import AsyncStorage from "@react-native-async-storage/async-storage";

const AWALAN = "@jelajah_aman:cache:";
const BATAS_WAKTU_MS = 8000;

export interface EntriCache<T> {
  data: T;
  waktu: number;
}

export interface HasilDenganCache<T> extends EntriCache<T> {
  dariCache: boolean;
}

export async function simpanCache<T>(kunci: string, data: T): Promise<void> {
  try {
    const entri: EntriCache<T> = { data, waktu: Date.now() };
    await AsyncStorage.setItem(AWALAN + kunci, JSON.stringify(entri));
  } catch {}
}

export async function ambilCache<T>(kunci: string): Promise<EntriCache<T> | null> {
  try {
    const json = await AsyncStorage.getItem(AWALAN + kunci);
    return json ? (JSON.parse(json) as EntriCache<T>) : null;
  } catch {
    return null;
  }
}

function denganBatasWaktu<T>(janji: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Waktu habis")), ms);
    janji.then(
      (nilai) => { clearTimeout(timer); resolve(nilai); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

// Online dulu; kalau gagal pakai data tersimpan; kalau kosong lempar error.
export async function denganCache<T>(
  kunci: string,
  ambil: () => Promise<T>
): Promise<HasilDenganCache<T>> {
  try {
    const data = await denganBatasWaktu(ambil(), BATAS_WAKTU_MS);
    await simpanCache(kunci, data);
    return { data, waktu: Date.now(), dariCache: false };
  } catch (err) {
    const tersimpan = await ambilCache<T>(kunci);
    if (tersimpan) return { ...tersimpan, dariCache: true };
    throw err;
  }
}

export function formatWaktu(ms: number): string {
  return new Date(ms).toLocaleString("id-ID", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}