from .handlers import setup_handlers

def _jupyter_server_extension_paths():
    return [{"module": "jlab_ws_chat_extension"}]

def _load_jupyter_server_extension(server_app):
    setup_handlers(server_app)
    server_app.log.info("[jlab_ws_chat_extension] Extension loaded.")

def __jupyter_labextension_paths__():
    return [{"name": "jlab-ws-chat-extension", "src": "labextension"}]
```
