import { useSyncExternalStore } from "react"
import { Alert, Button, Snackbar } from "@mui/material"
import CloudOffRounded from "@mui/icons-material/CloudOffRounded"
import {
  applyServiceWorkerUpdate,
  dismissOfflineReady,
  getServiceWorkerState,
  subscribeServiceWorker,
} from "./serviceWorker"

function subscribeOnline(listener: () => void) {
  window.addEventListener("online", listener)
  window.addEventListener("offline", listener)
  return () => {
    window.removeEventListener("online", listener)
    window.removeEventListener("offline", listener)
  }
}

export default function AppStatusNotices() {
  const { updateReady, offlineReady } = useSyncExternalStore(subscribeServiceWorker, getServiceWorkerState)
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine)

  return (
    <>
      <Snackbar open={!online} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="info" icon={<CloudOffRounded fontSize="inherit" />} variant="filled" sx={{ width: "100%" }}>
          オフラインです。保存済みのデータで遊べます
        </Alert>
      </Snackbar>

      <Snackbar
        open={online && updateReady}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message="新しいバージョンがあります"
        action={
          <Button color="secondary" size="small" onClick={applyServiceWorkerUpdate}>
            更新する
          </Button>
        }
      />

      <Snackbar
        open={online && !updateReady && offlineReady}
        autoHideDuration={5000}
        onClose={dismissOfflineReady}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message="オフラインでも遊べるようになりました"
      />
    </>
  )
}
