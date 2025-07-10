from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler

class HealthHandler(IPythonHandler):
    def get(self):
        self.finish("Chat extension backend is alive.")

def setup_handlers(server_app):
    web_app = server_app.web_app
    base_url = server_app.web_app.settings["base_url"]
    route = url_path_join(base_url, "/jlab-ws-chat-extension/health")
    web_app.add_handlers(host_pattern, [(route, HealthHandler)])
