# jupyter_server_config.py
import os
c = get_config()

# Inject WS URL into page_config_data for frontend JS
chat_url = os.environ.get('CHAT_WS_URL', 'http://localhost:3001')
c.ServerApp.page_config_data['chatServerUrl'] = chat_url

print(f"✅ Injected CHAT_SERVER_URL into page config: {chat_url}")
