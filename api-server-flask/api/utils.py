import os
import string
import tempfile

from random import SystemRandom
choice = lambda seq: SystemRandom().choice(seq)
letter_set = set(string.ascii_letters)

STORAGE_DIR = os.environ.get("MODEL_DIR", tempfile.gettempdir()) 

def generate_id():
    return "".join(choice(string.ascii_letters) for i in range(32))


def storage_dir_for_id(id):
    id = id.split("_")[0]
    return os.path.join(STORAGE_DIR, id[0:1], id[0:2], id[0:3], id)


def storage_file_for_id(id, ext):
    return os.path.join(storage_dir_for_id(id), id + "." + ext)


def validate_id(id):
    id_num = id.split("_")
    
    if len(id_num) == 1:
        id = id_num[0]
    elif len(id_num) == 2:
        id, num = id_num
        num = str(int(num))
    else:
        return False

    return len(set(id) - set(string.ascii_letters)) == 0

