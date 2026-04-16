import type { ModMGameState, ModMPlayer } from "./types"

interface MinimaxResult {
  score: number
  card?: number
}

function pickRandomCard(cards: number[], random = Math.random) {
  return cards[Math.floor(random() * cards.length)]
}

export function playCard(state: ModMGameState, card: number, player: ModMPlayer): ModMGameState {
  if (state.currentTurn !== player || state.gameOver) {
    return state
  }

  const cards = player === "player" ? state.playerCards : state.aiCards

  if (!cards.includes(card)) {
    return state
  }

  const nextState: ModMGameState = {
    ...state,
    playerCards: player === "player" ? state.playerCards.filter((currentCard) => currentCard !== card) : state.playerCards,
    aiCards: player === "ai" ? state.aiCards.filter((currentCard) => currentCard !== card) : state.aiCards,
    playedCards: [...state.playedCards, card],
    playedBy: [...state.playedBy, player],
    sum: state.sum + card,
    lastMove: player === "player" ? `あなたは ${card} を出しました。` : `AIは ${card} を出しました。`,
  }

  if (nextState.sum % nextState.m === 0) {
    const winner = player === "player" ? "ai" : "player"

    return {
      ...nextState,
      gameOver: true,
      winner,
      message:
        winner === "player"
          ? `あなたの勝ちです！合計が${nextState.m}の倍数になりました。`
          : `AIの勝ちです。合計が${nextState.m}の倍数になりました。`,
    }
  }

  if (nextState.playerCards.length === 0 && nextState.aiCards.length === 0) {
    return {
      ...nextState,
      gameOver: true,
      winner: "ai",
      message: "すべてのカードを出し切りました。AIの勝ちです！",
    }
  }

  const currentTurn = player === "player" ? "ai" : "player"

  return {
    ...nextState,
    currentTurn,
    message: currentTurn === "player" ? "あなたのターンです。" : "AIのターンです...",
  }
}

function minimax(
  playerCards: number[],
  aiCards: number[],
  sum: number,
  modulus: number,
  isMaximizing: boolean,
  random: () => number,
  depth = 0,
  alpha = Number.NEGATIVE_INFINITY,
  beta = Number.POSITIVE_INFINITY,
): MinimaxResult {
  if (playerCards.length === 0 && aiCards.length === 0) {
    return { score: -1 }
  }

  const currentCards = isMaximizing ? aiCards : playerCards

  if (currentCards.length === 0) {
    return minimax(playerCards, aiCards, sum, modulus, !isMaximizing, random, depth + 1, alpha, beta)
  }

  if (isMaximizing) {
    let maxScore = Number.NEGATIVE_INFINITY
    let bestCard: number | undefined

    for (const card of aiCards) {
      const nextSum = sum + card

      if (nextSum % modulus === 0) {
        continue
      }

      const nextAiCards = aiCards.filter((currentCard) => currentCard !== card)
      const result = minimax(playerCards, nextAiCards, nextSum, modulus, false, random, depth + 1, alpha, beta)

      if (result.score > maxScore) {
        maxScore = result.score
        bestCard = card
      }

      alpha = Math.max(alpha, maxScore)
      if (beta <= alpha) {
        break
      }
    }

    return bestCard === undefined
      ? { score: -10 + depth, card: pickRandomCard(aiCards, random) }
      : { score: maxScore, card: bestCard }
  }

  let minScore = Number.POSITIVE_INFINITY
  let bestCard: number | undefined

  for (const card of playerCards) {
    const nextSum = sum + card

    if (nextSum % modulus === 0) {
      continue
    }

    const nextPlayerCards = playerCards.filter((currentCard) => currentCard !== card)
    const result = minimax(nextPlayerCards, aiCards, nextSum, modulus, true, random, depth + 1, alpha, beta)

    if (result.score < minScore) {
      minScore = result.score
      bestCard = card
    }

    beta = Math.min(beta, minScore)
    if (beta <= alpha) {
      break
    }
  }

  return bestCard === undefined
    ? { score: 10 - depth, card: pickRandomCard(playerCards, random) }
    : { score: minScore, card: bestCard }
}

export function chooseAiCard(state: ModMGameState, random = Math.random) {
  const safeMoves = state.aiCards.filter((card) => (state.sum + card) % state.m !== 0)

  if (safeMoves.length > 0) {
    const result = minimax(state.playerCards, safeMoves, state.sum, state.m, true, random)
    return result.card ?? pickRandomCard(safeMoves, random)
  }

  return state.aiCards.length > 0 ? pickRandomCard(state.aiCards, random) : undefined
}
