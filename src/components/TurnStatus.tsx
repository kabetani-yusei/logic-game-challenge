import type { ReactNode } from "react"
import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material"
import PersonRounded from "@mui/icons-material/PersonRounded"
import SmartToyRounded from "@mui/icons-material/SmartToyRounded"
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded"

export type TurnStatusKind = "player" | "ai" | "finished"

interface TurnStatusProps {
  kind: TurnStatusKind
  /** 終局時の結果。色分けに使う */
  outcome?: "win" | "lose" | "draw"
  message: ReactNode
  detail?: ReactNode
  aside?: ReactNode
}

const ICONS = {
  player: PersonRounded,
  ai: SmartToyRounded,
  finished: EmojiEventsRounded,
}

export default function TurnStatus({ kind, outcome = "win", message, detail, aside }: TurnStatusProps) {
  const Icon = ICONS[kind]
  const finishedAccent = outcome === "win" ? "success" : outcome === "lose" ? "error" : "warning"
  const accent = kind === "player" ? "primary" : kind === "ai" ? "secondary" : finishedAccent

  return (
    <Paper
      sx={{
        px: { xs: 2, sm: 2.5 },
        py: 1.75,
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
        borderLeft: "4px solid",
        borderLeftColor: `${accent}.main`,
        transition: "border-color 0.3s ease",
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flex: "1 1 220px", minWidth: 0 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            bgcolor: `${accent}.main`,
            color: `${accent}.contrastText`,
            position: "relative",
          }}
          aria-hidden
        >
          <Icon fontSize="small" />
          {kind === "ai" && (
            <CircularProgress
              size={48}
              thickness={2}
              color="secondary"
              sx={{ position: "absolute", top: -4, left: -4 }}
            />
          )}
        </Box>
        <Box sx={{ minWidth: 0 }} role="status" aria-live="polite" aria-atomic="true">
          <Typography sx={{ fontWeight: 700, lineHeight: 1.4 }}>{message}</Typography>
          {detail && (
            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
              {detail}
            </Typography>
          )}
        </Box>
      </Stack>
      {aside && <Box sx={{ ml: "auto" }}>{aside}</Box>}
    </Paper>
  )
}
