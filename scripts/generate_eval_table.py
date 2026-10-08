"""
ストレンジオセロの全局面について、黒視点の評価値（ミニマックス）を計算し、
JSONファイルとして出力するスクリプト。

評価値 = 最善手を打ち続けた場合の最終駒数差（黒 - 白）
正の値 → 黒有利、負の値 → 白有利、0 → 引き分け

同時に白（AI）の最善手テーブルも生成する。

出力はコンパクトなバイナリ形式（src/features/strange-othello/tableFormat.ts で読み込む）:
  ヘッダー: マジック 4 バイト / フォーマットバージョン u8 / ルート評価値 i8 / 件数 u32 (LE)
  本体: キー昇順に「前のキーとの差分 (unsigned LEB128)」+「値 1 バイト」を件数分
  キー: 初期配置で石がある 24 マスは 1 ビット（黒=1）、空きの 12 マスは 3 進（空=0, 黒=1, 白=2）で
        行優先に詰めた整数（最大 2^24 * 3^12 < 2^53）。評価値テーブルは末尾に手番ビット（白=1）を付ける。
  値: 最善手テーブルは row * 6 + col、評価値テーブルは符号付き 8 ビット整数。
"""

import struct

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


def encode_eval_state(board, turn):
    return f"{turn[0]}:{encode_board(board)}"


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
    key = encode_eval_state(board, turn)
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
            eval_table[encode_eval_state(board, turn)] = (board, turn, result)
            eval_table[encode_eval_state(board, opponent)] = (board, opponent, result)
            return result
        # パス
        result = minimax(board, opponent)
        cache[key] = result
        eval_table[key] = (board, turn, result)
        return result

    if turn == "black":
        best = -999
        for row, col in moves:
            new_board = place_piece(board, row, col, "black")
            best = max(best, minimax(new_board, "white"))
        cache[key] = best
        eval_table[key] = (board, turn, best)
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
        eval_table[key] = (board, turn, best)
        if best_move is not None:
            white_move_table[encode_board(board)] = (board, best_move)
        return best


FORMAT_VERSION = 1


def encode_board_key(board):
    key = 0
    for row in range(ROWS):
        for col in range(COLS):
            cell = board[row][col]
            if INITIAL_BOARD[row][col] != "empty":
                if cell == "empty":
                    raise ValueError("initially occupied cell became empty")
                key = key * 2 + (1 if cell == "black" else 0)
            else:
                key = key * 3 + {"empty": 0, "black": 1, "white": 2}[cell]
    return key


def encode_varint(value):
    out = bytearray()
    while True:
        byte = value & 0x7F
        value >>= 7
        if value:
            out.append(byte | 0x80)
        else:
            out.append(byte)
            return bytes(out)


def write_table(path, magic, root_value, entries):
    entries = sorted(entries)
    body = bytearray()
    previous = 0
    for index, (key, value) in enumerate(entries):
        if index > 0 and key <= previous:
            raise ValueError("duplicate key")
        body += encode_varint(key - previous)
        body += struct.pack("<b", value)
        previous = key
    header = magic + struct.pack("<BbI", FORMAT_VERSION, root_value, len(entries))
    with open(path, "wb") as f:
        f.write(header + body)
    print(f"{path}: {len(entries)} entries, {(len(header) + len(body)) / 1024:.0f} KB")


def main():
    print("Computing minimax evaluation for all reachable states...")
    root_value = minimax(INITIAL_BOARD, "black")
    print(f"Root value (black - white): {root_value}")
    print(f"Total states evaluated: {len(eval_table)}")
    print(f"White move states: {len(white_move_table)}")

    solution_entries = [
        (encode_board_key(board), row * COLS + col) for board, (row, col) in white_move_table.values()
    ]
    write_table("public/strange-othello-solution.bin", b"SOTS", root_value, solution_entries)

    eval_entries = [
        (encode_board_key(board) * 2 + (1 if turn == "white" else 0), value)
        for (board, turn, value) in eval_table.values()
    ]
    write_table("public/strange-othello-eval.bin", b"SOTE", root_value, eval_entries)


if __name__ == "__main__":
    main()
