import { Box, Typography, Container } from "@mui/material"

export default function ModMGame() {
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
          mod Mゲーム
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          ここにmod Mゲームが実装されます
        </Typography>
      </Container>
    </Box>
  )
}
