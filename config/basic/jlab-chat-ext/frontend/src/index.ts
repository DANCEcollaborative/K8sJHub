import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { MessageHandler } from './MessageHandler';
import { MainChatWidget } from './MainChatWidget';
import { SidebarChatWidget } from './SidebarChatWidget';
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

    const { shell, commands } = app;

    // --- Default fallback chat URL ---
    let chatURL = 'https://bree.lti.cs.cmu.edu/bazaar/login?roomName=regex&roomId=505&id=1&username=Robbie&html=chat_mm';

    // --- Unified MessageHandler ---
    const chatHandler = new MessageHandler(chatURL);

    try {
      const settings = await settingRegistry.load('@my-org/jlab-chat-ext:plugin');
      const savedURL = settings.get('chatURL').composite as string;
      if (savedURL) chatHandler.updateURL(savedURL);

      // Listen for settings changes dynamically
      settings.changed.connect(() => {
        const newURL = settings.get('chatURL').composite as string;
        if (newURL) {
          chatHandler.updateURL(newURL);
        }
      });

      console.log('✅ CHAT_WS_URL from settings:', chatURL);
    } catch (err) {
      console.warn('❌ Could not load chatURL from settings, using fallback:', chatURL);
    }

    // --- Main Chat Widget ---
    const mainWidget = new MainChatWidget(chatHandler);

    // --- Sidebar Chat Widget ---
    const sidebarWidget = new SidebarChatWidget(chatHandler);
    shell.add(sidebarWidget, 'left', { rank: 800 });

    // --- Command to open Main Chat Widget ---
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
    restorer?.add(mainWidget, mainWidget.id); 
  }
};

export default plugin;
