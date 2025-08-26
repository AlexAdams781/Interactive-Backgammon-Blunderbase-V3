# converts filter or position text into graph format that can be pickled and stored

import os
import sys
import xgid

class Position:
    def __init__(self, line, is_cube, stage):
        full_board = xgid.extract_xgid(line)
        if full_board.turn == '-1':
            xgid.swap_board(full_board)
        
        self.xgid = xgid.board_to_line(full_board) #string
        self.is_cube = is_cube #boolean
        self.stage = stage #string
        self.categories = [] #list(string)

    def print_pos(self):
        print(self.xgid, "isCube =", self.is_cube, "Stage = ", self.stage)
        for cat in self.categories:
            print("\t", cat)

class Filter:
    def __init__(self, is_cube, stage, line):
        self.is_cube = is_cube
        self.stage = stage
        if (len(line) > 0): self.inner = Filter_Recursive(line, 0)
        else: self.inner = None

    def print_fil(self):
        print("is_cube =", self.is_cube, "stage =", self.stage)
        if self.inner: self.inner.print_fil_rec(0)

class Filter_Recursive:
    def __init__(self, line, depth):
        self.left = None #Filter
        self.right = None #Filter
        self.category = None #string
        self.injunction = None #string (AND; OR; NONE)
        self.populate_filter(line, depth)

    # parse boolean statement into a filter
    def populate_filter(self, line, depth):
        if len(line) == 1: 
            self.category = line[0]
            self.injunction = "NONE"
            return

        # left branch
        index = 0
        if line[index] == "(":
            while line[index] != ")":
                index += 1
            if index == len(line) - 1:
                self.populate_filter(line[1:-1], depth)
                return
            self.left = Filter_Recursive(line[1:index], depth+1)
            index += 1
        else:
            self.left = Filter_Recursive(line[index:1], depth+1)
            index = 1

        # injunction
        self.injunction = line[index]
        index += 1

        # right branch
        self.right = Filter_Recursive(line[index:], depth+1)


    def print_fil_rec(self, depth):
        tabs = depth * '\t'
        if self.injunction == "NONE":
            print(tabs + self.category)
        elif self.injunction == "AND":
            print(tabs + "AND")
            self.left.print_fil_rec(depth + 1)
            self.right.print_fil_rec(depth + 1)
        elif self.injunction == "OR":
            print(tabs + "OR")
            self.left.print_fil_rec(depth + 1)
            self.right.print_fil_rec(depth + 1)

class Schema:
    def __init__(self, lines, depth, parent, root=None):
        self.root = root
        self.children = None
        self.parent = parent
        self.populate_tree(lines, depth)
        self.level = depth

    def sort(self):
        for child in self.children:
            self.children[child].sort()
        self.children = dict(sorted(self.children.items()))

    def num_tabs(self, line):
        res = 0
        while line[res] == '\t':
            res += 1
        return res

    def remove_tabs(self, line):
        return line[self.num_tabs(line) : ]

    def populate_tree(self, lines, depth):
        self.children = dict()
        if len(lines) == 0:
            return
        root = lines[0]
        start = 0
        i = 1
        while i < len(lines):
            if self.num_tabs(lines[i]) <= depth:
                self.children[self.remove_tabs(root)] = Schema(lines[start+1 : i], depth+1, self, root=self.remove_tabs(root))
                depth = self.num_tabs(lines[i])
                start = i
                root = lines[start]
            i += 1
        self.children[self.remove_tabs(root)] = Schema(lines[start+1 : i], depth+1, self, root=self.remove_tabs(root))

    def print_schema(self):
        self.print_schema_rec(0)

    def print_schema_rec(self, depth):
        if not self.root: self.root = "None"
        print((depth * '\t') + self.root)
        for c in self.children:
            self.children[c].print_schema_rec(depth+1)

# string -> boolean
# extracts information from xgid on whether or not to cube
def get_is_cube(line):
    full_board = xgid.extract_xgid(line)
    return (full_board.dice == '00')

# string -> Position
# takes lines from position file input and populates an instance of a Position class
def process_file(file_path):
    with open(file_path, "r", encoding="unicode_escape") as f:
        lines = f.read().split('\n')
        if lines[-1] == '': lines.pop()
        position = Position(line=lines[0], is_cube=get_is_cube(lines[0]), stage=lines[1])
        categories = [] #list(string)
        for i in range(2, len(lines)):
            categories.append(lines[i][1:])
        position.categories = categories

    position.print_pos()
    return position

# string -> Filter
# takes lines from filter file input and populates an instance of a Filter class
def process_filter(file_path):
    with open(file_path, "r", encoding="unicode_escape") as f:
        lines = f.read().split('\n')
        if lines[-1] == '': lines.pop()
        print("A LINES", lines)
        if len(lines) <= 1:
            return Filter(lines[0] == "Cube", None, [])
        strand = ""
        for line in lines[2:]: strand += (line + ' ')
        strand_list = strand.split(' ')
        strand_list.pop()
        filter = Filter(lines[0] == "Cube", lines[1], strand_list)
        filter.print_fil()
        return filter

def process_schema(file_path):
    with open(file_path, "r", encoding="unicode_escape") as f:
        lines = f.read().split('\n')
        lines.pop()
        schema = Schema(lines, 0, None)
        schema.sort()
        return schema

# public function that converts lines from input function to structs
# that the filter function can process
def get(file_path, type):
    if type == "position": return process_file(file_path)
    elif type == "filter": return process_filter(file_path)
    return process_schema(file_path)

process_schema("schema.txt")
