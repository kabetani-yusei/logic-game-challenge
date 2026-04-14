import type React from "react"
import { Card, CardContent, Typography, Button, Box, Container, CssBaseline } from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from "react-router-dom"
import PieceTakingGame from "./pages/PieceTakingGame"
import StrangeOthello from "./pages/StrangeOthello"
import ModMGame from "./pages/ModMGame"

const theme = createTheme({
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

interface GameCardProps {
  title: string
  description: React.ReactNode
  to: string
}

function GameCard({ title, description, to }: GameCardProps) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", p: { xs: 2.5, sm: 3.5 } }}
      >
        <Typography
          variant="h5"
          component="h3"
          gutterBottom
          sx={{
            fontSize: { xs: "1.25rem", sm: "1.4rem" },
            color: "text.primary",
          }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
          {description}
        </Typography>
        <Box sx={{ mt: "auto", width: "100%" }}>
          <Button
            component={RouterLink}
            to={to}
            variant="contained"
            fullWidth
            sx={{
              py: { xs: 1.2, sm: 1.5 },
              backgroundColor: "#ef8354",
              color: "#fff",
              fontSize: { xs: "0.9rem", sm: "1rem" },
              "&:hover": {
                backgroundColor: "#e06b3a",
              },
            }}
          >
            プレイする
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

function GameCardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: "100%",
        padding: 1.5,
        flexBasis: {
          xs: "100%",
          sm: "50%",
          md: "33.333%",
        },
      }}
    >
      {children}
    </Box>
  )
}

function HomePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: { xs: 2, sm: 4 },
      }}
    >
      <Container maxWidth="lg" sx={{ textAlign: "center" }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            color: "text.primary",
            mb: 1.5,
            fontSize: { xs: "2rem", sm: "3rem", md: "3.5rem" },
          }}
        >
          頭脳王に挑戦！
        </Typography>

        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            color: "text.secondary",
            fontWeight: 400,
            mb: { xs: 5, sm: 8 },
            fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" },
          }}
        >
          必勝法を見抜いて、AIに勝利しよう
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            margin: -1.5,
          }}
        >
          <GameCardWrapper>
            <GameCard
              title="駒取りゲーム"
              description="石を取り合うシンプルながら奥深い戦略ゲーム"
              to="/piece-taking"
            />
          </GameCardWrapper>

          <GameCardWrapper>
            <GameCard
              title="ストレンジオセロ"
              description="通常とは異なる初期盤面から始まるオセロ"
              to="/strange-othello"
            />
          </GameCardWrapper>

          <GameCardWrapper>
            <GameCard
              title="mod Mゲーム"
              description={
                <>
                  倍数にならないようにする数学パズル
                  <br />
                  出典：AtCoder Regular Contest 185 A 問題
                </>
              }
              to="/mod-m"
            />
          </GameCardWrapper>
        </Box>
      </Container>
    </Box>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/piece-taking" element={<PieceTakingGame />} />
          <Route path="/strange-othello" element={<StrangeOthello />} />
          <Route path="/mod-m" element={<ModMGame />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
