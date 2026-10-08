import { Box, Container, IconButton, LinearProgress, Link, Stack, Tooltip, Typography, useColorScheme } from "@mui/material"
import DarkModeRounded from "@mui/icons-material/DarkModeRounded"
import LightModeRounded from "@mui/icons-material/LightModeRounded"
import PsychologyRounded from "@mui/icons-material/PsychologyRounded"
import { Link as RouterLink, Outlet, ScrollRestoration, useNavigation } from "react-router"

function ColorModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme()
  const resolved = mode === "system" ? systemMode : mode

  if (!resolved) {
    return <Box sx={{ width: 40, height: 40 }} />
  }

  const next = resolved === "dark" ? "light" : "dark"
  const label = next === "dark" ? "ダークモードに切り替え" : "ライトモードに切り替え"

  return (
    <Tooltip title={label}>
      <IconButton onClick={() => setMode(next)} aria-label={label} color="inherit">
        {resolved === "dark" ? <LightModeRounded /> : <DarkModeRounded />}
      </IconButton>
    </Tooltip>
  )
}

export default function AppShell() {
  const navigation = useNavigation()

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <Link
        href="#main-content"
        sx={{
          position: "absolute",
          left: 16,
          top: -100,
          zIndex: 2000,
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontWeight: 700,
          "&:focus": { top: 12 },
        }}
      >
        本文へスキップ
      </Link>

      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          backdropFilter: "saturate(180%) blur(12px)",
          bgcolor: "rgba(var(--lgc-palette-background-defaultChannel) / 0.8)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", height: 60, px: { xs: 2, sm: 3 } }}>
          <Link
            component={RouterLink}
            to="/"
            underline="none"
            color="inherit"
            sx={{ display: "flex", alignItems: "center", gap: 1, borderRadius: 2, py: 0.5, pr: 1 }}
          >
            <Box
              aria-hidden
              sx={{
                width: 34,
                height: 34,
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                background: "linear-gradient(135deg, #5865d6 0%, #e2673a 100%)",
              }}
            >
              <PsychologyRounded fontSize="small" />
            </Box>
            <Typography component="span" sx={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "0.02em" }}>
              頭脳王に挑戦！
            </Typography>
          </Link>
          <Stack direction="row" spacing={0.5} sx={{ ml: "auto", alignItems: "center" }}>
            <ColorModeToggle />
          </Stack>
        </Container>
        {navigation.state === "loading" && (
          <LinearProgress sx={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 2 }} aria-label="読み込み中" />
        )}
      </Box>

      <Box component="main" id="main-content" tabIndex={-1} sx={{ flex: 1, outline: "none" }}>
        <Outlet />
      </Box>

      <Box component="footer" sx={{ borderTop: "1px solid", borderColor: "divider", py: 3, mt: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
            必勝法を見抜いて、AIに勝利しよう。進行状況はこのブラウザにのみ保存されます。
          </Typography>
        </Container>
      </Box>

      <ScrollRestoration />
    </Box>
  )
}
