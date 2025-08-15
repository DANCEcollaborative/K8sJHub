import { Widget } from '@lumino/widgets';
import { MessageHandler } from './MessageHandler';

export class SidebarChatWidget extends Widget {
  private log: HTMLElement;

  constructor(handler: MessageHandler) {
    super();
    this.addClass('jp-SidebarChatWidget');

    this.node.innerHTML = `
      <div style="padding: 0.5em;">
        <h4>Sidebar Chat</h4>
        <div id="sidebarChatLog" style="height: 150px; overflow-y: scroll; border: 1px solid #ccc;"></div>
      </div>
    `;

    this.id = 'jlab-chat-ext-sidebar';
    this.title.caption = 'Chat Sidebar';

    this.log = this.node.querySelector('#sidebarChatLog')!;

    handler.onMessage((msg) => {
      this.log.innerHTML += `<div>${msg}</div>`;
      this.log.scrollTop = this.log.scrollHeight;
    });
  }
}
