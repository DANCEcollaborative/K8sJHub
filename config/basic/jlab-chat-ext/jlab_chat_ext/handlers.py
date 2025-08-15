# jlab_chat_ext/handlers.py
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado

class ChatUrlHandler(APIHandler):
    def get(self):
        settings = self.settings.get("jlab_chat_ext_settings", {})
        chat_url = settings.get("chatURL", "https://bree.lti.cs.cmu.edu/bazaar/login?roomName=regex&roomId=505&id=1&username=Robbie&html=chat_mm")
        self.finish({"chatUrl": chat_url})

def setup_handlers(web_app):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "chat-ext/wsurl")
    web_app.add_handlers(host_pattern, [(route_pattern, ChatUrlHandler)])
