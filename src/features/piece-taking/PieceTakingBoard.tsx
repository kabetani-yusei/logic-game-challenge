import { Box, ButtonBase, IconButton, Paper, Stack, Typography } from "@mui/material"
import { keyframes } from "@mui/material/styles"
import AddRounded from "@mui/icons-material/AddRounded"
import RemoveRounded from "@mui/icons-material/RemoveRounded"
import { COLOR_NAMES, PIECE_COLORS, PIECE_COLOR_ORDER } from "./constants"
import { getPieceCount } from "./logic"
import type { PieceColor, PieceTakingGameState } from "./types"

const ghostFade = keyframes`
  0% { opacity: 0.9; transform: translateY(0) scale(1); }
  100% { opacity: 0.25; transform: translateY(-6px) scale(0.85); }
`

function pieceStyle(color: PieceColor) {
  const palette = PIECE_COLORS[color]
  return {
    background: `radial-gradient(circle at 32% 28%, ${palette.light} 0%, ${palette.main} 55%, ${palette.shadow} 100%)`,
    boxShadow: `0 3px 6px rgba(0,0,0,0.25), inset 0 -3px 4px ${palette.shadow}`,
  }
}

interface PiecePileProps {
  color: PieceColor
  count: number
  isSelected: boolean
  selectedCount: number
  aiTaken: number
  interactive: boolean
  onSelectPile: (color: PieceColor) => void
  onSelectPieces: (color: PieceColor, count: number) => void
}

function PiecePile({
  color,
  count,
  isSelected,
  selectedCount,
  aiTaken,
  interactive,
  onSelectPile,
  onSelectPieces,
}: PiecePileProps) {
  const palette = PIECE_COLORS[color]
  const empty = count === 0

  return (
    <Box
      role="group"
      aria-label={`${COLOR_NAMES[color]}の山 残り${count}個`}
      onClick={() => interactive && !empty && onSelectPile(color)}
      sx={{
        position: "relative",
        borderRadius: 4,
        p: { xs: 1.5, sm: 2 },
        border: "2px solid",
        borderColor: isSelected && interactive ? palette.main : "divider",
        bgcolor: isSelected && interactive ? `${palette.main}14` : "transparent",
        transition: "border-color 0.2s ease, background-color 0.2s ease",
        cursor: interactive && !empty ? "pointer" : "default",
        opacity: empty ? 0.55 : 1,
      }}
    >
      <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between", mb: 1.5 }}>
        <Typography sx={{ fontWeight: 700 }}>{COLOR_NAMES[color]}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
          残り <Box component="span" sx={{ fontWeight: 800, fontSize: "1.15rem", color: "text.primary" }}>{count}</Box> 個
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: { xs: 1, sm: 1.25 },
          minHeight: { xs: 44, sm: 48 },
          alignItems: "center",
        }}
      >
        {Array.from({ length: count }, (_, index) => {
          const pieceNumber = index + 1
          const willTake = isSelected && interactive && pieceNumber <= selectedCount

          return (
            <ButtonBase
              key={index}
              disabled={!interactive}
              onClick={(event) => {
                event.stopPropagation()
                onSelectPieces(color, pieceNumber)
              }}
              aria-label={`${COLOR_NAMES[color]}を${pieceNumber}個選ぶ`}
              aria-pressed={willTake}
              sx={{
                width: { xs: 40, sm: 44 },
                height: { xs: 40, sm: 44 },
                borderRadius: "50%",
                ...pieceStyle(color),
                transition: "transform 0.18s ease, outline-color 0.18s ease",
                outline: "3px solid transparent",
                outlineOffset: 2,
                ...(willTake && {
                  transform: "translateY(-6px)",
                  outlineColor: palette.main,
                }),
                "&:hover": interactive ? { transform: "translateY(-4px)" } : undefined,
                "&.Mui-focusVisible": { outlineColor: palette.main, outlineStyle: "dashed" },
              }}
            />
          )
        })}

        {Array.from({ length: aiTaken }, (_, index) => (
          <Box
            key={`ghost-${index}`}
            aria-hidden
            sx={{
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              borderRadius: "50%",
              border: "2px dashed",
              borderColor: palette.main,
              animation: `${ghostFade} 0.8s ease-out forwards`,
            }}
          />
        ))}

        {count === 0 && aiTaken === 0 && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            なし
          </Typography>
        )}
      </Box>
    </Box>
  )
}

