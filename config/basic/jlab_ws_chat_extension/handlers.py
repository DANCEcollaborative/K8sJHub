from jupyter_server.base.handlers import APIHandler
from tornado.web import RequestHandler
from jupyter_server.utils import url_path_join

class HealthHandler(APIHandler):
    def get(self):
        self.finish({"status": "ok", "extension": "jlab-ws-chat-extension"})

def setup_handlers(server_app):
    web_app = server_app.web_app
    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "jlab-ws-chat-extension", "health")
    web_app.add_handlers(".*$", [(route_pattern, HealthHandler)])
