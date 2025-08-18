# jlab_chat_ext/plugin.py
from jupyter_server.extension.application import ExtensionApp
from jupyter_server.utils import url_path_join
from jupyter_server.base.handlers import APIHandler
from tornado.web import authenticated
import json

DEFAULT_CHAT_WS_URL = "https://bree.lti.cs.cmu.edu/bazaar/login?roomName=regex&roomId=505&id=1&username=Robbie&html=chat_mm"

class ChatSettingsHandler(APIHandler):
    @authenticated
    def get(self):
        """Return chat URL from settings registry, or fallback."""
        try:
            settings = self.settings.get("jlab_chat_ext_settings", {})
            chat_url = settings.get("chatUrl", DEFAULT_CHAT_WS_URL)
            self.finish(json.dumps({"chatUrl": chat_url}))
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({"error": str(e)}))


class ChatExtension(ExtensionApp):
    name = "jlab_chat_ext"

    def initialize_handlers(self):
        self.log.info("Initializing ChatExtension handlers...")
        handlers = [
            (url_path_join(self.web_app.settings["base_url"], "/chat-ext/wsurl"),
             ChatSettingsHandler)
        ]
        self.handlers.extend(handlers)


# Optional: If running standalone
if __name__ == "__main__":
    ChatExtension.launch_instance()
