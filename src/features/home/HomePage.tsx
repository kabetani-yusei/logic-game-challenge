import type { ReactNode } from "react"
import { Box, Button, Card, CardContent, Container, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"

interface GameCardProps {
  title: string
  description: ReactNode
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

function GameCardWrapper({ children }: { children: ReactNode }) {
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

export default function HomePage() {
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
