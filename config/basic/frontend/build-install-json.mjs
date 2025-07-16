import pkg from '@jupyterlab/extension-builder';

const { buildInstallInfo } = pkg;

buildInstallInfo({
  lib: 'lib',
  output: '../jlab_ws_chat_extension/labextension'
});
