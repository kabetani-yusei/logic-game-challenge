import { Box, ButtonBase } from "@mui/material"
import type { ModMPlayer } from "./types"

const OWNER_STYLE: Record<ModMPlayer, { border: string; text: string; bg: string }> = {
  player: { border: "#4c6ef5", text: "#2b44c7", bg: "#eef2ff" },
  ai: { border: "#f0643c", text: "#c2410c", bg: "#fff3ee" },
}

interface NumberCardProps {
  value: number
  owner: ModMPlayer
  size?: "small" | "medium" | "large"
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
  ariaLabel?: string
}

const SIZES = {
  small: { width: { xs: 36, sm: 42 }, height: { xs: 50, sm: 58 }, fontSize: { xs: "1rem", sm: "1.15rem" } },
  medium: { width: { xs: 46, sm: 54 }, height: { xs: 64, sm: 76 }, fontSize: { xs: "1.3rem", sm: "1.5rem" } },
  large: { width: { xs: 58, sm: 68 }, height: { xs: 82, sm: 96 }, fontSize: { xs: "1.7rem", sm: "2rem" } },
}

export default function NumberCard({
  value,
  owner,
  size = "medium",
  onClick,
  disabled,
  danger,
  ariaLabel,
}: NumberCardProps) {
  const style = OWNER_STYLE[owner]
  const dimensions = SIZES[size]
  const sx = {
    ...dimensions,
    position: "relative",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
    color: style.text,
    bgcolor: style.bg,
    border: "2px solid",
    borderColor: style.border,
    boxShadow: "0 2px 0 rgba(0,0,0,0.08)",
    flexShrink: 0,
  } as const

  if (!onClick) {
    return (
      <Box sx={sx} aria-label={ariaLabel}>
        {value}
      </Box>
    )
  }

  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      sx={{
        ...sx,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": { transform: "translateY(-8px)", boxShadow: `0 10px 20px ${style.border}40` },
        "&.Mui-focusVisible": { outline: "3px solid", outlineColor: style.border, outlineOffset: 3 },
        "&.Mui-disabled": { opacity: 0.45 },
        ...(danger && {
          borderStyle: "dashed",
          "&::after": {
            content: '"⚠"',
            position: "absolute",
            top: -10,
            right: -10,
            width: 22,
            height: 22,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontSize: "0.75rem",
            bgcolor: "error.main",
            color: "#fff",
          },
        }),
      }}
    >
      {value}
    </ButtonBase>
  )
}
