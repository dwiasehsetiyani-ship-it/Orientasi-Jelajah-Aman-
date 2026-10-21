// src/services/konfirmasi.ts
import { Alert, Platform } from "react-native";

// Konfirmasi lintas platform: Alert di HP, window.confirm di browser
export function konfirmasi(
  judul: string,
  pesan: string,
  labelOk: string,
  onOk: () => void,
) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(judul + "\n" + pesan)) {
      onOk();
    }
    return;
  }
  Alert.alert(judul, pesan, [
    { text: "Batal", style: "cancel" },
    { text: labelOk, style: "destructive", onPress: onOk },
  ]);
}