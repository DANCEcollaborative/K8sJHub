import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  ICommandPalette, MainAreaWidget, WidgetTracker
} from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';

const extension: JupyterFrontEndPlugin<void> = {
  id: 'chat-extension',
  autoStart: true,
  activate: (app: JupyterFrontEnd, palette: ICommandPalette) => {
    const command = 'chat:open';
    app.commands.addCommand(command, {
      label: 'Open Chat',
      execute: () => {
        const content = new Widget();
        const iframe = document.createElement('iframe');
        iframe.src = '/proxy/3000/chat?roomName=regex&roomId=100';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = '0';
        content.node.appendChild(iframe);

        const widget = new MainAreaWidget({ content });
        widget.title.label = 'Chatroom';
        widget.title.closable = true;
        app.shell.add(widget, 'main');
      }
    });

    palette.addItem({ command, category: 'Chat' });
  }
};

export default extension;
