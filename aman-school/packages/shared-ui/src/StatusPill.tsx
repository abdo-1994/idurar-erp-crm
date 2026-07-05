import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "./theme";

export type StatusTone = "success" | "warning" | "info" | "danger" | "neutral";

const TONE_STYLES: Record<StatusTone, { bg: string; fg: string }> = {
  success: { bg: colors.greenLight, fg: colors.greenMid },
  warning: { bg: colors.amberLight, fg: colors.amber },
  info: { bg: colors.blueLight, fg: colors.blueMid },
  danger: { bg: colors.redLight, fg: colors.red },
  neutral: { bg: colors.gray100, fg: colors.gray600 },
};

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: StatusTone }) {
  const s = TONE_STYLES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 2, alignSelf: "flex-start" },
  text: { fontSize: 11, fontWeight: "700" },
});
