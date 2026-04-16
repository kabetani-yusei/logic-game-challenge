import { useMemo, type ReactNode } from "react"
import { Backdrop, Box, Button, Paper, Typography } from "@mui/material"
import { Link } from "react-router-dom"

interface ResultOverlayProps {
  open: boolean
  playerWon: boolean
  resultLabel: ReactNode
  onRestart: () => void
}

// --- Confetti ---

const CONFETTI_COLORS = [
  "#ffd700", "#ff6b6b", "#48dbfb", "#ff9ff3", "#1dd1a1",
  "#f368e0", "#ff9f43", "#54a0ff", "#00d2d3", "#feca57",
]

interface ConfettiPiece {
  left: number
  delay: number
  duration: number
  color: string
  width: number
  height: number
  drift: number
  spin: number
  shape: "rect" | "circle"
}

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, () => {
    const shape = Math.random() > 0.3 ? "rect" : "circle"
    const size = 5 + Math.random() * 9
    return {
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2.5 + Math.random() * 2.5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      width: shape === "rect" ? size * 0.6 : size,
      height: shape === "rect" ? size * 1.6 : size,
      drift: -60 + Math.random() * 120,
      spin: 600 + Math.random() * 400,
      shape,
    }
  })
}

// --- Sparkle ---

interface Sparkle {
  top: number
  left: number
  delay: number
  duration: number
  size: number
}

function generateSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, () => ({
    top: 10 + Math.random() * 80,
    left: 5 + Math.random() * 90,
    delay: Math.random() * 3,
    duration: 1.5 + Math.random(),
    size: 16 + Math.random() * 24,
  }))
}

const WIN_KEYFRAMES = `
@keyframes confetti-fall {
  0% {
    transform: translateY(-30px) translateX(0) rotate(0deg);
    opacity: 1;
  }
  75% { opacity: 1; }
  100% {
    transform: translateY(100vh) translateX(var(--drift)) rotate(var(--spin));
    opacity: 0;
  }
}
@keyframes win-entrance {
  0%   { transform: scale(0) rotate(-8deg); opacity: 0; }
  60%  { transform: scale(1.1) rotate(2deg); opacity: 1; }
  80%  { transform: scale(0.95) rotate(-1deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes trophy-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(-12px) scale(1.1); }
}
@keyframes sparkle-blink {
  0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
  50%      { transform: scale(1) rotate(180deg); opacity: 1; }
}
@keyframes btn-fade-in {
  0%   { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
`

// --- Shared buttons ---

function ActionButtons({ onRestart, animate }: { onRestart: () => void; animate?: boolean }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexDirection: { xs: "column", sm: "row" },
        width: { xs: "100%", sm: "auto" },
        maxWidth: 400,
        ...(animate && {
          opacity: 0,
          animation: "btn-fade-in 0.5s ease-out 0.8s forwards",
        }),
      }}
    >
      <Button
        variant="contained"
        onClick={onRestart}
        fullWidth
        sx={{
          borderRadius: 10,
          py: 1.2,
          backgroundColor: "#fff",
          color: "#2d3142",
          fontWeight: 700,
          fontSize: "0.95rem",
          "&:hover": { backgroundColor: "#f3f4f6" },
        }}
      >
        やり直す
      </Button>
      <Button
        component={Link}
        to="/"
        onClick={onRestart}
        variant="contained"
        fullWidth
        sx={{
          borderRadius: 10,
          py: 1.2,
          backgroundColor: "#2d3142",
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.95rem",
          whiteSpace: "nowrap",
          "&:hover": { backgroundColor: "#4f5d75" },
        }}
      >
        タイトルに戻る
      </Button>
    </Box>
  )
}

// --- Lose overlay ---

