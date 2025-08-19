# jupyter_server_config.py
import os
c = get_config()

# Inject WS URL into page_config_data for frontend JS
chat_url = os.environ.get('CHAT_WS_URL', 'https://bree.lti.cs.cmu.edu/bazaar/login?roomName=regex&roomId=505&id=1&username=Robbie&html=chat_mm')
c.ServerApp.page_config_data['chatServerUrl'] = chat_url

print(f"✅ Injected CHAT_SERVER_URL into page config: {chat_url}")
