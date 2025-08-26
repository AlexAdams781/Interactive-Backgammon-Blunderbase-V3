# This program makes a database of backgammon positions from a directory of
# position files. This is done by converting backgammon position with tags into
# a graph, serializing the graph in binary, and writing it to a new file in the
# output directory

import os
import sys
import pickle
import convert_to_graph

def main():
    # Example command: "python mk_database.py file output
    if len(sys.argv) > 2:
        filename = sys.argv[1]
        out_directory = sys.argv[2]
        if os.path.isfile(r"positions\\" + filename):
            pk_filename = out_directory + r"\\" + filename[:-3] + "pk"
            with open(pk_filename, 'wb') as pk_f:
                pickle.dump(convert_to_graph.get(r"positions\\" + filename, "position"), pk_f)
    else:
        print("ERROR: need 2 arguments");

if __name__ == "__main__":
    main()
