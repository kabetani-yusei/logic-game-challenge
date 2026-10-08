import { useEffect, type ReactNode } from "react"
import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Stack, Typography } from "@mui/material"
import type { ContainerProps } from "@mui/material"
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded"
import MenuBookRounded from "@mui/icons-material/MenuBookRounded"

interface GamePageLayoutProps {
  title: string
  subtitle?: ReactNode
  rules: ReactNode
  status?: ReactNode
  actions?: ReactNode
  children: ReactNode
  maxWidth?: ContainerProps["maxWidth"]
  onTitleClick?: () => void
}

export default function GamePageLayout({
  title,
  subtitle,
  rules,
  status,
  actions,
  children,
  maxWidth = "md",
  onTitleClick,
}: GamePageLayoutProps) {
  useEffect(() => {
    document.title = `${title} | 頭脳王に挑戦！`
  }, [title])

  return (
    <Container maxWidth={maxWidth} sx={{ py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      <Stack spacing={{ xs: 2, sm: 2.5 }} useFlexGap>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h1"
            onClick={onTitleClick}
            sx={{
              fontSize: { xs: "1.6rem", sm: "2rem" },
              ...(onTitleClick ? { userSelect: "none", WebkitUserSelect: "none" } : {}),
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreRounded />}
            aria-controls="game-rules-content"
            id="game-rules-header"
            sx={{ px: 2.5, minHeight: 52 }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <MenuBookRounded fontSize="small" sx={{ color: "primary.main" }} aria-hidden />
              <Typography sx={{ fontWeight: 700 }}>ルール</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5, color: "text.secondary", lineHeight: 1.8 }}>
            {rules}
          </AccordionDetails>
        </Accordion>

        {status}
        {children}

        {actions && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ justifyContent: "center", alignItems: "stretch", pt: 0.5 }}
          >
            {actions}
          </Stack>
        )}
      </Stack>
    </Container>
  )
}

export function RuleList({ items }: { items: ReactNode[] }) {
  return (
    <Box component="ol" sx={{ m: 0, pl: 2.5, "& > li + li": { mt: 0.75 } }}>
      {items.map((item, index) => (
        <Typography key={index} component="li" variant="body2" sx={{ lineHeight: 1.8 }}>
          {item}
        </Typography>
      ))}
    </Box>
  )
}
