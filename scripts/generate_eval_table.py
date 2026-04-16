"""
ストレンジオセロの全局面について、黒視点の評価値（ミニマックス）を計算し、
JSONファイルとして出力するスクリプト。

評価値 = 最善手を打ち続けた場合の最終駒数差（黒 - 白）
正の値 → 黒有利、負の値 → 白有利、0 → 引き分け

同時に白（AI）の最善手テーブルも生成する。
"""

import json

DIRECTIONS = [
    (-1, 0), (-1, 1), (0, 1), (1, 1),
    (1, 0), (1, -1), (0, -1), (-1, -1),
]

INITIAL_BOARD = [
    ["white", "black", "black", "black", "black", "white"],
    ["black", "empty", "empty", "empty", "empty", "white"],
    ["black", "empty", "white", "black", "empty", "white"],
    ["black", "empty", "black", "white", "empty", "white"],
    ["black", "empty", "empty", "empty", "empty", "white"],
    ["white", "white", "white", "white", "white", "white"],
]

ROWS = 6
COLS = 6


def encode_board(board):
    chars = []
    for row in board:
        for cell in row:
            if cell == "empty":
                chars.append(".")
            elif cell == "black":
                chars.append("B")
            else:
                chars.append("W")
    return "".join(chars)


def find_valid_moves(board, color):
    opponent = "white" if color == "black" else "black"
    moves = []
    for row in range(ROWS):
        for col in range(COLS):
            if board[row][col] != "empty":
                continue
            for dr, dc in DIRECTIONS:
                r, c = row + dr, col + dc
                found = False
                while 0 <= r < ROWS and 0 <= c < COLS and board[r][c] == opponent:
                    found = True
                    r += dr
                    c += dc
                if found and 0 <= r < ROWS and 0 <= c < COLS and board[r][c] == color:
                    moves.append((row, col))
                    break
    return moves


def place_piece(board, row, col, color):
    opponent = "white" if color == "black" else "black"
    new_board = [r[:] for r in board]
    new_board[row][col] = color
    for dr, dc in DIRECTIONS:
        pieces = []
        r, c = row + dr, col + dc
        while 0 <= r < ROWS and 0 <= c < COLS and new_board[r][c] == opponent:
            pieces.append((r, c))
            r += dr
            c += dc
        if pieces and 0 <= r < ROWS and 0 <= c < COLS and new_board[r][c] == color:
            for pr, pc in pieces:
                new_board[pr][pc] = color
    return new_board


def count_pieces(board, color):
    count = 0
    for row in board:
        for cell in row:
            if cell == color:
                count += 1
    return count


# ミニマックス（メモ化付き）
cache = {}
eval_table = {}
white_move_table = {}


def minimax(board, turn):
    key = turn[0] + encode_board(board)
    if key in cache:
        return cache[key]

    moves = find_valid_moves(board, turn)
    opponent = "white" if turn == "black" else "black"

    if not moves:
        opp_moves = find_valid_moves(board, opponent)
        if not opp_moves:
            # ゲーム終了
            result = count_pieces(board, "black") - count_pieces(board, "white")
            cache[key] = result
            eval_table[encode_board(board)] = result
            return result
        # パス
        result = minimax(board, opponent)
        cache[key] = result
        eval_table[encode_board(board)] = result
        return result

    encoded = encode_board(board)

    if turn == "black":
        best = -999
        for row, col in moves:
            new_board = place_piece(board, row, col, "black")
            best = max(best, minimax(new_board, "white"))
        cache[key] = best
        eval_table[encoded] = best
        return best
    else:
        best = 999
        best_move = None
        for row, col in moves:
            new_board = place_piece(board, row, col, "white")
            val = minimax(new_board, "black")
            if val < best:
                best = val
                best_move = (row, col)
        cache[key] = best
        eval_table[encoded] = best
        if best_move is not None:
            white_move_table[encoded] = list(best_move)
        return best


def main():
    print("Computing minimax evaluation for all reachable states...")
    root_value = minimax(INITIAL_BOARD, "black")
    print(f"Root value (black - white): {root_value}")
    print(f"Total states evaluated: {len(eval_table)}")
    print(f"White move states: {len(white_move_table)}")

    # 評価値テーブル
    eval_output = {
        "rootValue": root_value,
        "evalTable": eval_table,
        "stateCount": len(eval_table),
    }
    eval_path = "public/strange-othello-eval.json"
    with open(eval_path, "w") as f:
        json.dump(eval_output, f)
    eval_size = len(json.dumps(eval_output)) / (1024 * 1024)
    print(f"Eval table written to {eval_path} ({eval_size:.1f} MB)")

    # 白の最善手テーブル
    solution_output = {
        "initialTurn": "black",
        "rootValue": root_value,
        "whiteMoveTable": white_move_table,
        "visitedStateCount": len(eval_table),
        "whiteStateCount": len(white_move_table),
    }
    solution_path = "public/strange-othello-table.json"
    with open(solution_path, "w") as f:
        json.dump(solution_output, f)
    sol_size = len(json.dumps(solution_output)) / (1024 * 1024)
    print(f"Solution table written to {solution_path} ({sol_size:.1f} MB)")


if __name__ == "__main__":
    main()
