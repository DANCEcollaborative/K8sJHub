from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import os
import tornado

class ChatWSUrlHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        chat_url = os.environ.get("CHAT_WS_URL", "")
        self.finish({"chatUrl": chat_url})

def setup_handlers(web_app):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "chat-ext", "wsurl")
    handlers = [(route_pattern, ChatWSUrlHandler)]
    web_app.add_handlers(host_pattern, handlers)
