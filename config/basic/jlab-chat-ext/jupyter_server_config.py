# jupyter_server_config.py
import os

# c is the config object Jupyter provides
c = get_config()

# Get the environment variable. Provide a default value as a fallback.
chat_url = os.environ.get('CHAT_WS_URL', 'http://localhost:3001')

# Add the value to the page_config_data dictionary
c.ServerApp.page_config_data['chatServerUrl'] = chat_url

# Enable the server extension
c.ServerApp.jpserver_extensions = {
    "jlab_chat_ext": True
}

print(f"✅ Injected CHAT_SERVER_URL into page config: {chat_url}")
