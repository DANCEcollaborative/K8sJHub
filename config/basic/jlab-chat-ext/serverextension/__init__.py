from .handlers import setup_handlers

def _jupyter_server_extension_points():
    return [{
        "module": "serverextension"
    }]

def load_jupyter_server_extension(server_app):
    setup_handlers(server_app.web_app)
    server_app.log.info("✅ jlab-chat-ext: ChatWSUrlHandler loaded")
