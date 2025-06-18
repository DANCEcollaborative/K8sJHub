import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ILayoutRestorer } from '@jupyterlab/application';
import { MainAreaWidget, showDialog, Dialog } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';

import io from 'socket.io-client';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'external-chat-extension',
  autoStart: true,
  requires: [ILayoutRestorer],
  activate: (app: JupyterFrontEnd, restorer: ILayoutRestorer) => {
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

    chatWidget.id = 'external-chat-widget';
    chatWidget.title.label = 'Chat';
    chatWidget.title.closable = true;

    const widget = new MainAreaWidget({ content: chatWidget });
    app.shell.add(widget, 'main');
    restorer.add(widget, widget.id);
  }
};

export default plugin;
