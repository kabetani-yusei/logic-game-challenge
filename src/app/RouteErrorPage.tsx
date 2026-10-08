import { useEffect } from "react"
import { Button, Container, Stack, Typography } from "@mui/material"
import { isRouteErrorResponse, Link as RouterLink, useRouteError } from "react-router"

export function NotFoundPage() {
  return <ErrorView notFound />
}

export default function RouteErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  if (!notFound && import.meta.env.DEV) {
    console.error(error)
  }

  return <ErrorView notFound={notFound} />
}

function ErrorView({ notFound }: { notFound: boolean }) {
  useEffect(() => {
    document.title = `${notFound ? "ページが見つかりません" : "エラー"} | 頭脳王に挑戦！`
  }, [notFound])

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, sm: 12 } }}>
      <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
        <Typography aria-hidden sx={{ fontSize: "3.5rem", lineHeight: 1 }}>
          {notFound ? "🧭" : "⚠️"}
        </Typography>
        <Typography variant="h4" component="h1">
          {notFound ? "ページが見つかりません" : "問題が発生しました"}
        </Typography>
        <Typography sx={{ color: "text.secondary" }}>
          {notFound
            ? "URL が間違っているか、ページが移動した可能性があります。"
            : "ページを再読み込みしても解決しない場合は、時間をおいて再度お試しください。"}
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
          {!notFound && (
            <Button variant="outlined" onClick={() => window.location.reload()}>
              再読み込み
            </Button>
          )}
          <Button variant="contained" component={RouterLink} to="/">
            ゲーム一覧へ
          </Button>
        </Stack>
      </Stack>
    </Container>
  )
}
