import { useState, type CSSProperties, type ReactNode } from "react"
import { Box, Button, Dialog, DialogContent, Stack, Typography, useMediaQuery } from "@mui/material"
import { keyframes } from "@mui/material/styles"
import ReplayRounded from "@mui/icons-material/ReplayRounded"
import GridViewRounded from "@mui/icons-material/GridViewRounded"
import UndoRounded from "@mui/icons-material/UndoRounded"
import { Link as RouterLink } from "react-router"

export type GameOutcome = "win" | "lose" | "draw"

interface ResultDialogProps {
  open: boolean
  outcome: GameOutcome
  headline: ReactNode
  detail?: ReactNode
  canUndo?: boolean
  onRestart: () => void
  onUndo?: () => void
  onClose: () => void
}

const CONFETTI_COLORS = ["#ffcf3f", "#ff6b6b", "#4dabf7", "#f783ac", "#51cf66", "#ff922b", "#845ef7"]

const confettiFall = keyframes`
  0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 1; }
  85% { opacity: 1; }
  100% { transform: translate3d(var(--drift), 105vh, 0) rotate(var(--spin)); opacity: 0; }
`

const popIn = keyframes`
  0% { transform: scale(0.4) rotate(-10deg); opacity: 0; }
  60% { transform: scale(1.12) rotate(3deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`

function createConfettiPieces() {
  return Array.from({ length: 70 }, (_, index) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.9,
    duration: 2.4 + Math.random() * 2,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 8,
    drift: -80 + Math.random() * 160,
    spin: 360 + Math.random() * 720,
    round: Math.random() > 0.65,
  }))
}

function Confetti() {
  const [pieces] = useState(createConfettiPieces)

  return (
    <Box aria-hidden sx={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
      {pieces.map((piece, index) => (
        <Box
          key={index}
          style={
            {
              left: `${piece.left}%`,
              width: piece.round ? piece.size : piece.size * 0.6,
              height: piece.round ? piece.size : piece.size * 1.5,
              backgroundColor: piece.color,
              borderRadius: piece.round ? "50%" : 2,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              "--drift": `${piece.drift}px`,
              "--spin": `${piece.spin}deg`,
            } as CSSProperties
          }
          sx={{
            position: "absolute",
            top: 0,
            animation: `${confettiFall} 3s ease-in 0s 2 both`,
          }}
        />
      ))}
    </Box>
  )
}

const OUTCOME_STYLE: Record<GameOutcome, { emoji: string; label: string; color: string }> = {
  win: { emoji: "🏆", label: "勝利", color: "success.main" },
  lose: { emoji: "🤖", label: "敗北", color: "error.main" },
  draw: { emoji: "🤝", label: "引き分け", color: "warning.main" },
}

export default function ResultDialog({
  open,
  outcome,
  headline,
  detail,
  canUndo,
  onRestart,
  onUndo,
  onClose,
}: ResultDialogProps) {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const style = OUTCOME_STYLE[outcome]

  return (
    <>
      {open && outcome === "win" && !prefersReducedMotion && <Confetti />}
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        aria-labelledby="result-dialog-title"
        aria-describedby="result-dialog-detail"
      >
        <DialogContent sx={{ textAlign: "center", pt: 4, pb: 3, px: { xs: 3, sm: 4 } }}>
          <Box
            aria-hidden
            sx={{
              fontSize: "4rem",
              lineHeight: 1,
              mb: 1.5,
              animation: `${popIn} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
            }}
          >
            {style.emoji}
          </Box>
          <Typography
            variant="overline"
            sx={{ color: style.color, fontWeight: 800, letterSpacing: "0.2em", display: "block" }}
          >
            {style.label}
          </Typography>
          <Typography id="result-dialog-title" variant="h5" component="h2" sx={{ fontWeight: 800, mb: 1 }}>
            {headline}
          </Typography>
          {detail && (
            <Typography id="result-dialog-detail" variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              {detail}
            </Typography>
          )}

          <Stack spacing={1.25} sx={{ mt: 3 }}>
            <Button variant="contained" size="large" startIcon={<ReplayRounded />} onClick={onRestart} autoFocus>
              もう一度挑戦する
            </Button>
            {outcome !== "win" && canUndo && onUndo && (
              <Button variant="outlined" startIcon={<UndoRounded />} onClick={onUndo}>
                1手戻ってやり直す
              </Button>
            )}
            <Stack direction="row" spacing={1.25}>
              <Button variant="text" fullWidth onClick={onClose}>
                盤面を確認
              </Button>
              <Button variant="text" fullWidth component={RouterLink} to="/" startIcon={<GridViewRounded />}>
                ゲーム一覧
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}
