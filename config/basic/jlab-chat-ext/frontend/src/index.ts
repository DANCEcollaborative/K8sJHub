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
import { PageConfig } from '@jupyterlab/coreutils';
import { Widget } from '@lumino/widgets';
import io from 'socket.io-client';
import { LabIcon } from '@jupyterlab/ui-components';
import mySvg from './lock.svg';

// Define the chat icon
export const chatIcon = new LabIcon({
  name: 'jlab-chat-ext:chat',
  svgstr: mySvg
});

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jlab-chat-ext',
  autoStart: true,
  requires: [ICommandPalette],
  optional: [ILauncher, ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    launcher: ILauncher | null,
    restorer: ILayoutRestorer | null
  ) => {
    console.log('✅ jlab-chat-ext is loaded');

    const { commands, shell } = app;
    console.log('✅ About to attempt connection to CHAT_WS_URL');
    // Get the URL from the page config injected by the server
    const targetURL = PageConfig.getOption('chatServerUrl');
    console.log('✅ targetURL === ' + targetURL + ' ===');
    const wsURL = targetURL || 'http://${window.location.hostname}:3001';    
//     const wsURL = (window as any).CHAT_WS_URL || 'http://${window.location.hostname}:3001';
    console.log('✅ Connecting to chat server at:', wsURL);
//     const socket = io(wsURL);
    const socket = io(wsURL, {
      reconnectionAttempts: 5,
      timeout: 10000
    });
    console.log('✅ Attempted connection to wsURL');

    // --- Main Area Widget ---
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
      const room = (mainContent.node.querySelector('#mainRoomInput') as HTMLInputElement).value.trim();
    	console.log('✅ Room is now === ' + room + ' ===');
      if (room) {
        if (mainRoom) socket.emit('leave', mainRoom);
    	  console.log('✅ Emitting join');
        socket.emit('join', room);
        mainRoom = room;
    	  console.log('✅ Room is joined ?');
        mainLog.innerHTML += `<div><em>Joined room: ${room}</em></div>`;
      } else {
        mainLog.innerHTML += `<div><em>Please enter a room name.</em></div>`;
      }
    });

    mainContent.node.querySelector('#mainSendBtn')?.addEventListener('click', () => {
      const input = mainContent.node.querySelector('#mainChatInput') as HTMLInputElement;
      const msg = input.value.trim();
      if (msg) {
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

    socket.on('chat message', (data: { room: string; message: string }) => {
			// Show all messages for now — can filter by room if needed
			mainLog.innerHTML += `<div>${data.message}</div>`;
			mainLog.scrollTop = mainLog.scrollHeight;
			sidebarLog.innerHTML += `<div>${data.message}</div>`;
    	sidebarLog.scrollTop = sidebarLog.scrollHeight;
//  	  	// Only display the message if it's for the current room
//   		if (data.room === mainRoom) {
//    			mainLog.innerHTML += `<div>${data.message}</div>`;
//     		mainLog.scrollTop = mainLog.scrollHeight;
//   	    sidebarLog.innerHTML += `<div>${msg}</div>`;
//     	  sidebarLog.scrollTop = sidebarLog.scrollHeight;
//   		}
    });

    // --- Main Widget Setup ---
    const mainWidget = new MainAreaWidget({ content: mainContent });
    mainWidget.id = 'jlab-chat-ext-main';
    mainWidget.title.label = 'Chat';
    mainWidget.title.icon = chatIcon;
    mainWidget.title.closable = true;

    // --- Sidebar Setup ---
    sidebarContent.id = 'jlab-chat-ext-sidebar';
    sidebarContent.title.caption = 'Chat Sidebar';
    (sidebarContent.title as any).iconClass = 'jp-ChatIcon jp-SideBar-tabIcon';
    shell.add(sidebarContent, 'left', { rank: 800 });

    // --- Command Setup ---
    const commandID = 'jlab-chat-ext:open-main';
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
    launcher?.add({ command: commandID, category: 'Other', rank: 1 });
    restorer?.add(mainWidget as any, mainWidget.id);
  }
};

export default plugin;
