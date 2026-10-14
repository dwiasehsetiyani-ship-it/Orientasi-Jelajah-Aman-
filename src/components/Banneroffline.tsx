import { View, Text } from "react-native";
import { formatWaktu } from "../services/cacheService";

export default function BannerOffline({ waktu }: { waktu: number }) {
  return (
    <View accessibilityRole="alert" style={{ padding: 8, borderRadius: 8, backgroundColor: "#FFF3CD" }}>
      <Text style={{ color: "#664D03" }}>
        Mode offline: menampilkan data terakhir ({formatWaktu(waktu)})
      </Text>
    </View>
  );
}