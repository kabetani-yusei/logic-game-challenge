// 初回描画前にカラーモード（ライト / ダーク）を確定させ、画面のちらつきを防ぐ。
// CSP（script-src 'self'）に適合させるため、インラインではなく外部ファイルとして読み込む。
;(function () {
  var mode = "system"
  try {
    var stored = window.localStorage.getItem("logic-game-challenge/color-mode")
    if (stored === "light" || stored === "dark" || stored === "system") mode = stored
  } catch (e) {
    // ストレージが利用できない環境ではシステム設定に従う
  }
  if (mode === "system") {
    mode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }
  document.documentElement.classList.add(mode)
})()
