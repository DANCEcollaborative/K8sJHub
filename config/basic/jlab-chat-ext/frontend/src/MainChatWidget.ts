import { Widget } from '@lumino/widgets';
import { MainAreaWidget } from '@jupyterlab/apputils'; 
import { MessageHandler } from './MessageHandler';
import { chatIcon } from './index';

export class MainChatWidget extends MainAreaWidget<Widget> {
  private log: HTMLElement;
  private room = '';

  constructor(handler: MessageHandler) {
    const content = new Widget();
    super({ content });
    this.id = 'jlab-chat-ext-main';
    this.title.label = 'Chat';
    this.title.icon = chatIcon;
    this.title.closable = true;

    content.node.innerHTML = `
      <div style="padding: 1em;">
        <h3>Main Chat Widget</h3>
        <input id="mainRoomInput" placeholder="Room name" />
        <button id="mainJoinBtn">Join</button>
        <div id="mainChatLog" style="margin-top: 1em; height: 200px; overflow-y: scroll; border: 1px solid gray;"></div>
        <input id="mainChatInput" placeholder="Type message..." />
        <button id="mainSendBtn">Send</button>
      </div>
    `;

    this.log = content.node.querySelector('#mainChatLog')!;

    handler.onMessage((msg) => {
      this.log.innerHTML += `<div>${msg}</div>`;
      this.log.scrollTop = this.log.scrollHeight;
    });

    // Join room
    content.node.querySelector('#mainJoinBtn')?.addEventListener('click', () => {
      const roomInput = content.node.querySelector('#mainRoomInput') as HTMLInputElement;
      const roomName = roomInput.value.trim();
      if (roomName) {
        if (this.room) handler.leave(this.room);
        handler.join(roomName);
        this.room = roomName;
        this.log.innerHTML += `<div><em>Joined room: ${roomName}</em></div>`;
      } else {
        this.log.innerHTML += `<div><em>Please enter a room name.</em></div>`;
      }
    });

    content.node.querySelector('#mainSendBtn')?.addEventListener('click', () => {
      const input = content.node.querySelector('#mainChatInput') as HTMLInputElement;
      const msg = input.value.trim();
      if (msg) {
        handler.sendMessage(this.room, msg);
        input.value = '';
      }
    });
  }
}
