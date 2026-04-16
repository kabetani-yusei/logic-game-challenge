import type { ReactNode } from "react"
import { Box, Container, Paper, Typography } from "@mui/material"
import type { ContainerProps, TypographyProps } from "@mui/material"

interface GamePageLayoutProps {
  title: ReactNode
  rules: ReactNode
  children: ReactNode
  maxWidth?: ContainerProps["maxWidth"]
  titleProps?: TypographyProps
  onTitleClick?: () => void
}

export default function GamePageLayout({
  title,
  rules,
  children,
  maxWidth = "md",
  titleProps,
  onTitleClick,
}: GamePageLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        bgcolor: "background.default",
        p: { xs: 1.5, sm: 3 },
        pt: { xs: 3, sm: 4 },
      }}
    >
      <Container maxWidth={maxWidth} sx={{ display: "flex", flexDirection: "column", gap: 2.5, px: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography
            variant="h5"
            component="h1"
            onClick={onTitleClick}
            sx={{
              color: "text.primary",
              textAlign: "center",
              ...(onTitleClick ? { userSelect: "none", cursor: "default" } : {}),
            }}
            {...titleProps}
          >
            {title}
          </Typography>
          <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
            {rules}
          </Paper>
        </Box>

        {children}
      </Container>
    </Box>
  )
}
