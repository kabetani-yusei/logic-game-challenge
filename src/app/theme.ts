import { createTheme } from "@mui/material/styles"

export const COLOR_MODE_STORAGE_KEY = "logic-game-challenge/color-mode"

const FONT_FAMILY = '"Inter Variable", "Noto Sans JP Variable", system-ui, -apple-system, "Hiragino Sans", sans-serif'

declare module "@mui/material/styles" {
  interface Palette {
    board: { felt: string; feltHover: string; line: string; hint: string }
  }
  interface PaletteOptions {
    board?: { felt: string; feltHover: string; line: string; hint: string }
  }
}

export const appTheme = createTheme({
  cssVariables: { colorSchemeSelector: "class", cssVarPrefix: "lgc" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#3d4a9e", light: "#6874c7", dark: "#2a3473", contrastText: "#ffffff" },
        secondary: { main: "#e2673a", light: "#f08a63", dark: "#b94a22", contrastText: "#ffffff" },
        success: { main: "#0f8a5f" },
        error: { main: "#d33030" },
        warning: { main: "#c77700" },
        background: { default: "#f6f5f1", paper: "#ffffff" },
        text: { primary: "#1f2335", secondary: "#5b6075" },
        divider: "rgba(31, 35, 53, 0.1)",
        board: { felt: "#2f7a55", feltHover: "#24603f", line: "#1d4e35", hint: "rgba(255,255,255,0.35)" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#9aa5ff", light: "#bcc3ff", dark: "#6c78d6", contrastText: "#0f1220" },
        secondary: { main: "#ff9a6e", light: "#ffb796", dark: "#d9754c", contrastText: "#1a0d07" },
        success: { main: "#3ccf91" },
        error: { main: "#ff6b6b" },
        warning: { main: "#ffb648" },
        background: { default: "#0f1220", paper: "#181c2e" },
        text: { primary: "#e8eaf5", secondary: "#a3a8c3" },
        divider: "rgba(232, 234, 245, 0.12)",
        board: { felt: "#2a6b4b", feltHover: "#337f5a", line: "#18432d", hint: "rgba(255,255,255,0.3)" },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: FONT_FAMILY,
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 700, textTransform: "none", letterSpacing: "0.02em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"palt" 1',
          WebkitTapHighlightColor: "transparent",
        },
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "0.01ms !important",
            animationIterationCount: "1 !important",
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 20, minHeight: 44 },
        sizeSmall: { minHeight: 36, paddingInline: 14 },
        sizeLarge: { minHeight: 52, paddingInline: 28, fontSize: "1rem" },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&:focus-visible": { outline: `2px solid ${theme.vars.palette.primary.main}`, outlineOffset: 2 },
        }),
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          border: `1px solid ${theme.vars.palette.divider}`,
        }),
        rounded: { borderRadius: 20 },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 24 },
      },
    },
    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 20,
          border: `1px solid ${theme.vars.palette.divider}`,
          "&::before": { display: "none" },
          "&.Mui-expanded": { margin: 0 },
          "&:first-of-type, &:last-of-type": { borderRadius: 20 },
        }),
      },
    },
  },
})
