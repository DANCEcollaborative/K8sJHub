from ._version import __version__
from .handlers import ChatWsUrlHandler

def _jupyter_server_extension_points():
    return [{"module": "jlab_chat_ext"}]

# def _load_jupyter_server_extension(server_app):
#     from .handlers import setup_handlers
#     setup_handlers(server_app.web_app)
#     server_app.log.info("Loaded jlab_chat_ext server extension")
    
def _load_jupyter_server_extension(server_app):
    web_app = server_app.web_app
    base_url = web_app.settings["base_url"]
    route_pattern = f"{base_url}chat-ext/wsurl"
    web_app.add_handlers(".*", [(route_pattern, ChatWsUrlHandler)])
