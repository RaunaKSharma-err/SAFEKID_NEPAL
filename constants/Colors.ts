type ColorShades = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};

type Colors = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  accentLight: string;
  background: string;
  backgroundSecondary: string;
  card: string;
  cardElevated: string;
  text: string;
  textLight: string;
  textMuted: string;
  border: string;
  borderLight: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  gradient: {
    primary: readonly [string, string];
    secondary: readonly [string, string];
    success: readonly [string, string];
    warm: readonly [string, string];
  };
  "wild-willow": ColorShades;
  "pine-green": ColorShades;
};

const colors: Colors = {
  primary: "#2e9e86", // pine-green 500
  primaryLight: "#75d3bc", // pine-green 300
  primaryDark: "#206559", // pine-green 700
  secondary: "#48b9a0", // pine-green 400
  secondaryLight: "#a8e7d5", // pine-green 200
  accent: "#1d5249", // pine-green 800
  accentLight: "#d4f3ea", // pine-green 100
  background: "#f2fbf8", // pine-green 50
  backgroundSecondary: "#d4f3ea", // pine-green 100
  card: "#f2fbf8", // pine-green 50
  cardElevated: "#a8e7d5", // pine-green 200
  text: "#1c453e", // pine-green 900
  textLight: "#206559", // pine-green 700
  textMuted: "#217868", // pine-green 600
  border: "#48b9a0", // pine-green 400
  borderLight: "#75d3bc", // pine-green 300
  error: "#ef4444", // Keeping original error color
  success: "#10b981", // Keeping original success color
  warning: "#f59e0b", // Keeping original warning color
  info: "#1d5249", // pine-green 800
  gradient: {
    primary: ["#75d3bc", "#2e9e86"] as const, // pine-green 300, 500
    secondary: ["#a8e7d5", "#48b9a0"] as const, // pine-green 200, 400
    success: ["#10b981", "#059669"] as const, // Keeping original success gradient
    warm: ["#f59e0b", "#ef4444"] as const, // Keeping original warm gradient
  },
  "wild-willow": { // Keeping wild-willow as is, as requested
    50: "#f6f7ee",
    100: "#ebedda",
    200: "#dadeb8",
    300: "#b5be7b",
    400: "#a6b16a",
    500: "#8a964c",
    600: "#6b763a",
    700: "#535b30",
    800: "#434a2a",
    900: "#3b4027",
    950: "#1e2211",
  },
  "pine-green": {
    50: "#f2fbf8",
    100: "#d4f3ea",
    200: "#a8e7d5",
    300: "#75d3bc",
    400: "#48b9a0",
    500: "#2e9e86",
    600: "#217868",
    700: "#206559",
    800: "#1d5249",
    900: "#1c453e",
    950: "#0b2824",
  },
};

export default colors;