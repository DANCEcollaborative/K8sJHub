// MessageHandler.ts
export class MessageHandler {
  private ws!: WebSocket;
  private url: string;
  private listeners: Array<(msg: string) => void> = [];
  private reconnectTimeout = 3000;

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onmessage = (event: MessageEvent) => {
      const msg = event.data as string;
      this.listeners.forEach((cb) => cb(msg));
    };

    this.ws.onclose = () => {
      console.warn('WebSocket closed, reconnecting...');
      setTimeout(() => this.connect(), this.reconnectTimeout);
    };
  }

  updateURL(newURL: string) {
    if (this.url !== newURL) {
      this.url = newURL;
      this.ws.close();
    }
  }

  onMessage(callback: (msg: string) => void) {
    this.listeners.push(callback);
  }

  sendMessage(room: string, message: string) {
    const payload = JSON.stringify({ room, message });
    this.ws.send(payload);
  }

  join(room: string) {
    this.sendMessage(room, '__join__');
  }

  leave(room: string) {
    this.sendMessage(room, '__leave__');
  }
}
