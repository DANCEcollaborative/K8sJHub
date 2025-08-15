# jlab_chat_ext/serverextension.py
from .plugin import ChatExtension

def _jupyter_server_extension_points():
    return [{"module": "jlab_chat_ext"}]

def load_jupyter_server_extension(nb_server_app):
    ChatExtension().initialize(nb_server_app)
