/** Design tokens — carried over from the original product design doc (aman_school_screens_doc.jsx). */
export const colors = {
  navy: "#0B2447",
  blue: "#1A5276",
  blueMid: "#2E86C1",
  blueLight: "#EBF5FB",
  green: "#1E8449",
  greenMid: "#27AE60",
  greenLight: "#EAFAF1",
  amber: "#D68910",
  amberMid: "#F39C12",
  amberLight: "#FEF9E7",
  red: "#C0392B",
  redMid: "#E74C3C",
  redLight: "#FDEDEC",
  purple: "#6C3483",
  purpleMid: "#8E44AD",
  purpleLight: "#F5EEF8",
  teal: "#0E6655",
  tealMid: "#17A589",
  tealLight: "#E8F8F5",
  orange: "#A04000",
  orangeMid: "#D35400",
  orangeLight: "#FDEBD0",
  gray50: "#F8F9FA",
  gray100: "#F1F3F4",
  gray200: "#E8EAED",
  gray400: "#9AA0A6",
  gray600: "#5F6368",
  gray700: "#3C4043",
  gray900: "#0F172A",
  white: "#FFFFFF",
} as const;

/** Per-role accent color, matching the original design doc's app colors. */
export const roleColors = {
  owner: colors.purpleMid,
  sysadmin: colors.navy,
  partner: colors.orangeMid,
  school_admin: colors.amber,
  ops_room: colors.redMid,
  supervisor: colors.blueMid,
  parent: colors.greenMid,
  driver: colors.tealMid,
} as const;

export const spacing = (n: number) => n * 4;

/** Corner-radius scale — used consistently across Card/Button/inputs so the
 * whole app reads as one rounded, modern system instead of mismatched radii. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

/** Elevation presets (iOS shadow* + Android elevation together) — gives cards
 * and buttons a soft "lifted" look instead of a flat bordered box. */
export const shadow = {
  none: {},
  card: {
    shadowColor: "#0B2447",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  raised: {
    shadowColor: "#0B2447",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  floating: {
    shadowColor: "#0B2447",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export const typography = {
  h1: { fontSize: 22, fontWeight: "800" as const },
  h2: { fontSize: 18, fontWeight: "800" as const },
  h3: { fontSize: 15, fontWeight: "700" as const },
  body: { fontSize: 14, fontWeight: "400" as const },
  bodyStrong: { fontSize: 14, fontWeight: "700" as const },
  caption: { fontSize: 12, fontWeight: "400" as const },
  captionStrong: { fontSize: 12, fontWeight: "700" as const },
  micro: { fontSize: 11, fontWeight: "600" as const },
};
