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
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { Widget } from '@lumino/widgets';
import io from 'socket.io-client';
import { LabIcon } from '@jupyterlab/ui-components';
import mySvg from '!!raw-loader!./lock.svg';

// --- Chat icon ---
export const chatIcon = new LabIcon({
  name: 'jlab-chat-ext:chat',
  svgstr: mySvg
});

// --- plugin ---
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jlab-chat-ext',
  autoStart: true,
  requires: [ICommandPalette, ISettingRegistry],
  optional: [ILauncher, ILayoutRestorer],
  activate: async (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    settingRegistry: ISettingRegistry,
    launcher: ILauncher | null,
    restorer: ILayoutRestorer | null
  ) => {
    console.log('✅ jlab-chat-ext is loaded');

    const { commands, shell } = app;

    // --- Get chat URL from settings ---
    let wsURL = `http://${window.location.hostname}:3001`; // fallback

    try {
      const settings = await settingRegistry.load(plugin.id);
      wsURL = settings.get('chatURL').composite as string || wsURL;

      // Listen for changes dynamically
      settings.changed.connect(() => {
        const newURL = settings.get('chatURL').composite as string;
        if (newURL) {
          wsURL = newURL;
          console.log('🔄 Chat URL updated to:', wsURL);
          // Optionally reconnect your socket here if needed
        }
      });

      console.log('✅ CHAT_WS_URL from settings:', wsURL);
    } catch (err) {
      console.warn('❌ Could not load chatURL from settings, using fallback: ', wsURL);
    }

    // --- Connect Socket.IO ---
    const socket = io(wsURL, { reconnectionAttempts: 5, timeout: 10000 });
    console.log('✅ Attempted connection to wsURL');

    socket.on('connect', () => {
      console.log(`✅ Connected to chat server at ${wsURL}`);
    });

    socket.on('disconnect', (reason) => {
      console.warn(`⚠️ Disconnected from chat server: ${reason}`);
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log(`♻️ Reconnect attempt ${attempt}...`);
    });

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
      const room = (mainContent.node.querySelector('#mainRoomInput') as HTMLInputElement).value.trim();
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
      	console.log('✅ Chat message: ' + msg);
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
      mainLog.innerHTML += `<div>${data.message}</div>`;
      mainLog.scrollTop = mainLog.scrollHeight;
      sidebarLog.innerHTML += `<div>${data.message}</div>`;
      sidebarLog.scrollTop = sidebarLog.scrollHeight;
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
