import { DataCuacaLengkap, DataKualitasUdara } from "../types/weather";
import { ambilCuaca } from "./WeatherService";
import { ambilKualitasUdara } from "./airQualityService";
import { denganCache } from "./cacheService";

export interface DataKota {
  cuaca: DataCuacaLengkap;
  kualitasUdara: DataKualitasUdara;
  dariCache: boolean;
  waktu: number;
}

export async function muatDataKota(latitude: number, longitude: number): Promise<DataKota> {
  const kunci = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const [c, a] = await Promise.all([
    denganCache(`cuaca:${kunci}`, () => ambilCuaca(latitude, longitude)),
    denganCache(`aqi:${kunci}`, () => ambilKualitasUdara(latitude, longitude)),
  ]);
  return {
    cuaca: c.data,
    kualitasUdara: a.data,
    dariCache: c.dariCache || a.dariCache,
    waktu: Math.min(c.waktu, a.waktu),
  };
}