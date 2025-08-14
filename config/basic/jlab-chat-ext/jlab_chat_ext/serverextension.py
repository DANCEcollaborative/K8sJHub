# jlab_chat_ext/serverextension.py
def _jupyter_server_extension_paths():
    return [{"module": "jlab_chat_ext"}]

def load_jupyter_server_extension(nbapp):
    print("Jupyter server extension jlab_chat_ext loaded")
