import { CssBaseline, ThemeProvider } from "@mui/material"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { appTheme } from "./app/theme"
import HomePage from "./features/home/HomePage"
import PieceTakingGame from "./pages/PieceTakingGame"
import StrangeOthello from "./pages/StrangeOthello"
import ModMGame from "./pages/ModMGame"

export default function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/piece-taking" element={<PieceTakingGame />} />
          <Route path="/strange-othello" element={<StrangeOthello />} />
          <Route path="/mod-m" element={<ModMGame />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
