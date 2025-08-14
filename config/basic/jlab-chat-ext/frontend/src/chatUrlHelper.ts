export async function getChatUrl(): Promise<string> {
  const response = await fetch('/chat-ext/wsurl');
  if (!response.ok) {
    throw new Error(`Failed to fetch chat URL: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.chatUrl;
}
