# jlab_chat_ext/__init__.py
from .handlers import setup_handlers

def _jupyter_server_extension_points():
    return [{
        "module": "jlab_chat_ext",
        "app": "jupyter_server"
    }]

def _jupyter_server_extension(server_app):
    """Called by Jupyter server to load extension."""
    setup_handlers(server_app.web_app)
    server_app.log.info("✅ jlab_chat_ext server extension loaded")
