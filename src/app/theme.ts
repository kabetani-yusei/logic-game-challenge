import { createTheme } from "@mui/material/styles"

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2d3142" },
    secondary: { main: "#ef8354" },
    background: {
      default: "#faf9f6",
      paper: "#ffffff",
    },
    text: {
      primary: "#2d3142",
      secondary: "#6b7280",
    },
    success: { main: "#059669" },
    error: { main: "#dc2626" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Noto Sans JP", system-ui, sans-serif',
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.03)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.05)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.03)",
        },
      },
    },
  },
})
