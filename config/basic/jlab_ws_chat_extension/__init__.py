from .handlers import setup_handlers

def _load_jupyter_server_extension(server_app):
    server_app.log.info("[jlab_ws_chat_extension] Server extension loaded.")
    setup_handlers(server_app)

def __jupyter_labextension_paths__():
    return [{
        "name": "jlab-ws-chat-extension",
        "src": "labextension"
    }]