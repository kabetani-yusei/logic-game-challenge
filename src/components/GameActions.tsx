import { useState } from "react"
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import RestartAltRounded from "@mui/icons-material/RestartAltRounded"
import UndoRounded from "@mui/icons-material/UndoRounded"

interface GameActionsProps {
  canUndo: boolean
  inProgress: boolean
  onUndo: () => void
  onRestart: () => void
}

export default function GameActions({ canUndo, inProgress, onUndo, onRestart }: GameActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleRestartClick = () => {
    if (inProgress) {
      setConfirmOpen(true)
      return
    }

    onRestart()
  }

  return (
    <>
      <Button variant="outlined" color="inherit" startIcon={<UndoRounded />} onClick={onUndo} disabled={!canUndo}>
        1手戻る
      </Button>
      <Button variant="outlined" color="inherit" startIcon={<RestartAltRounded />} onClick={handleRestartClick}>
        最初からやり直す
      </Button>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="restart-dialog-title"
        aria-describedby="restart-dialog-description"
      >
        <DialogTitle id="restart-dialog-title">最初からやり直しますか？</DialogTitle>
        <DialogContent>
          <DialogContentText id="restart-dialog-description">現在の対局の進行状況は失われます。</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmOpen(false)} autoFocus>
            キャンセル
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setConfirmOpen(false)
              onRestart()
            }}
          >
            やり直す
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