interface PieceTakingBoardProps {
  gameState: PieceTakingGameState
  interactive: boolean
  maxSelectableCount: number
  onPileSelect: (color: PieceColor) => void
  onPieceSelect: (color: PieceColor, count: number) => void
  onIncreaseCount: () => void
  onDecreaseCount: () => void
  onConfirmMove: () => void
}

export default function PieceTakingBoard({
  gameState,
  interactive,
  maxSelectableCount,
  onPileSelect,
  onPieceSelect,
  onIncreaseCount,
  onDecreaseCount,
  onConfirmMove,
}: PieceTakingBoardProps) {
  const selectedPalette = PIECE_COLORS[gameState.selectedColor]
  const canConfirm = interactive && gameState.selectedCount >= 1 && gameState.selectedCount <= maxSelectableCount

  return (
    <Paper sx={{ p: { xs: 1.5, sm: 2.5 } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        {PIECE_COLOR_ORDER.map((color) => (
          <PiecePile
            key={color}
            color={color}
            count={getPieceCount(gameState, color)}
            isSelected={gameState.selectedColor === color}
            selectedCount={gameState.selectedCount}
            aiTaken={gameState.lastAIMove?.color === color ? gameState.lastAIMove.count : 0}
            interactive={interactive}
            onSelectPile={onPileSelect}
            onSelectPieces={onPieceSelect}
          />
        ))}
      </Box>

      <Box
        sx={{
          mt: { xs: 2, sm: 2.5 },
          pt: { xs: 2, sm: 2.5 },
          borderTop: "1px dashed",
          borderColor: "divider",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          gap: 2,
          opacity: interactive ? 1 : 0.5,
          transition: "opacity 0.2s ease",
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Box aria-hidden sx={{ width: 28, height: 28, borderRadius: "50%", ...pieceStyle(gameState.selectedColor) }} />
          <Typography sx={{ fontWeight: 700 }}>{COLOR_NAMES[gameState.selectedColor]}</Typography>
          <Stack
            direction="row"
            sx={{ alignItems: "center", border: "1px solid", borderColor: "divider", borderRadius: 999, px: 0.5 }}
          >
            <IconButton
              size="small"
              onClick={onDecreaseCount}
              disabled={!interactive || gameState.selectedCount <= 1}
              aria-label="取る数を1つ減らす"
            >
              <RemoveRounded fontSize="small" />
            </IconButton>
            <Typography
              aria-live="polite"
              sx={{ minWidth: 48, textAlign: "center", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}
            >
              {gameState.selectedCount} 個
            </Typography>
            <IconButton
              size="small"
              onClick={onIncreaseCount}
              disabled={!interactive || gameState.selectedCount >= maxSelectableCount}
              aria-label="取る数を1つ増やす"
            >
              <AddRounded fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        <ButtonBase
          onClick={onConfirmMove}
          disabled={!canConfirm}
          sx={{
            ml: { sm: "auto" },
            width: { xs: "100%", sm: "auto" },
            minHeight: 48,
            px: 3.5,
            borderRadius: 999,
            fontWeight: 800,
            fontSize: "1rem",
            color: selectedPalette.contrastText,
            bgcolor: selectedPalette.main,
            boxShadow: `0 6px 16px ${selectedPalette.main}55`,
            transition: "transform 0.15s ease, box-shadow 0.15s ease, background-color 0.2s ease",
            "&:hover": { transform: "translateY(-1px)", boxShadow: `0 8px 20px ${selectedPalette.main}66` },
            "&.Mui-disabled": { bgcolor: "action.disabledBackground", color: "text.disabled", boxShadow: "none" },
            "&.Mui-focusVisible": { outline: "3px solid", outlineColor: selectedPalette.main, outlineOffset: 3 },
          }}
        >
          {COLOR_NAMES[gameState.selectedColor]}を {gameState.selectedCount} 個取る
        </ButtonBase>
      </Box>
    </Paper>
  )
}
