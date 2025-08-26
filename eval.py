# program that invokes gnubg-cli as a child process to get analysis

import subprocess
import xgid

width = 35

def format_cube(lines):
    output = []
    colors = []
    print(lines)
    for i in range(len(lines)):
        if i == 0:
            print("LIST", list(lines[i]))
            spaces = width - (len(lines[i]) + 10)
            output.append(lines[i][3:16] + (' ' * spaces) + lines[i][23:] + "  (-0.000)")
        else:
            spaces = width - len(lines[i]) - 3
            output.append(lines[i][3:16] + (' ' * spaces) + lines[i][23:])
        
        print("OUTPUT", output[-1])
        error = int(output[-1][-4:-1])
        if error < 20:
            colors.append("green")
        elif error < 80:
            colors.append("blue")
        else:
            colors.append("red")
    print(output)
    return output, colors

def format_checker(lines):
    output = []
    colors = []
    print("Lines", lines)
    for i in range(0, len(lines), 3):
        j = lines[i].find("ply") + 7
        move = []
        spaceCount = 0
        while j < len(lines[i]):
            move.append(lines[i][j])
            if lines[i][j:j+2] == '  ': break
            j += 1
        j = lines[i].find(":") + 2
        if i == 0:
            spaces = width - (len(move) + len(lines[i]) - j + 9)
            output.append("".join(move) + (' ' * spaces) + lines[i][j:] + " (-0.000)")
        else:
            spaces = width - (len(move) + len(lines[i]) - j)
            output.append("".join(move) + (' ' * spaces) + lines[i][j:])
        error = int(output[-1][-4:-1])
        if error < 20:
            colors.append("green")
        elif error < 80:
            colors.append("blue")
        else:
            colors.append("red")

    return output, colors

def get_cube_stats(line, ply):
    print("running process ", line)
    process = subprocess.Popen(['gnubg/gnubg-cli.exe', '-q'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    inp = "\nset evaluation cubedecision evaluation plies " + ply + \
                "\nset xgid " + line + "\nhint\nexit"
    stdout, stderr = process.communicate(input=inp.encode('utf-8'))
    print("Stdout:", stdout.decode().splitlines()[26:])
    print(stdout)
    return format_cube(stdout.decode().splitlines()[30:33])

def get_checker_stats(line, ply, max_moves):
    process = subprocess.Popen(['gnubg/gnubg-cli.exe', '-q'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    inp = "\nset evaluation chequerplay evaluation plies " + ply + \
                "\nset xgid " + line + "\nhint\nexit"
    stdout, stderr = process.communicate(input=inp.encode('utf-8'))
    if not max_moves: max_moves = 10
    lines = stdout.decode().splitlines()
    last_line = min(len(lines), 25 + max_moves * 3)
    print(stdout)
    return format_checker(lines[25 : last_line])

def get_stats(line, ply, max_moves=None):
    print("getting stats")
    full_board = xgid.extract_xgid(line)
    if full_board.dice == '00':
        return get_cube_stats(line, ply)

    return get_checker_stats(line, ply, max_moves)

