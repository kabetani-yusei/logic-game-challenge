import { useEffect, useState, type ReactNode } from "react"
import { Box, Card, CardActionArea, Chip, Container, Stack, Typography } from "@mui/material"
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded"
import { Link as RouterLink } from "react-router"
import { hasModMProgress } from "../mod-m/storage"
import { hasPieceTakingProgress } from "../piece-taking/storage"
import { hasStrangeOthelloProgress } from "../strange-othello/storage"

interface GameEntry {
  title: string
  description: string
  to: string
  tags: string[]
  accent: string
  illustration: ReactNode
  hasProgress: () => boolean
}

function PiecesIllustration() {
  const piles = [
    { color: "#3d6fd6", count: 4 },
    { color: "#e2a300", count: 3 },
    { color: "#d9443a", count: 2 },
  ]
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-end" }}>
      {piles.map((pile) => (
        <Stack key={pile.color} spacing={0.5}>
          {Array.from({ length: pile.count }, (_, index) => (
            <Box
              key={index}
              sx={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                bgcolor: pile.color,
                boxShadow: "inset 0 -3px 4px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  )
}

function OthelloIllustration() {
  const cells = ["w", "b", "b", "b", "b", "e", "w", "b", "e", "w", "b", "e", "b", "w", "e", "w"]
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 22px)",
        gap: "3px",
        p: "6px",
        borderRadius: 2,
        bgcolor: "#1d4e35",
      }}
    >
      {cells.map((cell, index) => (
        <Box key={index} sx={{ width: 22, height: 22, bgcolor: "#2f7a55", borderRadius: "3px", display: "grid", placeItems: "center" }}>
          {cell !== "e" && (
            <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: cell === "b" ? "#16182a" : "#f4f4f0" }} />
          )}
        </Box>
      ))}
    </Box>
  )
}

function CardsIllustration() {
  return (
    <Box sx={{ position: "relative", width: 120, height: 84 }}>
      {[1, 4, 3].map((value, index) => (
        <Box
          key={value}
          sx={{
            position: "absolute",
            left: index * 34,
            top: index === 1 ? 0 : 10,
            width: 48,
            height: 68,
            borderRadius: "10px",
            border: "2px solid",
            borderColor: index === 1 ? "#f0643c" : "#4c6ef5",
            bgcolor: index === 1 ? "#fff3ee" : "#eef2ff",
            color: index === 1 ? "#c2410c" : "#2b44c7",
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            fontSize: "1.4rem",
            transform: `rotate(${(index - 1) * 8}deg)`,
            boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
          }}
        >
          {value}
        </Box>
      ))}
    </Box>
  )
}

const GAMES: GameEntry[] = [
  {
    title: "駒取りゲーム",
    description: "3色のコマを交互に取り合い、最後の1個を取らされた方が負け。数の性質を見抜けるか？",
    to: "/piece-taking",
    tags: ["先手", "やさしい"],
    accent: "#3d6fd6",
    illustration: <PiecesIllustration />,
    hasProgress: hasPieceTakingProgress,
  },
  {
    title: "ストレンジオセロ",
    description: "通常とは異なる初期盤面から始まる 6×6 のオセロ。完全解析済みの AI に挑もう。",
    to: "/strange-othello",
    tags: ["先手", "ふつう"],
    accent: "#2f7a55",
    illustration: <OthelloIllustration />,
    hasProgress: hasStrangeOthelloProgress,
  },
  {
    title: "mod M ゲーム",
    description: "合計が 9 の倍数にならないようにカードを出し合う数学パズル。出典：AtCoder ARC185 A。",
    to: "/mod-m",
    tags: ["後手", "むずかしい"],
    accent: "#e2673a",
    illustration: <CardsIllustration />,
    hasProgress: hasModMProgress,
  },
]

function GameCard({ game, inProgress }: { game: GameEntry; inProgress: boolean }) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: "24px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 40px rgba(20, 24, 50, 0.12)",
          borderColor: game.accent,
        },
        "&:focus-within": { borderColor: game.accent },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={game.to}
        sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <Box
          sx={{
            height: 150,
            display: "grid",
            placeItems: "center",
            position: "relative",
            background: `linear-gradient(135deg, ${game.accent}22 0%, ${game.accent}08 100%)`,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
          aria-hidden
        >
          {game.illustration}
          {inProgress && (
            <Chip
              label="対局中"
              size="small"
              color="primary"
              sx={{ position: "absolute", top: 16, right: 16 }}
            />
          )}
        </Box>
        <Box sx={{ p: { xs: 2.5, sm: 3 }, display: "flex", flexDirection: "column", flex: 1, gap: 1.25 }}>
          <Typography variant="h5" component="h2" sx={{ fontSize: "1.3rem" }}>
            {game.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8, flex: 1 }}>
            {game.description}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", pt: 1 }}>
            {game.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ ml: "auto !important", alignItems: "center", color: game.accent, fontWeight: 800 }}
            >
              <Typography component="span" sx={{ fontWeight: 800, color: "inherit" }}>
                {inProgress ? "続きから" : "プレイ"}
              </Typography>
              <ArrowForwardRounded fontSize="small" />
            </Stack>
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
  )
}

export default function HomePage() {
  const [progress] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GAMES.map((game) => [game.to, game.hasProgress()])),
  )

  useEffect(() => {
    document.title = "頭脳王に挑戦！ | 必勝法を見抜いて AI に勝利しよう"
  }, [])

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, sm: 8 }, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ textAlign: "center", mb: { xs: 5, sm: 7 } }}>
        <Chip label="3つのロジックゲーム" color="secondary" variant="outlined" sx={{ mb: 2 }} />
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontSize: { xs: "2.25rem", sm: "3.25rem", md: "3.75rem" },
            mb: 2,
            background: "linear-gradient(120deg, #5865d6 0%, #9b59d0 45%, #e2673a 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          頭脳王に挑戦！
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: { xs: "1rem", sm: "1.15rem" }, maxWidth: 560, mx: "auto" }}>
          どのゲームにも必勝法があります。ルールの裏に隠れた法則を見抜いて、AI に勝利しよう。
        </Typography>
      </Box>

      <Box
        component="ul"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
          gap: { xs: 2.5, sm: 3 },
        }}
      >
        {GAMES.map((game) => (
          <Box component="li" key={game.to}>
            <GameCard game={game} inProgress={Boolean(progress[game.to])} />
          </Box>
        ))}
      </Box>
    </Container>
  )
}
