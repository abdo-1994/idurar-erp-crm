import React from "react";
import { ActivityIndicator, GestureResponderEvent, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "./theme";

export function Button({
  title,
  onPress,
  color = colors.navy,
  variant = "solid",
  loading = false,
  disabled = false,
}: {
  title: string;
  onPress: (e: GestureResponderEvent) => void;
  color?: string;
  variant?: "solid" | "outline";
  loading?: boolean;
  disabled?: boolean;
}) {
  const isOutline = variant === "outline";
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        isOutline
          ? { backgroundColor: "transparent", borderWidth: 1.5, borderColor: color }
          : { backgroundColor: color },
        (disabled || loading) && { opacity: 0.6 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? color : colors.white} />
      ) : (
        <Text style={[styles.text, { color: isOutline ? color : colors.white }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontSize: 15, fontWeight: "700" },
});
