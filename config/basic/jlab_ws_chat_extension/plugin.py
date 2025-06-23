from jupyterlab.labapp import LabApp
from jupyterlab.extensions import LabExtensionApp
from jupyterlab_server import LabServerApp
from jupyterlab_automation import labextension_plugin

from jupyterlab.widgets import Widget

from traitlets import Unicode

# Create a basic React-compatible container in the sidebar
class ChatSidebar(Widget):
    id = "chat-sidebar"
    title = "Chat"
    icon_class = "jp-ChatIcon"
    node = None  # can be replaced with a custom HTML/React element

    def __init__(self):
        super().__init__()
        self.node = self._create_node()

    def _create_node(self):
        from ipywidgets import HTML
        return HTML("<iframe src='https://bazaar.lti.cs.cmu.edu/bazaar/login?roomName=regex&roomId=505&id=1&username=Robbie&html=chat_mm' width='100%' height='100%' frameborder='0'></iframe>'")._repr_html_()

# Plugin definition
plugin = {
    "id": "jlab-ws-chat",
    "autoStart": True,
    "requires": ["@jupyterlab/apputils: ICommandPalette", "@jupyterlab/application:ILayoutRestorer"],
    "activate": lambda app, palette, restorer: activate_plugin(app, palette, restorer)
}

def activate_plugin(app, palette, restorer):
    sidebar = ChatSidebar()

    # Add to left area
    app.shell.add(sidebar, "left", rank=500)

    # Add to command palette
    command_id = "jlab-ws-chat:open"
    app.commands.add_command(command_id, {
        "label": "Open Chat Sidebar",
        "execute": lambda: app.shell.activateById(sidebar.id)
    })
    palette.add_item({"command": command_id, "category": "Chat"})

    print("✅ Chat extension activated.")

