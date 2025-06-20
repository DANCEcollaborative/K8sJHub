import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { Widget } from '@lumino/widgets';
import io from 'socket.io-client';

import '../style/index.css';

/**
 * Initialization data for the jlab-ws-chat-extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jlab-ws-chat-extension:plugin',
  autoStart: true,
  requires: [ICommandPalette, ILauncher],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette, launcher: ILauncher) => {
    console.log('JupyterLab extension jlab-ws-chat-extension is activated!');

    const CHAT_WS_URL = (window as any).CHAT_WS_URL || 'http://localhost:3001';
    const socket = io(CHAT_WS_URL);

    const chatNode = document.createElement('div');
    chatNode.className = 'jp-ChatWidget';

    const messages = document.createElement('div');
    messages.className = 'jp-ChatMessages';
    chatNode.appendChild(messages);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type a message...';
    input.className = 'jp-ChatInput';
    chatNode.appendChild(input);

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && input.value.trim()) {
        socket.emit('message', input.value);
        input.value = '';
      }
    });

    socket.on('connect', () => {
      console.log('Connected to chat server at', CHAT_WS_URL);
    });

    socket.on('message', (msg: string) => {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'jp-ChatMessage';
      msgDiv.textContent = msg;
      messages.appendChild(msgDiv);
      messages.scrollTop = messages.scrollHeight;
    });

    const content = new Widget({ node: chatNode });
    const widget = new MainAreaWidget({ content });
    widget.id = 'external-chat-panel';
    widget.title.label = 'Chat';
    widget.title.closable = true;

    const commandID = 'external-chat:open';
    app.commands.addCommand(commandID, {
      label: 'Open Chat Panel',
      execute: () => {
        if (!widget.isAttached) {
          app.shell.add(widget, 'main');
        }
        app.shell.activateById(widget.id);
      }
    });

    palette.addItem({ command: commandID, category: 'Chat' });
    launcher.add({ command: commandID, category: 'Chat' });
  }
};

export default plugin;
