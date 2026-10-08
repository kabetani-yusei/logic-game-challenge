import { Box, CircularProgress } from "@mui/material"

export default function PageLoader() {
  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", bgcolor: "background.default" }}>
      <CircularProgress aria-label="読み込み中" />
    </Box>
  )
}
