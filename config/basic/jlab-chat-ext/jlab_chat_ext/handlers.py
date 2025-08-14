# jlab_chat_ext/handlers.py
import json
import os
import tornado.web
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

class ChatUrlHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        chat_url = os.environ.get("CHAT_WS_URL", "")
        self.finish(json.dumps({"ws_url": chat_url}))

def setup_handlers(web_app):
    host_pattern = ".*$"
    route_pattern = url_path_join(web_app.settings["base_url"], "chat-ext", "wsurl")
    web_app.add_handlers(host_pattern, [(route_pattern, ChatUrlHandler)])
