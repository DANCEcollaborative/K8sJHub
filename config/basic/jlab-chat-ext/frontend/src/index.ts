import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

/**
 * Initialization data for the jlab-chat-ext extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jlab-chat-ext:plugin',
  description: 'JupyterLab extension for chat',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (app: JupyterFrontEnd, settingRegistry: ISettingRegistry | null) => {
    console.log('JupyterLab extension jlab-chat-ext is activated, says Chas!');

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('jlab-chat-ext settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for jlab-chat-ext.', reason);
        });
    }
  }
};

export default plugin;
