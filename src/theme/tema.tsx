// src/theme/tema.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type ModeTema = "terang" | "gelap" | "sistem";

export interface Warna {
  latar: string;
  kartu: string;
  teks: string;
  teksPelan: string;
  garis: string;
  aksen: string;
  peringatanLatar: string;
  peringatanTeks: string;
  suksesLatar: string;
  suksesTeks: string;
}

const TERANG: Warna = {
  latar: "#F2F2F2",
  kartu: "#F4F7FA",
  teks: "#111111",
  teksPelan: "#888888",
  garis: "#CCCCCC",
  aksen: "#2196F3",
  peringatanLatar: "#FEF3E2",
  peringatanTeks: "#B45309",
  suksesLatar: "#EAFBF6",
  suksesTeks: "#13795F",
};

const GELAP: Warna = {
  latar: "#121212",
  kartu: "#1E1E1E",
  teks: "#F2F2F2",
  teksPelan: "#A0A0A0",
  garis: "#444444",
  aksen: "#64B5F6",
  peringatanLatar: "#3A2A12",
  peringatanTeks: "#FBBF77",
  suksesLatar: "#12301F",
  suksesTeks: "#6EE7B7",
};

interface NilaiTema {
  mode: ModeTema;
  gelap: boolean;
  warna: Warna;
  setMode: (mode: ModeTema) => void;
}

const KUNCI_MODE = "@jelajah_aman:mode_tema";

const TemaContext = createContext<NilaiTema>({
  mode: "sistem",
  gelap: false,
  warna: TERANG,
  setMode: () => {},
});

export function TemaProvider({ children }: { children: ReactNode }) {
  const skemaSistem = useColorScheme();
  const [mode, setModeState] = useState<ModeTema>("sistem");

  useEffect(() => {
    AsyncStorage.getItem(KUNCI_MODE)
      .then((nilai) => {
        if (nilai === "terang" || nilai === "gelap" || nilai === "sistem") {
          setModeState(nilai);
        }
      })
      .catch(() => {});
  }, []);

  function setMode(baru: ModeTema) {
    setModeState(baru);
    AsyncStorage.setItem(KUNCI_MODE, baru).catch(() => {});
  }

  const nilai = useMemo<NilaiTema>(() => {
    const gelap =
      mode === "gelap" || (mode === "sistem" && skemaSistem === "dark");
    return { mode, gelap, warna: gelap ? GELAP : TERANG, setMode };
  }, [mode, skemaSistem]);

  return <TemaContext.Provider value={nilai}>{children}</TemaContext.Provider>;
}

export function useTema(): NilaiTema {
  return useContext(TemaContext);
}