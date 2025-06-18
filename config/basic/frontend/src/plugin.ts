import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { Widget } from '@lumino/widgets';
import { socket as createSocket } from 'socket.io-client';

/**
 * Initialization data for the jlab-ws-chat-extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jlab-ws-chat-extension:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jlab-ws-chat-extension is activated!');

    // Connect to external WebSocket server
    const CHAT_WS_URL = (window as any).CHAT_WS_URL || 'http://localhost:3001';
    const socket = createSocket(CHAT_WS_URL);

    socket.on('connect', () => {
      console.log('Connected to chat server at', CHAT_WS_URL);
    });

    socket.on('message', (msg: string) => {
      console.log('Chat message:', msg);
    });

    const content = new Widget();
    content.node.textContent = 'Chat extension loaded. See console for messages.';

    const widget = new Widget();
    widget.id = 'external-chat-panel';
    widget.title.label = 'Chat';
    widget.title.closable = true;
    widget.node.appendChild(content.node);

    app.shell.add(widget, 'right');
  }
};

export default plugin;
