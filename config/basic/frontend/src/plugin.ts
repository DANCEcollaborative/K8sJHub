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

    socket.on('connect', () => {
      console.log('Connected to chat server at', CHAT_WS_URL);
    });

    socket.on('message', (msg: string) => {
      console.log('Chat message:', msg);
    });

    const content = new Widget();
    content.node.className = 'jp-ChatWidget';
    content.node.textContent = 'Chat extension loaded. See console for messages.';

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

	console.log('****** Registering command ******');
    palette.addItem({ command: commandID, category: 'Chat' });
    console.log('****** Adding launcher item ******');
    launcher.add({ command: commandID, category: 'Chat' });
  }
};

export default plugin;
