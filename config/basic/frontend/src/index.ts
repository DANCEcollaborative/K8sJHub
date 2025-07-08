import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker,
  showDialog,
  Dialog
} from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { Widget } from '@lumino/widgets';
import { ReactWidget } from '@jupyterlab/apputils';

import io from 'socket.io-client';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jlab-ws-chat-extension:plugin',
  autoStart: true,
//   optional: [ILauncher],
//   requires: [ICommandPalette, ILayoutRestorer],
//   requires: [ILayoutRestorer],
//   optional: [ICommandPalette, ILauncher],
  requires: [ICommandPalette],
  optional: [ILauncher, ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer | null,
    palette: ICommandPalette | null,
    launcher: ILauncher | null
  ) => {
    console.log('✅ jlab-ws-chat-extension is activated');

    const { commands, shell } = app;

    // Create the base widget
    const content = new Widget();
    content.node.innerHTML = `
      <div style="padding: 1em;">
        <h3>Chat Widget</h3>
        <input id="roomInput" placeholder="Room name" />
        <button id="joinBtn">Join</button>
        <div id="chatLog" style="margin-top: 1em; height: 200px; overflow-y: scroll; border: 1px solid gray;"></div>
        <input id="chatInput" placeholder="Type message..." />
        <button id="sendBtn">Send</button>
      </div>
    `;

    const wsURL = (window as any).CHAT_WS_URL || process.env.CHAT_WS_URL || 'http://localhost:3001';
    const socket = io(wsURL);

    const log = content.node.querySelector('#chatLog')!;
    let currentRoom = '';

    socket.on('connect', () => {
      log.innerHTML += `<div><em>Connected to ${wsURL}</em></div>`;
    });

    socket.on('chat message', (msg: string) => {
      log.innerHTML += `<div>${msg}</div>`;
      log.scrollTop = log.scrollHeight;
    });

    content.node.querySelector('#joinBtn')?.addEventListener('click', () => {
      const room = (content.node.querySelector('#roomInput') as HTMLInputElement).value;
      if (room) {
        if (currentRoom) {
          socket.emit('leave', currentRoom);
        }
        socket.emit('join', room);
        currentRoom = room;
        log.innerHTML += `<div><em>Joined room: ${room}</em></div>`;
      }
    });

    content.node.querySelector('#sendBtn')?.addEventListener('click', () => {
      const input = content.node.querySelector('#chatInput') as HTMLInputElement;
      const msg = input.value;
      if (msg && currentRoom) {
        socket.emit('chat message', { room: currentRoom, message: msg });
        input.value = '';
      }
    });

    const widget = new MainAreaWidget({ content });
    widget.id = 'jlab-ws-chat-widget';
    widget.title.label = 'Chat';
    widget.title.closable = true;

    // Register the widget for layout restoration
//     restorer.add(widget, widget.id);
    if (restorer) {
	  restorer.add(widget, widget.id);
	}


    // Command ID
    const commandID = 'jlab-ws-chat:open';

    // Register command
    commands.addCommand(commandID, {
      label: 'Open Chat Widget',
      caption: 'Open the collaborative chat widget',
      execute: () => {
        if (!widget.isAttached) {
          shell.add(widget, 'main');
        }
        shell.activateById(widget.id);
      }
    });

    // Add to command palette
//     palette.addItem({ command: commandID, category: 'Chat' });
    if (palette) {
	  palette.addItem({ command: commandID, category: 'Chat' });
	}

    // Add to launcher if available
    if (launcher) {
      launcher.add({
        command: commandID,
        category: 'Other',
        rank: 1
      });
    }

    // Optionally add to left sidebar
    const sidebarWidget = new MainAreaWidget({ content });
    sidebarWidget.id = 'jlab-ws-chat-sidebar';
    sidebarWidget.title.iconClass = 'jp-ChatIcon jp-SideBar-tabIcon';
    sidebarWidget.title.caption = 'Chat';
    shell.add(sidebarWidget, 'left', { rank: 800 });
  }
};

export default plugin;
