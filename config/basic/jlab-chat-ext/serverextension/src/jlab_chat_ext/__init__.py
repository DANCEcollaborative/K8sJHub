# serverextension/src/jlab_chat_ext/__init__.py
from .handlers import setup_handlers

__version__ = "0.1.0"

def load_jupyter_server_extension(server_app):
    """Called by Jupyter Server to load the extension."""
    setup_handlers(server_app.web_app)
    server_app.log.info("✅ jlab-chat-ext server extension loaded.")


