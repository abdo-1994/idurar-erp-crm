import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "./theme";

export function SectionHeader({ title, accentColor = colors.navy }: { title: string; accentColor?: string }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.bar, { backgroundColor: accentColor }]} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  bar: { width: 4, height: 16, borderRadius: 2 },
  title: { fontSize: 13, fontWeight: "700", color: colors.gray900 },
});
