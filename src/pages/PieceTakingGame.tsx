import { Box, Typography, Container } from "@mui/material"

export default function PieceTakingGame() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom, #1a1a2e, #16213e)",
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          駒取りゲーム
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          ここに駒取りゲームが実装されます
        </Typography>
      </Container>
    </Box>
  )
}
