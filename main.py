# main code for flashcard app

import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk
import os
from pathlib import Path
import sys
import pickle
import eval
import xgid
import convert_to_graph
import subprocess
import filter
import re
import copy
import queue
from threading import Thread
from collections import Counter
import pyperclip
import shutil
import random

root_dir = r"\Users\aadam\Documents\blunderbase\\"

mylargefont=("Arial", 36)
myfont = ("Arial", 18)
mysmallfont = ("Arial", 12)
mymicrofont = ("Arial", 8)

marg = (50, 75)
board_dims = (600, 560)
canvas_dims = (700, 660)
screen_width = 1280

analysis_done = set()

num_positions = 0
worker = None
q = queue.Queue()

# retrieves analysis from cache
def get_analysis(xgid_line):
    while True:
        if (app.ply_level, xgid_line) in analysis_done:
            break

    print("Getting analysis for xgid =", xgid)
    with open(root_dir + r"cache//" + app.ply_level + xgid.xgid_to_filename(xgid_line), 'rb') as f:
        return pickle.load(f)
    return None

# class for backgammon move syntax
class Move:
    def __init__(self, move):
        split_move = move.split('/')
        self.pos = []
        self.mult = 1
        is_capture = False
        print("Split", split_move)
        for elem in split_move:
            if elem == "bar":
                self.pos.append(25)
                continue
            if elem == "off":
                self.pos.append(0)
                continue

            index = 0
            while index < len(elem):
                if elem[index] == '*':
                    self.pos.append(int(elem[:index]))
                    is_capture = True
                    break
                if elem[index] == '(':
                    self.pos.append(int(elem[:index]))
                    self.mult = int(elem[index+1])
                    break
                index += 1
            if index == len(elem): self.pos.append(int(elem))

        self.cat = self.categorize(is_capture)

    def categorize(self, is_capture):
        if len(self.pos) == 3:
            return "pick_pass"
        elif is_capture:
            return "capture"
        elif self.mult > 1:
            return "double"
        else:
            return "regular"

