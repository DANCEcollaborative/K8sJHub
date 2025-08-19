from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado.web
import os
import json

class ChatWSUrlHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        # Use environment variable or fallback default
        chat_url = os.environ.get(
            "CHAT_WS_URL",
            "https://bree.lti.cs.cmu.edu/bazaar/login?roomName=regex&roomId=505&id=1&username=Robbie&html=chat_mm"
        )
        self.finish(json.dumps({"ws_url": chat_url}))

def setup_handlers(server_app):
    host_pattern = ".*$"
    route_pattern = url_path_join(server_app.web_app.settings['base_url'], "chat-ext/wsurl")
    server_app.web_app.add_handlers(host_pattern, [(route_pattern, ChatWSUrlHandler)])
