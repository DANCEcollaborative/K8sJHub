// src/index.ts
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  ILayoutRestorer
} from '@jupyterlab/application';
import {
  Widget
} from '@lumino/widgets';
import {
  ICommandPalette
} from '@jupyterlab/apputils';
import { io, Socket } from 'socket.io-client';

/**
 * Initialization data for the custom socket.io chat extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'custom-socketio-chat',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette, restorer: ILayoutRestorer) => {
    console.log('JupyterLab extension custom-socketio-chat is activated!');

    const chatWidget = new Widget();
    chatWidget.id = 'socketio-chat-widget';
    chatWidget.title.label = 'Chat';
    chatWidget.title.closable = true;
    chatWidget.node.innerHTML = `
      <div style="padding: 1em; font-family: sans-serif;">
        <h3>Live Chat</h3>
        <div id="chat-box" style="border:1px solid #ccc;height:200px;overflow-y:auto;margin-bottom:10px;padding:5px;"></div>
        <input id="chat-input" type="text" placeholder="Type a message..." style="width:80%;" />
        <button id="send-btn">Send</button>
      </div>
    `;

    const chatBox = chatWidget.node.querySelector('#chat-box') as HTMLDivElement;
    const input = chatWidget.node.querySelector('#chat-input') as HTMLInputElement;
    const sendBtn = chatWidget.node.querySelector('#send-btn') as HTMLButtonElement;

    const socket: Socket = io('https://bazaar.lti.cs.cmu.edu/bazaar/login?roomName=regex&roomId=room500&id=1&username=Charles&html=chat_mm');

    socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    socket.on('chat message', (msg: string) => {
      const msgDiv = document.createElement('div');
      msgDiv.textContent = msg;
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    });

    sendBtn.onclick = () => {
      const message = input.value.trim();
      if (message) {
        socket.emit('chat message', message);
        input.value = '';
      }
    };

    app.shell.add(chatWidget, 'left');
    restorer.add(chatWidget, 'socketio-chat-widget');

    palette.addItem({
      command: 'socketio-chat:open',
      category: 'Chat'
    });

    app.commands.addCommand('socketio-chat:open', {
      label: 'Open Chat',
      execute: () => {
        app.shell.activateById(chatWidget.id);
      }
    });
  }
};

export default plugin;
