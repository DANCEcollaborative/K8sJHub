import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette,
  MainAreaWidget
} from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';
import { Widget } from '@lumino/widgets';
import io from 'socket.io-client';

import { LabIcon } from '@jupyterlab/ui-components';
import mySvg from './lock.svg';

export const chatIcon = new LabIcon({
  name: 'jlab-ws-chat:chat',
  svgstr: mySvg
});

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jlab-ws-chat-extension:plugin',
  autoStart: true,
  requires: [ICommandPalette],
  optional: [ILauncher, ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    launcher: ILauncher | null,
    restorer: ILayoutRestorer | null
  ) => {
    console.log('✅ jlab-ws-chat-extension is loaded.');

    const { commands, shell } = app;
    const wsURL = (window as any).CHAT_WS_URL || '';
    const socket = io(wsURL);

    // -------------------------------
    // Main Area Chat Widget
    // -------------------------------
    const mainContent = new Widget();
    mainContent.node.innerHTML = `
      <div style="padding: 1em;">
        <h3>Main Chat Widget</h3>
        <input id="mainRoomInput" placeholder="Room name" />
        <button id="mainJoinBtn">Join</button>
        <div id="mainChatLog" style="margin-top: 1em; height: 200px; overflow-y: scroll; border: 1px solid gray;"></div>
        <input id="mainChatInput" placeholder="Type message..." />
        <button id="mainSendBtn">Send</button>
      </div>
    `;

    let mainRoom = '';
    const mainLog = mainContent.node.querySelector('#mainChatLog')!;
    mainContent.node.querySelector('#mainJoinBtn')?.addEventListener('click', () => {
      const room = (mainContent.node.querySelector('#mainRoomInput') as HTMLInputElement).value;
      if (room) {
        if (mainRoom) socket.emit('leave', mainRoom);
        socket.emit('join', room);
        mainRoom = room;
        mainLog.innerHTML += `<div><em>Joined room: ${room}</em></div>`;
      }
    });

    mainContent.node.querySelector('#mainSendBtn')?.addEventListener('click', () => {
      const input = mainContent.node.querySelector('#mainChatInput') as HTMLInputElement;
      const msg = input.value;
      if (msg && mainRoom) {
        socket.emit('chat message', { room: mainRoom, message: msg });
        input.value = '';
      }
    });

    // -------------------------------
    // Sidebar Chat Widget
    // -------------------------------
    const sidebarContent = new Widget();
    sidebarContent.node.innerHTML = `
      <div style="padding: 0.5em;">
        <h4>Sidebar Chat</h4>
        <div id="sidebarChatLog" style="height: 150px; overflow-y: scroll; border: 1px solid #ccc;"></div>
      </div>
    `;
    const sidebarLog = sidebarContent.node.querySelector('#sidebarChatLog')!;

    socket.on('connect', () => {
      mainLog.innerHTML += `<div><em>Connected to ${wsURL}</em></div>`;
      sidebarLog.innerHTML += `<div><em>Connected</em></div>`;
    });

    socket.on('chat message', (msg: string) => {
      mainLog.innerHTML += `<div>${msg}</div>`;
      mainLog.scrollTop = mainLog.scrollHeight;

      sidebarLog.innerHTML += `<div>${msg}</div>`;
      sidebarLog.scrollTop = sidebarLog.scrollHeight;
    });

    const mainWidget = new MainAreaWidget({ content: mainContent });
    mainWidget.id = 'jlab-ws-chat-main';
    mainWidget.title.label = 'Chat';
    mainWidget.title.icon = chatIcon;
    mainWidget.title.closable = true;

    sidebarContent.id = 'jlab-ws-chat-sidebar';
    sidebarContent.title.caption = 'Chat Sidebar';
    (sidebarContent.title as any).iconClass = 'jp-ChatIcon jp-SideBar-tabIcon';

    shell.add(sidebarContent, 'left', { rank: 800 });

    const commandID = 'jlab-ws-chat:open-main';

    commands.addCommand(commandID, {
      label: 'Open Chat Widget',
      caption: 'Open the collaborative chat widget in the main area',
      execute: () => {
        if (!mainWidget.isAttached) {
          shell.add(mainWidget, 'main');
        }
        shell.activateById(mainWidget.id);
      }
    });

    palette.addItem({ command: commandID, category: 'Chat' });

    if (launcher) {
      launcher.add({ command: commandID, category: 'Other', rank: 1 });
    }

    if (restorer) {
      restorer.add(mainWidget as any, mainWidget.id);
    }
  }
};

export default [plugin];