function LoseOverlay({ resultLabel, onRestart }: { resultLabel: ReactNode; onRestart: () => void }) {
  return (
    <Backdrop
      open
      sx={{
        zIndex: (theme) => theme.zIndex.modal,
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
      }}
    >
      <Paper
        sx={{
          p: { xs: 3, sm: 5 },
          mx: 2,
          textAlign: "center",
          maxWidth: 400,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 700 }}>
          ゲーム終了
        </Typography>
        <Box sx={{ px: 4, py: 2, borderRadius: 3, backgroundColor: "#fef2f2" }}>
          <Typography variant="h6" sx={{ color: "#dc2626", fontWeight: 700 }}>
            {resultLabel}
          </Typography>
        </Box>
        <ActionButtons onRestart={onRestart} />
      </Paper>
    </Backdrop>
  )
}

// --- Win overlay ---

function WinOverlay({ resultLabel, onRestart }: { resultLabel: ReactNode; onRestart: () => void }) {
  const confetti = useMemo(() => generateConfetti(80), [])
  const sparkles = useMemo(() => generateSparkles(12), [])

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: (theme) => theme.zIndex.modal,
        background:
          "radial-gradient(ellipse at 50% 40%, rgba(209,250,229,0.92) 0%, rgba(167,243,208,0.88) 50%, rgba(110,231,183,0.82) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Keyframes injected inline */}
      <style>{WIN_KEYFRAMES}</style>

      {/* Confetti */}
      {confetti.map((piece, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            top: -30,
            left: `${piece.left}%`,
            width: piece.width,
            height: piece.height,
            borderRadius: piece.shape === "circle" ? "50%" : "2px",
            backgroundColor: piece.color,
            "--drift": `${piece.drift}px`,
            "--spin": `${piece.spin}deg`,
            animation: `confetti-fall ${piece.duration}s ease-in ${piece.delay}s infinite`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Sparkles */}
      {sparkles.map((s, i) => (
        <Box
          key={`sparkle-${i}`}
          sx={{
            position: "absolute",
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            pointerEvents: "none",
            animation: `sparkle-blink ${s.duration}s ease-in-out ${s.delay}s infinite`,
            "&::before, &::after": {
              content: '""',
              position: "absolute",
              backgroundColor: "#ffd700",
              borderRadius: "2px",
            },
            "&::before": {
              top: "50%",
              left: "20%",
              width: "60%",
              height: "3px",
              transform: "translateY(-50%)",
            },
            "&::after": {
              left: "50%",
              top: "20%",
              width: "3px",
              height: "60%",
              transform: "translateX(-50%)",
            },
          }}
        />
      ))}

      {/* Main content */}
      <Box
        sx={{
          animation: "win-entrance 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 1.5, sm: 2.5 },
          zIndex: 1,
          px: 2,
        }}
      >
        {/* Trophy */}
        <Box
          sx={{
            fontSize: { xs: "4rem", sm: "5.5rem" },
            lineHeight: 1,
            animation: "trophy-bounce 1.5s ease-in-out 0.7s infinite",
            filter: "drop-shadow(0 4px 12px rgba(255,215,0,0.4))",
          }}
        >
          🏆
        </Box>

        {/* Result text */}
        <Typography
          sx={{
            fontSize: { xs: "2rem", sm: "3.2rem" },
            fontWeight: 900,
            color: "#065f46",
            textAlign: "center",
            lineHeight: 1.3,
            textShadow: "0 2px 8px rgba(6,95,70,0.15)",
            letterSpacing: "0.03em",
          }}
        >
          {resultLabel}
        </Typography>

        <Box sx={{ mt: { xs: 1, sm: 2 } }}>
          <ActionButtons onRestart={onRestart} animate />
        </Box>
      </Box>
    </Box>
  )
}

// --- Entry point ---

export default function ResultOverlay({ open, playerWon, resultLabel, onRestart }: ResultOverlayProps) {
  if (!open) return null

  return playerWon ? (
    <WinOverlay resultLabel={resultLabel} onRestart={onRestart} />
  ) : (
    <LoseOverlay resultLabel={resultLabel} onRestart={onRestart} />
  )
}
