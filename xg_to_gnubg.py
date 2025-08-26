import base64

class Board:
    def __init__(self, line):
        parts = line.split(':')
        self.board = parts[0][5:]
        self.cube = parts[1]
        self.cube_position = parts[2]
        self.turn = parts[3]
        self.dice = parts[4]
        self.score_bottom = int(parts[5])
        self.score_top = int(parts[6])
        self.crawford = parts[7]
        self.length = int(parts[8])
        self.max_cube = int(parts[9])

# public_function
def extract_xgid(xgid):
    return Board(xgid)

# gets the position list in little-endian format
def getEndianPosList(pos_list):
    res = []
    for i in range(0, len(pos_list), 8):
        res.extend(pos_list[i:i+8][::-1])
    return res

# converts an integer to a base64 character
def int_to_base64(num):
    if num < 26:
        return chr(num + 65)
    elif num < 52:
        return chr(num - 26 + 97)
    elif num < 62:
        return chr(num - 52 + 48)
    elif num == 62:
        return '+'
    else:
        return '/'

# gets the position ID from a list of positions. Used for both match and position IDs.
def getID(pos_list, isPosID):
    pos_list = list(''.join(pos_list))
    pos_list_endian = getEndianPosList(pos_list)
    if isPosID:
        pos_list_endian.extend(['0'] * 4)  # extend to 84 bits
    pos_str = ''.join(pos_list_endian)
    pos_id = []

    # convert to base64
    subVal = ''
    for i in range(0, len(pos_str), 6):
        subVal = int(pos_str[i:i+6], 2)
        pos_id.append(int_to_base64(subVal))
    return ''.join(pos_id)

def getPositionId(board):
    pos_list = []
    for i in range(1, len(board.board)):
        # parses upper case letters
        if board.board[i] == '-' or ord(board.board[i]) > 96:
            pos_list.append('0')
        else:
            pos_list.append((ord(board.board[i]) - 64) * '1' + '0')
    for i in range(len(board.board)-2, -1, -1):
        # parses lower case letters
        if board.board[i] == '-' or ord(board.board[i]) <= 96:
            pos_list.append('0')
        else:
            pos_list.append((ord(board.board[i]) - 96) * '1' + '0')
    return getID(pos_list, True)

def getMatchId(board):
    id_list = []
    # cube value
    bin_str = f"{int(board.cube):04b}"
    id_list.append(bin_str[::-1])

    # cube owner
    if board.cube_position == '1':
        id_list.append('00')
    elif board.cube_position == '0':
        id_list.append('10')
    else:
        id_list.append('11')

    # DiceOwner
    if board.turn == '1':
        id_list.append('0')
    else:
        id_list.append('1')

    # Crawford
    id_list.append(board.crawford)

    # GameState
    id_list.append("100")

    # TurnOwner
    if board.turn == '1':
        id_list.append('1')
    else:
        id_list.append('0')

    # Double
    if board.dice == 'D':
        id_list.append('1')
    else:
        id_list.append('0')

    # Resignation
    id_list.append('00')

    # Dice1
    if board.dice == '00' or board.dice == 'D' or board.dice == 'B':
        id_list.append('000')
    else:
        bin_str = f"{int(board.dice[0]):03b}"
        id_list.append(bin_str[::-1])

    # Dice2
    if board.dice == '00' or board.dice == 'D' or board.dice == 'B':
        id_list.append('000')
    else:
        bin_str = f"{int(board.dice[1]):03b}"
        id_list.append(bin_str[::-1])

    # MatchLen
    bin_str = f"{int(board.length):015b}"
    id_list.append(bin_str[::-1])

    # Score1
    bin_str = f"{int(board.score_bottom):015b}"
    id_list.append(bin_str[::-1])

    # Score2
    bin_str = f"{int(board.score_top):015b}"
    id_list.append(bin_str[::-1])

    return getID(id_list, False)


def xg_to_gnubg(line):
    board = extract_xgid(line)
    pos_id = getPositionId(board)
    mat_id = getMatchId(board)
    return pos_id + ":" + mat_id

# Example usage
print(xg_to_gnubg("XGID=-a----ECB--AfB---cBda-----:1:1:-1:63:0:0:0:5:6"))