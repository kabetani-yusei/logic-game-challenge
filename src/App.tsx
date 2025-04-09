import type React from "react"
import { Card, CardContent, Typography, Button, Box, Container } from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from "react-router-dom"
import PieceTakingGame from "./pages/PieceTakingGame"
import StrangeOthello from "./pages/StrangeOthello"
import ModMGame from "./pages/ModMGame"

// テーマの設定を変更して、デフォルトのテキスト色を調整
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#9c27b0", // Purple
    },
    secondary: {
      main: "#3f51b5", // Blue
    },
    background: {
      default: "#121212",
      paper: "rgba(45, 45, 55, 0.8)",
    },
    text: {
      primary: "#f5f5f5",
      secondary: "#b0b0b0",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: "none",
          padding: "12px 16px",
          fontWeight: "bold",
          fontSize: "1.1rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "2px solid rgba(156, 39, 176, 0.5)",
          boxShadow: "0 4px 20px rgba(156, 39, 176, 0.2)",
          transition: "all 0.3s",
          "&:hover": {
            borderColor: "rgba(156, 39, 176, 0.8)",
            backgroundColor: "rgba(55, 55, 65, 0.8)",
          },
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
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", p: 3 }}>
        <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
        <Box sx={{ mt: "auto", width: "100%" }}>
          <Button
            component={RouterLink}
            to={to}
            variant="contained"
            fullWidth
            sx={{
              py: 1.5,
              background: "linear-gradient(45deg, #9c27b0 30%, #3f51b5 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #7b1fa2 30%, #303f9f 90%)",
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

// ゲームカードのラッパーコンポーネント
function GameCardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: "100%",
        padding: 2,
        // レスポンシブなサイズ設定
        flexBasis: {
          xs: "100%",
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
        background: "linear-gradient(to bottom, #1a1a2e, #16213e)",
        p: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ textAlign: "center" }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          fontWeight="bold"
          sx={{
            background: "linear-gradient(45deg, #f9a825, #f44336, #9c27b0)",
            backgroundClip: "text",
            textFillColor: "transparent",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2,
          }}
        >
          頭脳王に挑戦！
        </Typography>

        <Typography variant="h4" component="h2" gutterBottom color="text.secondary" sx={{ mb: 8 }}>
          必勝法を見抜いて、AIに勝利しよう
        </Typography>

        {/* Gridの代わりにflexboxを使用 */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            margin: -2, // ネガティブマージンでGameCardWrapperのpaddingを相殺
            mt: 4,
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
            <GameCard title="mod Mゲーム"
              description={
                <>
                  倍数にならないようにする数学パズル<br />
                  出典：AtCoder Regular Contest 185 A 問題
                </>
              }
              to="/mod-m" />
          </GameCardWrapper>
        </Box>
      </Container>
    </Box>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
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
