import React, { PropsWithChildren } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "./theme";

export function Card({
  children,
  accentColor,
  style,
}: PropsWithChildren<{ accentColor?: string; style?: ViewStyle }>) {
  return (
    <View
      style={[
        styles.card,
        accentColor ? { borderRightWidth: 4, borderRightColor: accentColor } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: 14,
    marginBottom: 10,
  },
});
