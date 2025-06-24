import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ILayoutRestorer } from '@jupyterlab/application';
import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';
import { Widget } from '@lumino/widgets';

import io from 'socket.io-client';

/**
 * The command ID for the chat panel.
 */
const OPEN_CHAT_COMMAND = 'jlab-ws-chat-extension:open-chat';

/**
 * Create the chat widget content.
 */
function createChatContent(): Widget {
  const wsURL = (window as any).CHAT_WS_URL || process.env.CHAT_WS_URL;
  const socket = io(wsURL);

  const chatWidget = new Widget();
  chatWidget.node.innerHTML = `
    <div style="padding: 1em;">
      <h3>Chat Widget</h3>
      <input id="roomInput" placeholder="Room name" />
      <button id="joinBtn">Join</button>
      <div id="chatLog" style="margin-top: 1em; height: 200px; overflow-y: scroll; border: 1px solid gray;"></div>
      <input id="chatInput" placeholder="Type message..." />
      <button id="sendBtn">Send</button>
    </div>
  `;

  const log = chatWidget.node.querySelector('#chatLog')!;
  let currentRoom = '';

  socket.on('connect', () => {
    log.innerHTML += `<div><em>Connected to ${wsURL}</em></div>`;
  });

  socket.on('chat message', (msg: string) => {
    log.innerHTML += `<div>${msg}</div>`;
    log.scrollTop = log.scrollHeight;
  });

  chatWidget.node.querySelector('#joinBtn')?.addEventListener('click', () => {
    const room = (chatWidget.node.querySelector('#roomInput') as HTMLInputElement).value;
    if (room) {
      if (currentRoom) {
        socket.emit('leave', currentRoom);
      }
      socket.emit('join', room);
      currentRoom = room;
      log.innerHTML += `<div><em>Joined room: ${room}</em></div>`;
    }
  });

  chatWidget.node.querySelector('#sendBtn')?.addEventListener('click', () => {
    const input = chatWidget.node.querySelector('#chatInput') as HTMLInputElement;
    const msg = input.value;
    if (msg && currentRoom) {
      socket.emit('chat message', { room: currentRoom, message: msg });
      input.value = '';
    }
  });

  return chatWidget;
}

/**
 * Initialization data for the extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jlab-ws-chat-extension:plugin',
  autoStart: true,
  requires: [ILayoutRestorer, ILauncher, ICommandPalette],
  activate: (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer,
    launcher: ILauncher,
    palette: ICommandPalette
  ) => {
    console.log('>>> jlab-ws-chat-extension activated');

    // Create the sidebar widget
    const content = createChatContent();
    content.addClass('jp-ChatSidebar');

    const sidebar = new Widget({ node: content.node });
    sidebar.id = 'jlab-ws-chat-sidebar';
    sidebar.title.iconClass = 'jp-ChatIcon';
    sidebar.title.caption = 'WebSocket Chat';

    // Register command
    app.commands.addCommand(OPEN_CHAT_COMMAND, {
      label: 'Open Chat Panel',
      caption: 'Open the WebSocket chat panel',
      execute: () => {
        app.shell.activateById(sidebar.id);
      }
    });

    // Add to left sidebar
    app.shell.add(sidebar, 'left', { rank: 500 });
    restorer.add(sidebar, sidebar.id);

    // Add to Launcher
    launcher.add({
      command: OPEN_CHAT_COMMAND,
      category: 'Other',
      rank: 1
    });

    // Add to Command Palette
    palette.addItem({ command: OPEN_CHAT_COMMAND, category: 'Chat' });
  }
};

export default plugin;
