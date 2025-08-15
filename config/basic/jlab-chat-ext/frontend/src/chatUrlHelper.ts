import { ISettingRegistry } from '@jupyterlab/settingregistry';
import io, { Socket } from 'socket.io-client';

/**
 * Unified MessageHandler for main + sidebar chat widgets.
 */
export class MessageHandler {
  private socket: Socket | null = null;
  private wsURL: string = '';
  private reconnectInterval: number = 5000; // milliseconds
  private settings: ISettingRegistry;

  private mainCallbacks: ((msg: string) => void)[] = [];
  private sidebarCallbacks: ((msg: string) => void)[] = [];

  constructor(settingRegistry: ISettingRegistry) {
    this.settings = settingRegistry;
  }

  /** Load URL from SettingsRegistry or server fallback */
  async loadChatUrl(): Promise<string> {
    // 1. Try settings registry
    try {
      const settings = await this.settings.load('@my-org/jlab-chat-ext:plugin');
      const url = settings.get('chatUrl').composite as string;
      if (url) {
        this.wsURL = url;
        // Listen for changes
        settings.changed.connect(() => {
          const newUrl = settings.get('chatUrl').composite as string;
          if (newUrl && newUrl !== this.wsURL) {
            console.log('🔄 Chat URL updated via SettingsRegistry:', newUrl);
            this.wsURL = newUrl;
            this.connect(); // reconnect to new URL
          }
        });
        return this.wsURL;
      }
    } catch (err) {
      console.warn('SettingsRegistry load failed, falling back to server route', err);
    }

    // 2. Fallback to server route
    try {
      const resp = await fetch('/chat-ext/wsurl');
      if (resp.ok) {
        const data = await resp.json();
        this.wsURL = data.chatUrl;
        return this.wsURL;
      }
    } catch (err) {
      console.error('Failed to fetch /chat-ext/wsurl', err);
    }

    // 3. Last resort
    this.wsURL = 'ws://localhost:3000';
    return this.wsURL;
  }

  /** Register callbacks for messages */
  onMainMessage(cb: (msg: string) => void) {
    this.mainCallbacks.push(cb);
  }

  onSidebarMessage(cb: (msg: string) => void) {
    this.sidebarCallbacks.push(cb);
  }

  /** Connect or reconnect socket */
  async connect() {
    if (!this.wsURL) await this.loadChatUrl();
    if (this.socket) {
      this.socket.disconnect();
      this.socket.removeAllListeners();
    }

    this.socket = io(this.wsURL, { reconnectionAttempts: 5, timeout: 10000 });

    this.socket.on('connect', () => {
      console.log(`✅ Connected to chat server at ${this.wsURL}`);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn(`⚠️ Disconnected from chat server: ${reason}`);
      setTimeout(() => this.connect(), this.reconnectInterval);
    });

    this.socket.on('chat message', (data: { room: string; message: string }) => {
      this.mainCallbacks.forEach(cb => cb(data.message));
      this.sidebarCallbacks.forEach(cb => cb(data.message));
    });
  }

  /** Emit a chat message */
  sendMessage(room: string, message: string) {
    if (!this.socket) return;
    this.socket.emit('chat message', { room, message });
  }

  /** Join a room */
  joinRoom(room: string) {
    if (!this.socket) return;
    this.socket.emit('join', room);
  }

  /** Leave a room */
  leaveRoom(room: string) {
    if (!this.socket) return;
    this.socket.emit('leave', room);
  }
}
