import os
import shutil

def ignore_folder(folder_name):
    def _ignore(path, names):
        return [folder_name] if folder_name in names else []
    return _ignore

shutil.make_archive('mentor_mind', 'zip', '.', ignore=ignore_folder('.venv'))
