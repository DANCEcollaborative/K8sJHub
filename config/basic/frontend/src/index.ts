import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  ICommandPalette,
  MainAreaWidget
} from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { io, Socket } from 'socket.io-client';

const extension: JupyterFrontEndPlugin<void> = {
  id: 'jlab-ws-chat-extension',
  autoStart: true,
  requires: [ICommandPalette],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('JupyterLab extension jlab-ws-chat-extension is activated!');

    const command = 'chat:open';
    app.commands.addCommand(command, {
      label: 'Open Chat Panel',
      execute: () => {
        const content = new Widget();
        content.node.textContent = 'Chat panel is coming soon!';
        const widget = new MainAreaWidget({ content });
        widget.title.label = 'Chat';
        widget.title.closable = true;
        app.shell.add(widget, 'main');
      }
    });

    palette.addItem({ command, category: 'Chat' });

    let socketUrl: string;
    if (typeof window !== 'undefined') {
      const loc = window.location;
      if (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') {
        socketUrl = 'http://localhost:3000';
      } else if (loc.protocol === 'http:' || loc.protocol === 'https:') {
        socketUrl = `${loc.protocol}//${loc.host}/socket.io`;
      } else {
        socketUrl = 'https://bazaar.lti.cs.cmu.edu/socket.io';
      }
    } else {
      socketUrl = 'https://bazaar.lti.cs.cmu.edu/socket.io';
    }

    const socket: Socket = io(socketUrl);
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
  }
};

export default extension;