# tkinter gui
class App:
    def __init__(self, root):
        self.root = root
        self.current_index = -1
        self.current_canvas = None
        self.analysis = False
        self.canvases = {}
        self.xgid_map = {}

        self.correct = 0
        self.mistakes = 0
        self.blunders = 0

        #root.bind("<Right>", self.switch_right)
        #root.bind("<Up>", self.switch_up)
        #root.bind("<Down>", self.switch_down)
        root.focus_set()

        self.add_position_canvas = tk.Canvas(self.root, width=canvas_dims[0], height=canvas_dims[1], bg="black")
        self.create_deck_canvas = tk.Canvas(self.root, width=canvas_dims[0], height=canvas_dims[1], bg="black")
        self.play_deck_canvas = tk.Canvas(self.root, width=canvas_dims[0], height=canvas_dims[1], bg="black")
        self.settings_canvas = tk.Canvas(self.root, width=canvas_dims[0], height=canvas_dims[1], bg="black")

        self.schema = convert_to_graph.get("schema.txt", "schema")
        self.add_position_log = []
        self.create_deck_log = []
        self.step = 0
        self.ply_level = "2"
        self.filter_paren = 0
        self.deck_name = ""
        #self.make_add_position_canvas(1)
        #self.create_deck_canvas = self.make_create_deck_canvas(1)

    def create_intro(self):
        canvas = tk.Canvas(self.root, width=canvas_dims[0], height=canvas_dims[1], bg="black")
        self.current_index += 1
        self.canvases[self.current_index] = (canvas, None)
        self.current_canvas = canvas

        canvas.create_text(canvas_dims[0]//2, 200, text="Blunderbase Flashcards", font=mylargefont, fill='white')
        add_position_btn = canvas.create_rectangle(canvas_dims[0]//2 - 70, 310, canvas_dims[0]//2 + 70, 350, fill='white')
        add_position_txt = canvas.create_text(canvas_dims[0]//2, 330, text='Add Position', font=myfont, fill='black')
        canvas.tag_bind(add_position_btn, "<Button-1>", lambda k : add_position_fn())
        canvas.tag_bind(add_position_txt, "<Button-1>", lambda k : add_position_fn())

        create_deck_btn = canvas.create_rectangle(canvas_dims[0]//2 - 70, 380, canvas_dims[0]//2 + 70, 420, fill='white')
        create_deck_txt = canvas.create_text(canvas_dims[0]//2, 400, text='Create Deck', font=myfont, fill='black')
        canvas.tag_bind(create_deck_btn, "<Button-1>", lambda k : create_deck_fn())
        canvas.tag_bind(create_deck_txt, "<Button-1>", lambda k : create_deck_fn())

        play_deck_btn = canvas.create_rectangle(canvas_dims[0]//2 - 70, 450, canvas_dims[0]//2 + 70, 490, fill='white')
        play_deck_txt = canvas.create_text(canvas_dims[0]//2, 470, text='Play Deck', font=myfont, fill='black')
        canvas.tag_bind(play_deck_btn, "<Button-1>", lambda k : play_deck_fn())
        canvas.tag_bind(play_deck_txt, "<Button-1>", lambda k : play_deck_fn())

        settings_btn = canvas.create_rectangle(canvas_dims[0]//2 - 70, 520, canvas_dims[0]//2 + 70, 560, fill='white')
        settings_txt = canvas.create_text(canvas_dims[0]//2, 540, text='Settings', font=myfont, fill='black')
        canvas.tag_bind(settings_btn, "<Button-1>", lambda k : settings_fn())
        canvas.tag_bind(settings_txt, "<Button-1>", lambda k : settings_fn())

        exit_btn = canvas.create_rectangle(615, 10, 675, 40, fill='white')
        exit_txt = canvas.create_text(645, 25, text="Exit", fill='black')
        canvas.tag_bind(exit_btn, "<Button-1>", lambda k : exit_fn())
        canvas.tag_bind(exit_txt, "<Button-1>", lambda k : exit_fn())

    # runs when inside add position scene
    def make_add_position_canvas(self):
        canvas = self.add_position_canvas

        undo_btn = canvas.create_rectangle(25, 10, 85, 40, fill='white')
        undo_txt = canvas.create_text(55, 25, text='Undo', font=mysmallfont, fill="black")
        canvas.tag_bind(undo_btn, "<Button-1>", lambda k : add_position_undo_fn(canvas))
        canvas.tag_bind(undo_txt, "<Button-1>", lambda k : add_position_undo_fn(canvas))

        menu_btn = canvas.create_rectangle(535, 10, 595, 40, fill='white')
        menu_txt = canvas.create_text(565, 25, text="Menu", fill='black')
        canvas.tag_bind(menu_btn, "<Button-1>", lambda k : menu_fn(canvas))
        canvas.tag_bind(menu_txt, "<Button-1>", lambda k : menu_fn(canvas))
        
        exit_btn = canvas.create_rectangle(615, 10, 675, 40, fill='white')
        exit_txt = canvas.create_text(645, 25, text="Exit", fill='black')
        canvas.tag_bind(exit_btn, "<Button-1>", lambda k : exit_fn())
        canvas.tag_bind(exit_txt, "<Button-1>", lambda k : exit_fn())

        if self.step == 1:
            canvas.create_text(canvas_dims[0]//2, 100, text="Paste the XGID", font=myfont, fill="white", tags="add_position1")
            xgid_var=tk.StringVar()
            entry = tk.Entry(width=50, font=mysmallfont, textvariable=xgid_var)
            canvas.create_window(350, 130, window=entry, tags="add_position1")

            next_btn_1 = canvas.create_rectangle(canvas_dims[0]//2 - 30, 150, canvas_dims[0]//2 + 30, 170, fill='white', \
                    tags=("add_position1_next", "add_position1"))
            next_txt_1 = canvas.create_text(canvas_dims[0]//2, 160, text='Next', font=mysmallfont, fill="black", \
                    tags=("add_position1_next", "add_position1"))
            canvas.tag_bind(next_btn_1, "<Button-1>", lambda k : add_position_next_fn(canvas, xgid_var, 1))
            canvas.tag_bind(next_txt_1, "<Button-1>", lambda k : add_position_next_fn(canvas, xgid_var, 1))

        elif self.step == 2:
            print("ADD", self.add_position_log)
            root = self.add_position_log[app.step - 2][:-1]
            if xgid.is_cube(root):
                self.schema = self.schema.children["Cube"]
            else:
                self.schema = self.schema.children["Checker"]
            
            canvas.create_text(canvas_dims[0]//2, 200, text="Select Stage", font=myfont, fill="white", tags="add_position2")
            listbox_1 = tk.Listbox(font=mysmallfont)
            listbox_1.insert(tk.END, "None")
            for elem in self.schema.children:
                listbox_1.insert(tk.END, elem)
            options_height = 25 * min(6, len(self.schema.children))
            canvas.create_window(350, 270, width=100, height=options_height, window=listbox_1, tags="add_position2")

            if len(self.schema.children) > 5:
                scrollbar_1 = ttk.Scrollbar(orient=tk.VERTICAL, command=listbox.yview)
                listbox_1.config(yscrollcommand=scrollbar_1.set)
                scrollbar_1.place(x=canvas_dims[0]//2 + 120, y=230, height=150, tags="add_position2")

            next_btn_1 = canvas.create_rectangle(canvas_dims[0]//2 - 30, 330, canvas_dims[0]//2 + 30, 350, fill='white', \
                    tags=("add_position2_next", "add_position2"))
            next_txt_1 = canvas.create_text(canvas_dims[0]//2, 340, text='Next', font=mysmallfont, fill="black", \
                    tags=("add_position2_next", "add_position2"))
            canvas.tag_bind(next_btn_1, "<Button-1>", lambda k : add_position_next_listbox_fn(canvas, \
                    [listbox_1.get(i) for i in listbox_1.curselection()], 2))
            canvas.tag_bind(next_txt_1, "<Button-1>", lambda k : add_position_next_listbox_fn(canvas, \
                    [listbox_1.get(i) for i in listbox_1.curselection()], 2))

        elif self.step == 3:
            print("ADD", self.add_position_log)
            root = self.add_position_log[self.step - 2][:-1]
            self.schema = self.schema.children[root]

            canvas.create_text(canvas_dims[0]//2, 380, text="Select Categories", font=myfont, fill="white", tags="add_position3")
            listbox_2 = tk.Listbox(selectmode=tk.MULTIPLE, font=mysmallfont)
            listbox_2.insert(tk.END, "None")
            for elem in self.schema.children:
                listbox_2.insert(tk.END, elem)
            options_height = 25 * min(6, len(self.schema.children))
            canvas.create_window(350, 475, width=150, height=options_height, window=listbox_2, tags="add_position3")

            if len(self.schema.children) > 5:
                scrollbar_2 = ttk.Scrollbar(orient=tk.VERTICAL, command=listbox_2.yview)
                listbox_2.config(yscrollcommand=scrollbar_2.set)
                canvas.create_window(440, 475, height=150, window=scrollbar_2, tags="add_position3")

            next_btn_2 = canvas.create_rectangle(canvas_dims[0]//2 - 30, 560, canvas_dims[0]//2 + 30, 580, fill='white', \
                    tags=("add_position3_next", "add_position3"))
            next_txt_2 = canvas.create_text(canvas_dims[0]//2, 570, text='Next', font=mysmallfont, fill="black", \
                    tags=("add_position3_next", "add_position3"))
            canvas.tag_bind(next_btn_2, "<Button-1>", lambda k : add_position_next_listbox_fn(canvas, \
                    [listbox_2.get(i) for i in listbox_2.curselection()], 3))
            canvas.tag_bind(next_txt_2, "<Button-1>", lambda k : add_position_next_listbox_fn(canvas, \
                    [listbox_2.get(i) for i in listbox_2.curselection()], 3))

        elif self.step == 4:
            root = self.add_position_log[self.step - 2][1:-1]
            self.schema = self.schema.children[root]

            submit_btn = canvas.create_rectangle(canvas_dims[0]//2 - 30, 600, canvas_dims[0]//2 + 30, 620, fill='gray', tags="add_position4")
            submit_txt = canvas.create_text(canvas_dims[0]//2, 610, text='Submit', font=mysmallfont, fill="white", tags="add_position4")
            canvas.tag_bind(submit_btn, "<Button-1>", lambda k : add_position_submit_fn(canvas))
            canvas.tag_bind(submit_txt, "<Button-1>", lambda k : add_position_submit_fn(canvas))
            
    # converts filter input into proper format
    def generate_filter_words(self, last_word):
        print("last word = ", last_word)
        if last_word == "ALL":
            print("good")
            return []
        if last_word == "AND" or last_word == "OR" or last_word == "(":
            return ["("] + list(self.schema.children.keys())
        if not last_word:
            return ["(", "ALL"] + list(self.schema.children.keys())
        else:
            res = ["AND", "OR"]
            if self.filter_paren > 0: res.append(")")
            return res

    def filter_is_repeated(self, word):
        return word != "AND" and word != "OR" and word != "ALL" and word != "(" and word != ")" and word in self.create_deck_log

     # runs when inside create deck scene
    def make_create_deck_canvas(self, is_schema):
        canvas = self.create_deck_canvas
        
        undo_btn = canvas.create_rectangle(25, 10, 85, 40, fill='white')
        undo_txt = canvas.create_text(55, 25, text='Undo', font=mysmallfont, fill="black")
        canvas.tag_bind(undo_btn, "<Button-1>", lambda k : create_deck_undo_fn(canvas))
        canvas.tag_bind(undo_txt, "<Button-1>", lambda k : create_deck_undo_fn(canvas))

        menu_btn = canvas.create_rectangle(535, 10, 595, 40, fill='white')
        menu_txt = canvas.create_text(565, 25, text="Menu", fill='black')
        canvas.tag_bind(menu_btn, "<Button-1>", lambda k : menu_fn(canvas))
        canvas.tag_bind(menu_txt, "<Button-1>", lambda k : menu_fn(canvas))

        exit_btn = canvas.create_rectangle(615, 10, 675, 40, fill='white')
        exit_txt = canvas.create_text(645, 25, text="Exit", fill='black')
        canvas.tag_bind(exit_btn, "<Button-1>", lambda k : exit_fn())
        canvas.tag_bind(exit_txt, "<Button-1>", lambda k : exit_fn())

        if self.step == 1:
            canvas.create_text(canvas_dims[0]//2, 100, text="Checker or Cube?", font=myfont, fill="white", tags="create_deck1")
            listbox_1 = tk.Listbox(font=mysmallfont)
            listbox_1.insert(tk.END, "Checker")
            listbox_1.insert(tk.END, "Cube")
            print("listbox created")
            canvas.create_window(350, 140, width=100, height=50, window=listbox_1, tags="create_deck1")

            next_btn_1 = canvas.create_rectangle(canvas_dims[0]//2 - 30, 170, canvas_dims[0]//2 + 30, 190, fill='white', \
                    tags=("create_deck1_next", "create_deck1"))
            next_txt_1 = canvas.create_text(canvas_dims[0]//2, 180, text='Next', font=mysmallfont, fill="black", \
                    tags=("create_deck1_next", "create_deck1"))
            canvas.tag_bind(next_btn_1, "<Button-1>", lambda k : create_deck_next_fn(canvas, [listbox_1.get(i) for i in listbox_1.curselection()], 1))
            canvas.tag_bind(next_txt_1, "<Button-1>", lambda k : create_deck_next_fn(canvas, [listbox_1.get(i) for i in listbox_1.curselection()], 1))

        elif self.step == 2:
            print("SCHEMA", self.schema.root, self.create_deck_log)
            self.schema = self.schema.children[self.create_deck_log[self.step - 2][:-1]]

            canvas.create_text(canvas_dims[0]//2, 210, text="Select Stage", font=myfont, fill="white", tags="create_deck2")
            listbox_2 = tk.Listbox(font=mysmallfont)
            listbox_2.insert(tk.END, "ALL")
            for elem in self.schema.children:
                listbox_2.insert(tk.END, elem)
            options_height = 25 * min(6, len(self.schema.children))
            canvas.create_window(350, 280, width=100, height=options_height, window=listbox_2, tags="create_deck2")

            if len(self.schema.children) > 5:
                scrollbar_2 = ttk.Scrollbar(orient=tk.VERTICAL, command=listbox_2.yview)
                listbox_2.config(yscrollcommand=scrollbar_2.set)
                scrollbar_2.place(x=canvas_dims[0]//2 + 120, y=240, height=150, tags="create_deck2")

            next_btn_2 = canvas.create_rectangle(canvas_dims[0]//2 - 30, 340, canvas_dims[0]//2 + 30, 360, fill='white', \
                    tags=("create_deck2_next", "create_deck2"))
            next_txt_2 = canvas.create_text(canvas_dims[0]//2, 350, text='Next', font=mysmallfont, fill="black", \
                    tags=("create_deck2_next", "create_deck2"))
            canvas.tag_bind(next_btn_2, "<Button-1>", lambda k : create_deck_next_fn(canvas, [listbox_2.get(i) for i in listbox_2.curselection()], 2))
            canvas.tag_bind(next_txt_2, "<Button-1>", lambda k : create_deck_next_fn(canvas, [listbox_2.get(i) for i in listbox_2.curselection()], 2))

        elif self.step == 3:
            print("SCHEMA", self.schema.root, self.create_deck_log)
            if (not is_schema) and len(self.create_deck_log) <= 2:
                self.schema = self.schema.children[self.create_deck_log[self.step - 2][:-1]]
            last_word = self.create_deck_log[-1] if len(self.create_deck_log) > 2 else None

            canvas.create_text(canvas_dims[0]//2, 380, text="Enter the filter", font=myfont, fill="white", tags="create_deck3")
            canvas.create_text(canvas_dims[0]//2, 410, text=" ".join(self.create_deck_log[2:]), fill="white", tags="create_deck3")
            canvas.create_rectangle(canvas_dims[0]//2 - 200, 400, canvas_dims[0]//2 + 200, 420, outline="white", tags="create_deck3")
            listbox_3 = tk.Listbox(font=mysmallfont)
            filter_list = self.generate_filter_words(last_word)
            print("filter", filter_list)
            for elem in filter_list:
                if not self.filter_is_repeated(elem):
                    listbox_3.insert(tk.END, elem)
            options_height = 25 * min(6, len(filter_list))
            if len(filter_list) > 0:
                canvas.create_window(350, 430 + (options_height//2), width=150, height=options_height, window=listbox_3, tags="create_deck3")

            if len(filter_list) > 5:
                scrollbar_3 = ttk.Scrollbar(orient=tk.VERTICAL, command=listbox_3.yview)
                listbox_3.config(yscrollcommand=scrollbar_3.set)
                canvas.create_window(canvas_dims[0]//2 + 120, 600, height=150, tags="create_deck3")
                #scrollbar_3.place(x=canvas_dims[0]//2 + 120, y=600+(options_height//2), height=150)

            if len(self.create_deck_log) > 2:
                undo_filter_btn = canvas.create_rectangle(canvas_dims[0]//2 + 50, 590, canvas_dims[0]//2 + 110, 610, fill='white', tags="create_deck3")
                undo_filter_txt = canvas.create_text(canvas_dims[0]//2 + 80, 600, text='Undo', font=mysmallfont, fill="black", tags="create_deck3")
                canvas.tag_bind(undo_filter_btn, "<Button-1>", lambda k : create_deck_undo_filter_fn(canvas))
                canvas.tag_bind(undo_filter_txt, "<Button-1>", lambda k : create_deck_undo_filter_fn(canvas))

            next_btn_3 = canvas.create_rectangle(canvas_dims[0]//2 - 30, 590, canvas_dims[0]//2 + 30, 610, fill='white', \
                    tags=("create_deck3_next", "create_deck3"))
            next_txt_3 = canvas.create_text(canvas_dims[0]//2, 600, text='Next', font=mysmallfont, fill="black", \
                    tags=("create_deck3_next", "create_deck3"))
            canvas.tag_bind(next_btn_3, "<Button-1>", lambda k : create_deck_next_fn(canvas, [listbox_3.get(i) for i in listbox_3.curselection()], 3))
            canvas.tag_bind(next_txt_3, "<Button-1>", lambda k : create_deck_next_fn(canvas, [listbox_3.get(i) for i in listbox_3.curselection()], 3))

            if self.filter_paren == 0 and (last_word and last_word != "AND" and last_word != "OR"):
                done_btn = canvas.create_rectangle(canvas_dims[0]//2 - 110, 590, canvas_dims[0]//2 - 50, 610, fill='white', tags="create_deck3")
                done_txt = canvas.create_text(canvas_dims[0]//2 - 80, 600, text='Done', font=mysmallfont, fill="black", tags="create_deck3")
                canvas.tag_bind(done_btn, "<Button-1>", lambda k : create_deck_done_fn())
                canvas.tag_bind(done_txt, "<Button-1>", lambda k : create_deck_done_fn())

        elif self.step == 4:
            canvas.create_text(canvas_dims[0]//2 - 100, 630, text="Name:", font=mysmallfont, fill='white',tags="create_deck4")
            name_var=tk.StringVar()
            entry = tk.Entry(width=15, font=mysmallfont, textvariable=name_var)
            canvas.create_window(350, 630, window=entry, tags="create_deck4")

            next_btn_4 = canvas.create_rectangle(canvas_dims[0]//2 + 80, 620, canvas_dims[0]//2 + 140, 640, fill='white', \
                    tags=("create_deck4_next", "create_deck4"))
            next_txt_4 = canvas.create_text(canvas_dims[0]//2 + 110, 630, text='Next', font=mysmallfont, fill="black", \
                    tags=("create_deck4_next", "create_deck4"))
            canvas.tag_bind(next_btn_4, "<Button-1>", lambda k : create_deck_next_fn(canvas, [name_var], 4))
            canvas.tag_bind(next_txt_4, "<Button-1>", lambda k : create_deck_next_fn(canvas, [name_var], 4))

        elif self.step == 5:
            submit_btn = canvas.create_rectangle(canvas_dims[0]//2 - 30, 620, canvas_dims[0]//2 + 30, 640, fill='gray', tags="add_position4")
            submit_txt = canvas.create_text(canvas_dims[0]//2, 630, text='Submit', font=mysmallfont, fill="white", tags="add_position4")
            canvas.tag_bind(submit_btn, "<Button-1>", lambda k : create_deck_submit_fn(canvas))
            canvas.tag_bind(submit_txt, "<Button-1>", lambda k : create_deck_submit_fn(canvas))

     # runs when inside play deck scene
    def make_play_deck_canvas(self):
        print("play")
        canvas = self.play_deck_canvas

        undo_btn = canvas.create_rectangle(25, 10, 85, 40, fill='white')
        undo_txt = canvas.create_text(55, 25, text='Undo', font=mysmallfont, fill="black")
        canvas.tag_bind(undo_btn, "<Button-1>", lambda k : create_deck_undo_fn(canvas))
        canvas.tag_bind(undo_txt, "<Button-1>", lambda k : create_deck_undo_fn(canvas))

        menu_btn = canvas.create_rectangle(535, 10, 595, 40, fill='white')
        menu_txt = canvas.create_text(565, 25, text="Menu", fill='black')
        canvas.tag_bind(menu_btn, "<Button-1>", lambda k : menu_fn(canvas))
        canvas.tag_bind(menu_txt, "<Button-1>", lambda k : menu_fn(canvas))

        exit_btn = canvas.create_rectangle(615, 10, 675, 40, fill='white')
        exit_txt = canvas.create_text(645, 25, text="Exit", fill='black')
        canvas.tag_bind(exit_btn, "<Button-1>", lambda k : exit_fn())
        canvas.tag_bind(exit_txt, "<Button-1>", lambda k : exit_fn())

        canvas.create_text(canvas_dims[0]//2, 100, text='Choose a deck', font=myfont, fill='white')
        listbox = tk.Listbox(font=mysmallfont)
        deck_list = os.listdir("test_decks")
        sorted_deck_list = sorted(deck_list)
        for elem in sorted_deck_list:
            if elem not in ["temp", "mistakes", "blunders"]:
                listbox.insert(tk.END, str(elem))
                options_height = 25 * min(10, len(deck_list))
        
        canvas.create_window(350, 130 + (options_height//2), width=200, height=options_height, window=listbox)
        play_btn = canvas.create_rectangle(canvas_dims[0]//2 - 30, 390, canvas_dims[0]//2 + 30, 410, fill='white')
        play_txt = canvas.create_text(canvas_dims[0]//2, 400, text='Play', font=mysmallfont, fill="black")
        canvas.tag_bind(play_btn, "<Button-1>", lambda k : play_deck_start_fn([listbox.get(i) for i in listbox.curselection()], True))
        canvas.tag_bind(play_txt, "<Button-1>", lambda k : play_deck_start_fn([listbox.get(i) for i in listbox.curselection()], True))

     # runs when inside setting scene
    def make_settings_canvas(self):
        canvas = self.settings_canvas

        undo_btn = canvas.create_rectangle(25, 10, 85, 40, fill='white')
        undo_txt = canvas.create_text(55, 25, text='Undo', font=mysmallfont, fill="black")
        canvas.tag_bind(undo_btn, "<Button-1>", lambda k : create_deck_undo_fn(canvas))
        canvas.tag_bind(undo_txt, "<Button-1>", lambda k : create_deck_undo_fn(canvas))

        menu_btn = canvas.create_rectangle(535, 10, 595, 40, fill='white')
        menu_txt = canvas.create_text(565, 25, text="Menu", fill='black')
        canvas.tag_bind(menu_btn, "<Button-1>", lambda k : menu_fn(canvas))
        canvas.tag_bind(menu_txt, "<Button-1>", lambda k : menu_fn(canvas))

        exit_btn = canvas.create_rectangle(615, 10, 675, 40, fill='white')
        exit_txt = canvas.create_text(645, 25, text="Exit", fill='black')
        canvas.tag_bind(exit_btn, "<Button-1>", lambda k : exit_fn())
        canvas.tag_bind(exit_txt, "<Button-1>", lambda k : exit_fn())

        canvas.create_text(canvas_dims[0]//2, 60, text='Settings', font=mylargefont, fill='white')

        canvas.create_text(canvas_dims[0]//2, 100, text='Choose an analysis level', font=myfont, fill='white')
        listbox = tk.Listbox(font=mysmallfont)
        listbox.insert(tk.END, "1-ply")
        listbox.insert(tk.END, "2-ply")
        listbox.insert(tk.END, "3-ply")
        listbox.insert(tk.END, "4-ply")
        canvas.create_window(350, 180, width=100, height=80, window=listbox)
        
        set_btn = canvas.create_rectangle(canvas_dims[0]//2 - 30, 230, canvas_dims[0]//2 + 30, 250, fill='white')
        set_txt = canvas.create_text(canvas_dims[0]//2, 240, text='Set', font=mysmallfont, fill="black")
        canvas.tag_bind(set_btn, "<Button-1>", lambda k : set_analysis_fn([listbox.get(i) for i in listbox.curselection()], canvas))
        canvas.tag_bind(set_txt, "<Button-1>", lambda k : set_analysis_fn([listbox.get(i) for i in listbox.curselection()], canvas))

    # creates the outro scene seen when end of deck reached
    def create_outro(self):
        global num_positions

        canvas = tk.Canvas(self.root, width=canvas_dims[0], height=canvas_dims[1], bg="black")
        self.canvases[num_positions + 1] = (canvas, None)

        play_again_btn = canvas.create_rectangle(canvas_dims[0]//2 - 80, 280, canvas_dims[0]//2 + 80, 320, fill='white')
        play_again_txt = canvas.create_text(canvas_dims[0]//2, 300, text='Play Again', font=myfont, fill="black")
        canvas.tag_bind(play_again_btn, "<Button-1>", lambda k : restart_fn("play again"))
        canvas.tag_bind(play_again_txt, "<Button-1>", lambda k : restart_fn("play again"))

        exit_btn = canvas.create_rectangle(615, 10, 675, 40, fill='white')
        exit_txt = canvas.create_text(645, 25, text="Exit", fill='black')
        canvas.tag_bind(exit_btn, "<Button-1>", lambda k : exit_fn())
        canvas.tag_bind(exit_txt, "<Button-1>", lambda k : exit_fn())

        menu_btn = canvas.create_rectangle(535, 10, 595, 40, fill='white')
        menu_txt = canvas.create_text(565, 25, text="Menu", fill='black')
        canvas.tag_bind(menu_btn, "<Button-1>", lambda k : menu_from_game_fn())
        canvas.tag_bind(menu_txt, "<Button-1>", lambda k : menu_from_game_fn())

        if self.mistakes == 0 and self.blunders == 0:
            canvas.create_text(canvas_dims[0]//2, 200, text='Nice Job!', font=("Arial", 36), fill='white')

        elif self.blunders > 0 and self.mistakes == 0:
            play_again_blunders_btn = canvas.create_rectangle(canvas_dims[0]//2 - 120, 340, canvas_dims[0]//2 + 120, 380, fill='white')
            play_again_blunders_txt = canvas.create_text(canvas_dims[0]//2, 360, text='Review Only Blunders', font=mysmallfont, fill="black")
            canvas.tag_bind(play_again_blunders_btn, "<Button-1>", lambda k : restart_fn("blunders"))
            canvas.tag_bind(play_again_blunders_txt, "<Button-1>", lambda k : restart_fn("blunders"))

        elif self.mistakes > 0:
            play_again_mistakes_btn = canvas.create_rectangle(canvas_dims[0]//2 - 120, 340, canvas_dims[0]//2 + 120, 380, fill='white')
            play_again_mistakes_txt = canvas.create_text(canvas_dims[0]//2, 360, text='Review Mistakes & Blunders', font=mysmallfont, fill="black")
            canvas.tag_bind(play_again_mistakes_btn, "<Button-1>", lambda k : restart_fn("mistakes"))
            canvas.tag_bind(play_again_mistakes_txt, "<Button-1>", lambda k : restart_fn("mistakes"))

            if self.blunders > 0:
                play_again_blunders_btn = canvas.create_rectangle(canvas_dims[0]//2 - 120, 400, canvas_dims[0]//2 + 120, 440, fill='white')
                play_again_blunders_txt = canvas.create_text(canvas_dims[0]//2, 420, text='Review Only Blunders', font=mysmallfont, fill="black")
                canvas.tag_bind(play_again_blunders_btn, "<Button-1>", lambda k : restart_fn("blunders"))
                canvas.tag_bind(play_again_blunders_txt, "<Button-1>", lambda k : restart_fn("blunders"))

        print("STATS", self.correct, self.mistakes, self.blunders)
        canvas.stats = canvas.create_text(canvas_dims[0] // 2, canvas_dims[1] - 40, \
            text="Correct: " + str(self.correct) + "\tMistake: " + str(self.mistakes) + "\tBlunders: " + str(self.blunders), \
            font=myfont, fill='white', tags='texts')

    # creates an additional card in the deck
    def create_canvas(self, xgid, file_path):
        canvas_1 = tk.Canvas(self.root, width=canvas_dims[0], height=canvas_dims[1], bg="black")
        canvas_2 = tk.Canvas(self.root, width=canvas_dims[0], height=canvas_dims[1], bg="black")

        self.current_index += 1
        self.canvases[self.current_index] = (canvas_1, canvas_2)
        #self.current_canvas = canvas_1
        self.xgid_map[self.current_index] = (xgid, file_path)
        print("XGID", self.xgid_map)
        configure_board(canvas_1, Board(xgid, file_path))
        print(len(self.canvases))
        print(self.current_index)
        print(xgid)

    # given board info, shows it's card on screen
    def show_canvas(self, startmenu=None, boardinfo=None):
        global num_positions

        self.current_canvas.pack_forget()

        if startmenu == "add position":
            self.current_canvas = self.add_position_canvas
            self.current_canvas.pack()
            return
        elif startmenu == "create deck":
            self.current_canvas = self.create_deck_canvas
            self.current_canvas.pack()
            return
        elif startmenu == "play deck":
            self.current_canvas = self.play_deck_canvas
            self.current_canvas.pack()
            return
        elif startmenu == "settings":
            self.current_canvas = self.settings_canvas
            self.current_canvas.pack()
            return
        
        print("forget index", self.current_index, num_positions)
        if self.current_index == 0:
            self.current_canvas = self.canvases[self.current_index][0]
            self.current_canvas.pack()
            return

        if self.current_index == num_positions + 1:
            print("Creating outro")
            self.create_outro()
            self.current_canvas = self.canvases[self.current_index][0]
            self.current_canvas.pack()
            return

        xgid, file_path = self.xgid_map[self.current_index]
        if not boardinfo: boardinfo = Board(xgid, file_path)
        if self.analysis: 
            print("show analysis")
            self.current_canvas = self.canvases[self.current_index][1]
            configure_board(self.current_canvas, boardinfo, analysis=get_analysis(xgid))
        else:
            self.current_canvas = self.canvases[self.current_index][0]
            configure_board(self.current_canvas, boardinfo)
        self.current_canvas.pack()

    
    def switch_index(self, index):
         self.current_index = index
         self.show_canvas()

    # not needed
    def switch_right(self, event):
        global num_positions

        print("right")
        if self.current_index == 0 or self.current_index == num_positions:
            self.current_index += 1
            self.show_canvas()
            return

        if self.analysis == False:
            # run the review and add to priority queue
            xgid = self.xgid_map[self.current_index]
            self.current_index += 1
            self.show_canvas()
            print(len(self.canvases))
            print(self.current_index)

    # not needed
    def switch_up(self, event):
        self.analysis = True
        self.show_canvas()

    # not needed
    def switch_down(self, event):
        self.analysis = False
        self.show_canvas()

    # adds the result of the question to the deck stats
    def incr_stats(self, category):
        if category == "correct":
            self.correct += 1
        elif category == "mistake":
            self.mistakes += 1
        else:
            self.blunders += 1
        print("STATS", self.correct, self.mistakes, self.blunders)

root = tk.Tk()
root.attributes('-fullscreen', True)
root.geometry("700x660")
app = App(root)

# retrieve dice image of number
def get_dice_image(d):
    print(d)
    if d == 1:
        image = Image.open(r'C:\Users\aadam\Documents\Blunderbase\Graphics\Dice_1.png')
    elif d == 2:
        image = Image.open(r'C:\Users\aadam\Documents\Blunderbase\Graphics\Dice_2.png')
    elif d == 3:
        image = Image.open(r'C:\Users\aadam\Documents\Blunderbase\Graphics\Dice_3.png') 
    elif d == 4:
        print("here")
        image = Image.open(r'C:\Users\aadam\Documents\Blunderbase\Graphics\Dice_4.png')
    elif d == 5:
        image = Image.open(r'C:\Users\aadam\Documents\Blunderbase\Graphics\Dice_5.png')
    elif d == 6:
        image = Image.open(r'C:\Users\aadam\Documents\Blunderbase\Graphics\Dice_6.png')
    photo = image.resize((30,30), Image.Resampling.LANCZOS)
    photo = ImageTk.PhotoImage(photo)
    return photo

# finds total length of all checkers moved
def moveLength(move):
    index = move.find('(')
    if index != -1:
        mult = int(move[index+1])
    else:
        mult = 1
    print(move, mult)

    move_split = re.split(r'[*(/]', move)
    print(move_split)
    if move_split[0] == 'bar':
        old_pos = 25
    else:
        old_pos = int(move_split[0])
    if move_split[1] == 'off':
        new_pos = 0
    else:
        new_pos = int(move_split[1])
    return mult * (old_pos - new_pos)

# converts string of moves into a list
def getMoves(line):
    move_list = []
    for elem in line.split(' '):
        print("elem", elem)
        if elem != '' and not elem.startswith('-') and not elem.startswith('+'):
            move_list.append(elem)
        else: break
    return move_list

# returns true if the move is taking a checker off the board
def is_bearoff(move):
    return move.find("off") != -1

# returns the number of moves and length of moves given board and dice
def getNumMoves(xgid, dice, checkers_home):
    if dice[0] != dice[1]:
        dicesum = dice[0] + dice[1]
        num_dice = 2
    else:
        dicesum = 4 * dice[0]
        num_dice = 4

    analysis = get_analysis(xgid)
    move_list = getMoves(analysis[0][0])

    print(analysis, move_list)
    movesum = 0
    bearoff = False
    for move in move_list:
        movesum += moveLength(move)
        if is_bearoff(move): bearoff = True

    print("dicesum", num_dice, dicesum, movesum)
    if is_bearoff:
        return (min(num_dice, 15 - checkers_home), None)
    if dicesum == movesum:
        return (num_dice, None)
    elif num_dice == 2:
        return (1, movesum)
    return (movesum // dice[0], movesum)


# class representation of board, consisting of data from xgid
class Board:
    def __init__(self, xgid, file_path):
        print("XGID!", xgid)
        parts = xgid.split(':')
        board = parts[0][5:]
        cube = parts[1]
        cube_position = parts[2]
        turn = parts[3]
        dice = parts[4]
        score_bottom = parts[5]
        score_top = parts[6]
        crawford = parts[7]
        length = parts[8]
        max_cube = parts[9]

        self.white_home, self.black_home = 15, 15
        self.xgid = xgid
        self.board = [0] * 24
        self.black_pip_count, self.white_pip_count = 0, 0
        for i, c in enumerate(board[1:-1]):
            if ord(c) == 45:
                # blank
                self.board[i] = 0
            elif ord(c) < 80:
                # white
                self.board[i] = ord(c) - 64
                self.white_home -= self.board[i]
                self.white_pip_count += ((i+1) * self.board[i])
            else:
                # black
                self.board[i] = 96 - ord(c)
                self.black_home += self.board[i]
                self.black_pip_count += ((24-i) * (-self.board[i]))
        print("BOARD:", board)

        if board[-1] == '-': self.white_bar = 0
        else:
            # white
            self.white_bar = ord(board[-1]) - 64
            self.white_home -= self.white_bar
        if board[0] == '-': self.black_bar = 0
        else:
            self.black_bar = ord(board[0]) - 96
            self.black_home -= self.black_bar
        self.white_pip_count += (25 * self.white_bar)
        self.black_pip_count += (25 * self.black_bar)

        if cube == '0': self.cube = '64'
        else: self.cube = str(2**int(cube))
        self.cube_pos = int(cube_position)
        self.dice = (int(dice[0]), int(dice[1]))
        if dice == '00': self.isCube = True
        else: 
            self.isCube = False
            self.dice1 = get_dice_image(self.dice[0])
            self.dice2 = get_dice_image(self.dice[1])

        self.isDouble = False
        self.isRoll = False
        self.isTake = False
        self.isPass = False
        self.movelog = [] # list((int, int))

        self.score_bot = score_bottom
        self.score_top = score_top
        if crawford == '1': self.crawford = True
        else: self.crawford = False

        self.length = length
        self.file_path = file_path
        print("finished:")

# canvas function that places checkers in gui representation of board
def place_checkers(canvas, boardinfo, pos, num, color):
    checkers = min(5, num)
    if color == 'white': text_color = 'black'
    else: text_color = 'white'
    if pos >= 18:
        for i in range(checkers):
            x = canvas.create_oval(marg[0]+320+40*(pos-18), marg[1]+40+40*i, marg[0]+360+40*(pos-18),  marg[1]+80+40*i, fill=color)
            if num > 5:
                canvas.create_text(marg[0]+340+40*(pos-18), marg[1]+220, text=str(num), fill=text_color)
            if color == 'white': canvas.tag_bind(x, "<Button-1>", lambda k: move_fn(canvas, boardinfo, pos))

    elif pos >= 12:
        for i in range(checkers):
            x = canvas.create_oval(marg[0]+40+40*(pos-12), marg[1]+40+40*i, marg[0]+80+40*(pos-12), marg[1]+80+40*i, fill=color)
            if num > 5:
                canvas.create_text(marg[0]+60+40*(pos-12), marg[1]+220, text=str(num), fill=text_color)
            if color == 'white': canvas.tag_bind(x, "<Button-1>", lambda k: move_fn(canvas, boardinfo, pos))
    elif pos >= 6:
        for i in range(checkers):
            x = canvas.create_oval(marg[0]+240-40*(pos-6), marg[1]+480-40*i, marg[0]+280-40*(pos-6), marg[1]+520-40*i, fill=color)
            if num > 5:
                canvas.create_text(marg[0]+260-40*(pos-6), marg[1]+340, text=str(num), fill=text_color)
            if color == 'white': canvas.tag_bind(x, "<Button-1>", lambda k: move_fn(canvas, boardinfo, pos))
    else:
        for i in range(checkers):
            x = canvas.create_oval(marg[0]+520-40*(pos), marg[1]+480-40*i, marg[0]+560-40*(pos), marg[1]+520-40*i, fill=color)
            if num > 5:
                canvas.create_text(marg[0]+540-40*(pos), marg[1]+340, text=str(num), fill=text_color)
            if color == 'white': canvas.tag_bind(x, "<Button-1>", lambda k: move_fn(canvas, boardinfo, pos))

# canvas function that places dice images on canvas and configures them as buttons
def create_dice(canvas, boardinfo):
    x = canvas.create_image(marg[0]+420, marg[1]+280, image=boardinfo.dice1)
    canvas.tag_bind(x, "<Button-1>", lambda k: swap_fn(canvas, boardinfo))

    y = canvas.create_image(marg[0]+460, marg[1]+280, image=boardinfo.dice2)
    canvas.tag_bind(y, "<Button-1>", lambda k: swap_fn(canvas, boardinfo))

# converts analysis lines into a single text
def unpack_analysis(lines):
    text = ""
    for line in lines:
        text += (line + '\n')
    return text

# helper function for matching move played with one of the moves in the analysis
def handle_regular(move, log_dict, dice, is_capture):
    print("handle regular", move.pos, log_dict, dice, is_capture)
    if not move: return False
    old_pos, new_pos = move.pos[0], move.pos[1]
    if (old_pos, new_pos, is_capture) in log_dict:
        log_dict[(old_pos, new_pos, is_capture)] -= 1
        if log_dict[(old_pos, new_pos, is_capture)] == 0:
            del log_dict[(old_pos, new_pos, is_capture)]
        return True

    elif (old_pos, old_pos - dice[0], False) in log_dict:
        move.pos[0] = old_pos - dice[0]
        log_dict[(old_pos, move.pos[0], False)] -= 1
        if log_dict[(old_pos, move.pos[0], False)] == 0:
            del log_dict[(old_pos, move.pos[0], False)]
        return handle_regular(move, log_dict, dice, is_capture)
    
    elif (old_pos, old_pos - dice[1], False) in log_dict:
        move.pos[0] = old_pos - dice[1]
        log_dict[(old_pos, move.pos[0], False)] -= 1
        if log_dict[(old_pos, move.pos[0], False)] == 0:
            del log_dict[(old_pos, move.pos[0], False)]
        return handle_regular(move, log_dict, dice, is_capture)
    
    else:
        return False

# helper function for matching move played with one of the moves in the analysis
def isDecisionMatch(line, boardinfo):
    print("Decision match", re.split(r'[+-]+', line)[0], boardinfo.isDouble, boardinfo.isTake, boardinfo.isPass, boardinfo.isRoll)
    if boardinfo.isCube:
        decision = re.split(r'[+-]+', line)[0]
        if decision.startswith("Double, take"):
            print(boardinfo.isDouble and boardinfo.isTake)
            return boardinfo.isDouble and boardinfo.isTake
        elif decision.startswith("Double, pass"):
            print(boardinfo.isDouble and boardinfo.isPass)
            return boardinfo.isDouble and boardinfo.isPass
        else:
            print(boardinfo.isRoll)
            return boardinfo.isRoll
    else:
        move_list = getMoves(line)
        log_dict = Counter(boardinfo.movelog) # (old_pos, new_pos, is_capture)
        for move in move_list:
            print("MOVE", move)
            class_move = Move(move)
            print("CAT", class_move.cat, class_move.pos, class_move.mult)
            print("BOARD", boardinfo.movelog)
            if class_move.cat == "regular":
                if not handle_regular(class_move, log_dict, boardinfo.dice, False): return False
            elif class_move.cat == "capture":
                if not handle_regular(class_move, log_dict, boardinfo.dice, True): return False
            elif class_move.cat == "double":
                for i in range(class_move.mult):
                    print(i, "i")
                    if not handle_regular(copy.deepcopy(class_move), log_dict, boardinfo.dice, False): return False
            elif class_move.cat == "pick_pass":
                first_move = copy.copy(class_move)
                first_move.pos = [class_move.pos[0], class_move.pos[1]]
                second_move = copy.copy(class_move)
                second_move.pos = [class_move.pos[1], class_move.pos[2]]
                
                if not handle_regular(first_move, log_dict, boardinfo.dice, True): return False
                if not handle_regular(second_move, log_dict, boardinfo.dice, False): return False
        print("Done compare", log_dict)
        return len(log_dict) == 0

# configures the board state into a visual representation on canvas
def configure_board(canvas, boardinfo, mode="none", analysis=None):
    global app, root_dir

    # delete old texts
    canvas.delete("texts")

    # board design
    canvas.create_rectangle(marg[0]+40, marg[1]+40, marg[0]+560, marg[1]+520, fill='gray')
    canvas.create_rectangle(marg[0], marg[1], marg[0]+600, marg[1]+40, fill='black')
    canvas.create_rectangle(marg[0], marg[1]+650, marg[0]+600, marg[1]+560, fill='black')
    canvas.create_rectangle(marg[0], marg[1]+40, marg[0]+40, marg[1]+520, fill='brown')
    canvas.create_rectangle(marg[0]+560, marg[1]+40, marg[0]+600, marg[1]+520, fill='brown')
    canvas.create_rectangle(marg[0]+280, marg[1]+40, marg[0]+320, marg[1]+520, fill='brown')

    canvas.create_line(marg[0]+300, marg[1]+40, marg[0]+300, marg[1]+520, width=2)

    for i in range(3):
        # top left points
        canvas.create_polygon([marg[0]+40+80*i, marg[1]+40, marg[0]+80+80*i, marg[1]+40, marg[0]+60+80*i, marg[1]+240], fill='green')
        canvas.create_text(marg[0]+60+80*i, marg[1]+30, text=str(13+2*i), font=("Arial", 10), fill='white')
        canvas.create_polygon([marg[0]+80+80*i, marg[1]+40, marg[0]+120+80*i, marg[1]+40, marg[0]+100+80*i, marg[1]+240], fill='lime')
        canvas.create_text(marg[0]+100+80*i, marg[1]+30, text=str(14+2*i), font=("Arial", 10), fill='white')

        # top right points
        canvas.create_polygon([marg[0]+320+80*i, marg[1]+40, marg[0]+360+80*i, marg[1]+40, marg[0]+340+80*i, marg[1]+240], fill='green')
        canvas.create_text(marg[0]+340+80*i, marg[1]+30, text=str(19+2*i), font=("Arial", 10), fill='white')
        canvas.create_polygon([marg[0]+360+80*i, marg[1]+40, marg[0]+400+80*i, marg[1]+40, marg[0]+380+80*i, marg[1]+240], fill='lime')
        canvas.create_text(marg[0]+380+80*i, marg[1]+30, text=str(20+2*i), font=("Arial", 10), fill='white')

        # bottom left points
        canvas.create_polygon([marg[0]+40+80*i, marg[1]+520, marg[0]+80+80*i, marg[1]+520, marg[0]+60+80*i, marg[1]+320], fill='lime')
        canvas.create_text(marg[0]+60+80*i, marg[1]+530, text=str(12-2*i), font=("Arial", 10), fill='white')
        canvas.create_polygon([marg[0]+80+80*i, marg[1]+520, marg[0]+120+80*i, marg[1]+520, marg[0]+100+80*i, marg[1]+320], fill='green')
        canvas.create_text(marg[0]+100+80*i, marg[1]+530, text=str(11-2*i), font=("Arial", 10), fill='white')

        # bottom right points
        canvas.create_polygon([marg[0]+320+80*i, marg[1]+520, marg[0]+360+80*i, marg[1]+520, marg[0]+340+80*i, marg[1]+320], fill='lime')
        canvas.create_text(marg[0]+340+80*i, marg[1]+530, text=str(6-2*i), font=("Arial", 10), fill='white')
        canvas.create_polygon([marg[0]+360+80*i, marg[1]+520, marg[0]+400+80*i, marg[1]+520, marg[0]+380+80*i, marg[1]+320], fill='green')
        canvas.create_text(marg[0]+380+80*i, marg[1]+530, text=str(5-2*i) , font=("Arial", 10), fill='white')

    # pip counts
    canvas.white_pip_count = canvas.create_text(marg[0]+300, marg[1]+20, text=str(boardinfo.black_pip_count), font=myfont, fill='white', tags='texts')
    canvas.black_pip_count = canvas.create_text(marg[0]+300, marg[1]+540, text=str(boardinfo.white_pip_count), font=myfont, fill='white', tags='texts')

    # checkers on board
    for i in range(24):
        checkers = boardinfo.board[i]
        if checkers > 0:
            place_checkers(canvas, boardinfo, i, checkers, 'white')
        elif checkers < 0:
            place_checkers(canvas, boardinfo, i, -checkers, 'black')

    # bar checkers
    if boardinfo.white_bar > 0:
        bar = canvas.create_oval(marg[0]+280, marg[1]+160, marg[0]+320, marg[1]+200, fill='white')
        if boardinfo.white_bar > 1:
            bar_txt = canvas.create_text(marg[0]+300, marg[1]+180, text=str(boardinfo.white_bar), font=myfont, fill='black')
            canvas.tag_bind(bar_txt, "<Button-1>", lambda k: move_fn(canvas, boardinfo, 24))
        canvas.tag_bind(bar, "<Button-1>", lambda k: move_fn(canvas, boardinfo, 24))

    if boardinfo.black_bar > 0:
        x = canvas.create_oval(marg[0]+280, marg[1]+360, marg[0]+320, marg[1]+400, fill='black')
        if boardinfo.black_bar > 1:
            canvas.create_text(marg[0]+300, marg[1]+380, text=str(boardinfo.black_bar), font=myfont, fill='white')

    # home checkers
    for i in range(boardinfo.white_home):
        canvas.create_rectangle(marg[0]+565, marg[1]+462-8*i, marg[0]+595, marg[1]+470-8*i, fill='white', outline='black')
    if boardinfo.white_home > 0:
        canvas.create_text(marg[0]+580, marg[1]+480, text=str(boardinfo.white_home), fill='white')

    for i in range(boardinfo.black_home):
        canvas.create_rectangle(marg[0]+565, marg[1]+90+8*i, marg[0]+595, marg[1]+98+8*i, fill='black', outline='white')
    if boardinfo.black_home > 0:
        canvas.create_text(marg[0]+580, marg[1]+80, text=str(boardinfo.black_home), fill='white')
    
    # cube info
    if boardinfo.cube_pos == 0:
        canvas.create_rectangle(marg[0]+285, marg[1]+265, marg[0]+315, marg[1]+295, fill='white', outline='black')
        canvas.create_text(marg[0]+300, marg[1]+280, text='64', font=myfont, fill='black')
    elif boardinfo.cube_pos == 1:
        canvas.create_rectangle(marg[0]+5, marg[1]+480, marg[0]+35, marg[1]+510, fill='white', outline='black')
        canvas.create_text(marg[0]+20, marg[1]+495, text=boardinfo.cube, font=myfont, fill='black')
    else:
        canvas.create_rectangle(marg[0]+5, marg[1]+50, marg[0]+35, marg[1]+80, fill='white', outline='black')
        canvas.create_text(marg[0]+20, marg[1]+65, text=boardinfo.cube, font=myfont, fill='black')

    # score info
    canvas.create_text(marg[0]+580, marg[1]+60, text=boardinfo.score_top + "/" + boardinfo.length, font=("Arial", 14), fill='white')
    canvas.create_text(marg[0]+580, marg[1]+500, text=boardinfo.score_bot + "/" + boardinfo.length, font=("Arial", 14), fill='white')

    # outside the board

    # title
    title = app.deck_name.replace('_', ' ')
    index = title.find('/')
    canvas.create_text(canvas_dims[0] // 2, marg[1] // 3, text = title[index+1:], font=myfont, fill='white')

    # position no.
    canvas.position_counter = canvas.create_text(canvas_dims[0] // 2, 4 * marg[1] // 5, \
            text="Positon #" + str(app.current_index) + " out of " + str(num_positions), \
            font=myfont, fill='white', tags='texts')

    # stats
    canvas.stats = canvas.create_text(canvas_dims[0] // 2, canvas_dims[1] - 20, \
            text="Correct: " + str(app.correct) + "\tMistake: " + str(app.mistakes) + "\tBlunders: " + str(app.blunders), \
            font=myfont, fill='white', tags='texts')

    # restart, exit, and copy XGID buttons
    restart_btn = canvas.create_rectangle(15, 10, 75, 40, fill='white')
    restart_txt = canvas.create_text(45, 25, text="Restart", fill='black')
    canvas.tag_bind(restart_btn, "<Button-1>", lambda k : restart_fn("all"))
    canvas.tag_bind(restart_txt, "<Button-1>", lambda k : restart_fn("all"))

    exit_btn = canvas.create_rectangle(615, 10, 675, 40, fill='white')
    exit_txt = canvas.create_text(645, 25, text="Exit", fill='black')
    canvas.tag_bind(exit_btn, "<Button-1>", lambda k : exit_fn())
    canvas.tag_bind(exit_txt, "<Button-1>", lambda k : exit_fn())

    copy_xgid_btn = canvas.create_rectangle(90, 10, 150, 40, fill='white')
    copy_xgid_txt = canvas.create_text(120, 25, text="Copy", fill='black')
    canvas.tag_bind(copy_xgid_btn, "<Button-1>", lambda k : copy_xgid_fn(boardinfo.xgid))
    canvas.tag_bind(copy_xgid_txt, "<Button-1>", lambda k : copy_xgid_fn(boardinfo.xgid))

    menu_btn = canvas.create_rectangle(535, 10, 595, 40, fill='white')
    menu_txt = canvas.create_text(565, 25, text="Menu", fill='black')
    canvas.tag_bind(menu_btn, "<Button-1>", lambda k : menu_from_game_fn())
    canvas.tag_bind(menu_txt, "<Button-1>", lambda k : menu_from_game_fn())

    canvas.create_text(645, 60, text=app.ply_level+"-ply", fill='white')

    print("analysis mode", analysis)
    # analysis mode
    if analysis:
        message = 'Blunder!'
        found_best_move = False
        canvas.create_rectangle(marg[0], marg[1]+10, marg[0]+board_dims[0], marg[1]+board_dims[1]-10, fill='white', stipple="gray75")
        for i in range(len(analysis[0])):
            if (not found_best_move) and (isDecisionMatch(analysis[0][i], boardinfo)):
                canvas.create_rectangle(marg[0]+15, marg[1]+32 + 35*i, marg[0]+575, marg[1]+68 + 35*i, fill='mediumpurple1')
                if analysis[1][i] == 'green':
                    message = "Correct!"
                    app.incr_stats("correct")
                elif analysis[1][i] == 'blue':
                    message = "Mistake!"
                    app.incr_stats("mistake")
                    shutil.copy(boardinfo.file_path, os.path.join(root_dir, "test_decks", "mistakes"))
                else:
                    message = "Blunder!"
                    app.incr_stats("blunder")
                    shutil.copy(boardinfo.file_path, os.path.join(root_dir, "test_decks", "mistakes"))
                    shutil.copy(boardinfo.file_path, os.path.join(root_dir, "test_decks", "blunders"))
                found_best_move = True
            canvas.create_text(marg[0]+300, marg[1]+50 + 35 * i, text=analysis[0][i], font=("Courier", 20, "bold"), fill=analysis[1][i])
        canvas.create_text(marg[0]+300, marg[1]+100 + 35 * len(analysis[0]), text=message, font=("Arial", 36, "bold"), fill='black')
        if not found_best_move:
            app.incr_stats("blunder")
            shutil.copy(boardinfo.file_path, os.path.join(root_dir, "test_decks", "mistakes"))
            shutil.copy(boardinfo.file_path, os.path.join(root_dir, "test_decks", "blunders"))

        next_btn = canvas.create_rectangle(marg[0]+530, marg[1]+500, marg[0]+590, marg[1]+530, fill='white')
        next_txt = canvas.create_text(marg[0]+560, marg[1]+515, text="Next ->", font=mysmallfont)
        canvas.tag_bind(next_btn, "<Button-1>", lambda k : next_fn())
        canvas.tag_bind(next_txt, "<Button-1>", lambda k : next_fn())
    # game mode
    else:
        if boardinfo.isCube:
            if boardinfo.isDouble:
                take_btn = canvas.create_rectangle(marg[0]+375, marg[1]+265, marg[0]+435, marg[1]+295, fill='white')
                take_txt = canvas.create_text(marg[0]+405, marg[1]+280, text="Take", font=mysmallfont)
                canvas.tag_bind(take_btn, "<Button-1>", lambda k : take_fn(canvas, boardinfo, analysis))
                canvas.tag_bind(take_txt, "<Button-1>", lambda k : take_fn(canvas, boardinfo, analysis))
                
                pass_btn = canvas.create_rectangle(marg[0]+445, marg[1]+265, marg[0]+505, marg[1]+295, fill='white')
                pass_txt = canvas.create_text(marg[0]+475, marg[1]+280, text="Pass", font=mysmallfont)
                canvas.tag_bind(pass_btn, "<Button-1>", lambda k : pass_fn(canvas, boardinfo, analysis))
                canvas.tag_bind(pass_txt, "<Button-1>", lambda k : pass_fn(canvas, boardinfo, analysis))
            else:
                roll_btn = canvas.create_rectangle(marg[0]+375, marg[1]+265, marg[0]+435, marg[1]+295, fill='white')
                roll_txt = canvas.create_text(marg[0]+405, marg[1]+280, text="Roll", font=mysmallfont)
                canvas.tag_bind(roll_btn, "<Button-1>", lambda k : rollDice_fn(canvas, boardinfo, analysis))
                canvas.tag_bind(roll_txt, "<Button-1>", lambda k : rollDice_fn(canvas, boardinfo, analysis))

                double_btn = canvas.create_rectangle(marg[0]+445, marg[1]+265, marg[0]+505, marg[1]+295, fill='white')
                double_txt = canvas.create_text(marg[0]+475, marg[1]+280, text="Double", font=mysmallfont)
                canvas.tag_bind(double_btn, "<Button-1>", lambda k : double_fn(canvas, boardinfo, analysis))
                canvas.tag_bind(double_txt, "<Button-1>", lambda k : double_fn(canvas, boardinfo, analysis))
        else:
            create_dice(canvas, boardinfo)
            if (len(boardinfo.movelog) == 0):
                print(boardinfo.dice)
                canvas.num_moves, canvas.moves_length = getNumMoves(boardinfo.xgid, boardinfo.dice, boardinfo.white_home)
                print("canvas", canvas.num_moves, canvas.moves_length)
                if canvas.num_moves == 1 and canvas.moves_length != None:
                    print("num moves = 1")
                    new_dice = (canvas.moves_length, boardinfo.dice[1])
                    boardinfo.dice = new_dice

            else:
                if (len(boardinfo.movelog) > 0):
                    undo_btn = canvas.create_rectangle(marg[0]+95, marg[1]+265, marg[0]+155, marg[1]+295, fill='white')
                    undo_txt = canvas.create_text(marg[0]+125, marg[1]+280, text='Undo', font=mysmallfont)
                    canvas.tag_bind(undo_btn, "<Button-1>", lambda k : undo_fn(canvas, boardinfo))
                    canvas.tag_bind(undo_txt, "<Button-1>", lambda k : undo_fn(canvas, boardinfo))

                if (len(boardinfo.movelog) == canvas.num_moves):
                    done_btn = canvas.create_rectangle(marg[0]+165, marg[1]+265, marg[0]+225, marg[1]+295, fill='white')
                    done_txt = canvas.create_text(marg[0]+195, marg[1]+280, text='Done', font=mysmallfont)
                    canvas.tag_bind(done_btn, "<Button-1>", lambda k : done_fn(canvas, boardinfo))
                    canvas.tag_bind(done_txt, "<Button-1>", lambda k : done_fn(canvas, boardinfo))

    return (app.correct, app.mistakes, app.blunders)


''' Buttons '''

def rollDice_fn(canvas, boardinfo, analysis):
    print("roll dice")
    boardinfo.isRoll = True
    app.analysis = True
    app.show_canvas(boardinfo=boardinfo)

def take_fn(canvas, boardinfo, analysis):
    print("take pressed")
    boardinfo.isTake = True
    app.analysis = True
    app.show_canvas(boardinfo=boardinfo)

def pass_fn(canvas, boardinfo, analysis):
    print("pass pressed")
    boardinfo.isPass = True
    app.analysis = True
    app.show_canvas(boardinfo=boardinfo)

def double_fn(canvas, boardinfo, analysis):
    print("double pressed")
    boardinfo.isDouble = True
    configure_board(canvas, boardinfo, analysis)
    return

def move_white_help(boardinfo, old_pos, new_pos):
    if old_pos == 24:
        boardinfo.white_bar -= 1
        boardinfo.white_pip_count -= 25
    elif old_pos < 0:
        boardinfo.white_home -= 1
    else:
        boardinfo.board[old_pos] -= 1
        boardinfo.white_pip_count -= old_pos + 1

    if new_pos < 0:
        boardinfo.white_home += 1
    elif new_pos == 24:
        boardinfo.white_bar += 1
        boardinfo.white_pip_count += 25
    else:
        boardinfo.board[new_pos] += 1
        boardinfo.white_pip_count += new_pos + 1


def capture_black(boardinfo, pos):
    boardinfo.board[pos] += 1
    boardinfo.black_bar += 1
    boardinfo.black_pip_count += (pos + 1)

def uncapture_black(boardinfo, pos):
    boardinfo.board[pos] -= 1
    boardinfo.black_bar -= 1
    boardinfo.black_pip_count -= (pos + 1)

def find_max_checker(board, white_bar):
    if white_bar > 0:
        return 25

    for i in range(len(board)-1, -1, -1):
        if board[i] > 0:
            return i + 1
    return 0

def move_fn(canvas, boardinfo, pos):
    print("move!!!")
    # find furthest checker back
    max_checker = find_max_checker(boardinfo.board, boardinfo.white_bar)
    if boardinfo.dice[0] == boardinfo.dice[1]:
        # only move one checker
        new_pos = pos - boardinfo.dice[0]
    else:
        # can move with one or two dice
        new_pos = pos - boardinfo.dice[len(boardinfo.movelog)]
    print(new_pos, boardinfo.dice, max_checker)
    is_capture = False
    if new_pos >= 0 and boardinfo.board[new_pos] < -1: return # new pos is blocked
    if new_pos >= 0 and boardinfo.board[new_pos] == -1: # capture black piece
        capture_black(boardinfo, new_pos)
        is_capture = True
    if new_pos < 0 and max_checker > 6: return # new pos is outside the board and bear off stage not yet reached
    if new_pos < -1 and max_checker != pos+1: return # cannot bear off with wastage if a higher checker exists

    move_white_help(boardinfo, pos, new_pos) # move white piece

    boardinfo.movelog.append((pos+1, max(new_pos+1, 0), is_capture))

    print("LOG", boardinfo.movelog)
    configure_board(canvas, boardinfo)
    return

def undo_fn(canvas, boardinfo):
    old_pos, new_pos, is_capture = boardinfo.movelog.pop()
    move_white_help(boardinfo, new_pos-1, old_pos-1)
    if is_capture:
        uncapture_black(boardinfo, new_pos-1)

    configure_board(canvas, boardinfo)
    print("LOG", boardinfo.movelog)
    return

def done_fn(canvas, boardinfo):
    app.analysis = True
    app.show_canvas(boardinfo=boardinfo)
    return

def swap_fn(canvas, boardinfo):
    if len(boardinfo.movelog) > 0: return # can't swap dice mid move
    new_dice = (boardinfo.dice[1], boardinfo.dice[0])
    boardinfo.dice = new_dice
    tmp = boardinfo.dice1
    boardinfo.dice1 = boardinfo.dice2
    boardinfo.dice2 = tmp
    configure_board(canvas, boardinfo)

def next_fn():
    app.analysis = False
    app.switch_right(None)

def add_position_next_fn(canvas, xgid_var, step):
    if step != app.step:
        print("bad")
        return
    print(app.add_position_log, app.step)
    app.add_position_log.append(xgid_var.get() + '\n')
    #canvas.delete("add_position" + str(app.step) + "_next")
    app.step += 1
    app.make_add_position_canvas()

def add_position_next_listbox_fn(canvas, vars, step):
    if len(vars) == 0 or step != app.step:
        print("bad")
        return
    if vars[0] == "None":
        app.step = 4
        canvas.delete("add_position3_next")
        app.make_add_position_canvas()
        return
    tabs = ""
    if app.step == 3: tabs = "\t"
    for elem in vars:
        app.add_position_log.append(tabs + elem + '\n')
    #canvas.delete("add_position" + str(app.step) + "_next")
    app.step += 1
    app.make_add_position_canvas()

def add_position_undo_fn(canvas):
    if app.step > 1:
        canvas.delete("add_position" + str(app.step))
        print(app.schema.root, "root", app.step)
        app.schema = app.schema.parent
        print(app.schema.root, "root", app.step)
        app.add_position_log.pop()
        app.step -= 1
        #app.create_next_button_add_position(canvas)

def add_position_submit_fn(canvas):
    global q
    q.put(("add position", app.add_position_log, None))
    menu_fn(canvas)

def create_deck_fn():
    self.make_create_deck_canvas(1, False)

def create_deck_next_fn(canvas, vars, step):
    if len(vars) == 0 or (step != app.step):
        print("bad", app.step, vars, app.create_deck_log)
        print("SCHEMA", app.schema.root)
        return
    print(vars)
    if vars[0] == "ALL":
        #canvas.delete("create_deck" + str(app.step) + "_next")
        app.step += 1
        print("SCHEMA", app.schema.root)
        app.make_create_deck_canvas(False)
        return
    if app.step == 4:
        #canvas.delete("create_deck" + str(app.step) + "_next")
        app.deck_name = vars[0].get().replace(' ', '_')
        app.step += 1
        canvas.delete("create_deck4")
        print("SCHEMA", app.schema.root)
        app.make_create_deck_canvas(False)
        return
    if app.step == 3:
        if len(vars) > 0:
            app.create_deck_log.append(vars[0])
            canvas.delete("create_deck3")
            if vars[0] == '(': app.filter_paren += 1
            elif vars[0] == ')': app.filter_paren -= 1
            print("SCHEMA", app.schema.root)
            app.make_create_deck_canvas(False)
        return
    app.create_deck_log.append(vars[0] + '\n')
    #canvas.delete("create_deck" + str(app.step) + "_next")
    app.step += 1
    print("SCHEMA", app.schema.root)
    app.make_create_deck_canvas(False)

def create_deck_done_fn():
    app.step = 4
    app.make_create_deck_canvas(False)

def create_deck_undo_filter_fn(canvas):
    last_word = app.create_deck_log.pop()
    if last_word == '(': app.filter_paren -= 1
    elif last_word == ')': app.filter_paren += 1
    canvas.delete("create_deck3")
    app.make_create_deck_canvas(True)

def create_deck_undo_fn(canvas):
    if app.step > 1:
        canvas.delete("create_deck" + str(app.step))
        app.schema = app.schema.parent
        print(app.create_deck_log)
        app.step -= 1
        #app.create_next_button_create_deck(canvas)
        while len(app.create_deck_log) >= app.step: 
            app.create_deck_log.pop()

def create_deck_submit_fn(canvas):
    global q
    print("SUBMIT")
    q.put(("create deck", app.create_deck_log, app.deck_name))
    menu_fn(canvas)

def set_analysis_fn(analysis, canvas):
    if len(analysis) == 0: return

    app.ply_level = analysis[0][0]
    print("set to " + app.ply_level)

def play_deck_start_fn(name, isFromStart):
    global num_positions, root_dir
    print("name[0] = ", name[0])
    print("ANALYSIS", app.analysis)
    app.analysis = False
    filepath = os.path.join(root_dir, r"test_decks\\" + name[0])
    if isFromStart: app.deck_name = name[0]
    app.correct = app.mistakes = app.blunders = 0

    position_list = os.listdir(filepath)[:]
    print(position_list, "pos")
    num_positions = len(position_list)
    if "filter.txt" in position_list: num_positions -= 1
    random.shuffle(position_list)
    for filename in position_list:
        print("Filename", filename)
        filename = os.path.join(filepath, filename)
        if os.path.isfile(filename) and filename[-3:] != "txt":
            with open(filename, 'rb') as f:
                graph = pickle.load(f)
            xgid = graph.xgid
            q.put(("analysis", xgid, None))
            print("HELLLLLLLLLLLLLLLLLLLLO")
            app.create_canvas(xgid, filename)
    print("GELLLLLLLLLLLLLLLLLLLLO")
    app.current_index = 1
    print(app.xgid_map)
    app.show_canvas()

def menu_fn(canvas):
    canvas.delete("all")
    app.add_position_log = []
    app.create_deck_log = []
    app.step = 1
    while app.schema.level > 0:
        app.schema = app.schema.parent
    app.make_add_position_canvas()
    app.make_create_deck_canvas(False)
    app.switch_index(0)

def menu_from_game_fn():
    app.switch_index(0)

def exit_fn():
    global root

    root.destroy()

def restart_fn(mode):
    global root_dir

    temp_path = os.path.join(root_dir, r"test_decks\\temp")
    blunders_path = os.path.join(root_dir, r"test_decks\\blunders")
    mistakes_path = os.path.join(root_dir, r"test_decks\\mistakes")

    print("SYSSSSSSSSSSSSSSSSSSSSS", sys.argv, root_dir, temp_path, app.deck_name)
    if mode == "play again":
        play_deck_start_fn([app.deck_name], False)
        return
    elif mode == "all":
        play_deck_start_fn([app.deck_name], False)
        return
    elif mode == "mistakes":
        if os.path.exists(temp_path):
            print('removed')
            shutil.rmtree(temp_path)
        os.rename(mistakes_path, temp_path)
        os.mkdir(mistakes_path)
        shutil.rmtree(blunders_path)
        os.mkdir(blunders_path)
    else:
        if os.path.exists(temp_path):
            print("removed")
            shutil.rmtree(temp_path)
        os.rename(blunders_path, temp_path)
        os.mkdir(blunders_path)
        shutil.rmtree(mistakes_path)
        os.mkdir(mistakes_path)
    play_deck_start_fn(["temp"], False)

def copy_xgid_fn(xgid):
    pyperclip.copy(xgid)

def add_position_fn():
    app.step = 1
    app.make_add_position_canvas()
    app.show_canvas("add position")

def create_deck_fn():
    app.step = 1
    app.make_create_deck_canvas(False)
    app.show_canvas("create deck")

def play_deck_fn():
    app.make_play_deck_canvas()
    app.show_canvas("play deck")

def settings_fn():
    app.make_settings_canvas()
    app.show_canvas("settings")

# background process that runs analysis once a deck is created
def worker_fn(q):
    global root_dir
    while True:
        print("start thread")
        item = q.get()
        if item[0] == "analysis":
            print("Analysis time", app.ply_level)
            xgid_line = item[1]
            xgid_filename = app.ply_level + xgid.xgid_to_filename(xgid_line)
            if os.path.exists(r"cache\\" + xgid_filename):
                print("already exists")
                analysis_done.add((app.ply_level, xgid_line))
            else:
                lines = eval.get_stats(xgid_line, app.ply_level)
                print("RECEIVED LINES", lines)
                with open(os.path.join(root_dir, "cache", xgid_filename), 'wb') as f:
                    pickle.dump(lines, f)
                analysis_done.add((app.ply_level, xgid_line))
            q.task_done()
        elif item[0] == "create deck":
            os.mkdir(r"test_decks\\" + item[2])
            print("HERE" + r"test_decks\\" + item[2])
            with open(r"test_decks\\" + item[2] + r"\\filter.txt", "w") as f:
                f.writelines(item[1][:2])
                f.write(' '.join(item[1][2:]))
            subprocess.run(['python', 'filter.py', 'output', r"test_decks\\" + item[2] + r"\\filter.txt", r"test_decks\\" + item[2]])
        elif item[0] == "add position":
            identifier = len(os.listdir("positions"))
            position_name = f"position_{identifier}.txt"
            with open(r"positions\\" + position_name, "w") as f:
                f.writelines(item[1])
            # run mk_database
            subprocess.run(['python', 'convert_position.py', position_name, "output"])

            for deck in os.listdir("test_decks"):
                if deck not in ["temp", "mistakes", "blunders"]:
                    print("Deck", deck)
                    filter_file = r"test_decks\\" + deck + r"\\filter.txt"
                    pk_filename =r"output\\" + position_name[:-3] + "pk"
                    subprocess.run(['python', 'filter.py', '-s', pk_filename, filter_file, r"test_decks\\" + deck])

# runs the program
def program():
    global num_positions, worker, root_dir, q
    
    temp_path = os.path.join(root_dir, r"test_decks\\temp")
    blunders_path = os.path.join(root_dir, r"test_decks\\blunders")
    mistakes_path = os.path.join(root_dir, r"test_decks\\mistakes")
    if len(sys.argv) > 0:
        if os.path.exists(blunders_path):
            shutil.rmtree(blunders_path)
        os.mkdir(blunders_path)
        if os.path.exists(mistakes_path):
            shutil.rmtree(mistakes_path)
        os.mkdir(mistakes_path)
        if os.path.exists(temp_path):
            shutil.rmtree(temp_path)
        os.mkdir(temp_path)


        worker = Thread(target = worker_fn, args =(q,))
        worker.start()
        app.create_intro()
        app.current_index = 0
        app.show_canvas()
        root.mainloop()
        q.join()

    else:
        print("ERROR: need an argument");

def main():
    # Example: python flashcard.py
    program()

if __name__ == "__main__":
    main()
