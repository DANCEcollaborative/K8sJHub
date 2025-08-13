# jupyter_server_config.py
import os

# c is the config object Jupyter provides
c = get_config()

# Get the environment variable. Provide a default value as a fallback.
chat_url = os.environ.get('CHAT_WS_URL', 'http://localhost:3001')

# Add the value to the page_config_data dictionary.
# The key 'chatServerUrl' is what you'll use in your TypeScript file.
c.ServerApp.page_config_data['chatServerUrl'] = chat_url

c.ServerApp.root_dir = "/home/jovyan"

print(f"✅ Injected CHAT_SERVER_URL into page config: {chat_url}")