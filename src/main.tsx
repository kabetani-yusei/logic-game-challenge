import "./lib/zodConfig"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { CssBaseline, ThemeProvider } from "@mui/material"
import { RouterProvider } from "react-router/dom"
import "@fontsource-variable/inter/wght.css"
import "@fontsource-variable/noto-sans-jp/wght.css"
import { appTheme, COLOR_MODE_STORAGE_KEY } from "./app/theme"
import { router } from "./app/router"

const container = document.getElementById("root")

if (!container) {
  throw new Error("Root element #root not found")
}

createRoot(container).render(
  <StrictMode>
    <ThemeProvider theme={appTheme} modeStorageKey={COLOR_MODE_STORAGE_KEY} defaultMode="system" disableTransitionOnChange>
      <CssBaseline enableColorScheme />
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
