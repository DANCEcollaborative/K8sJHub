// frontend/build-install-json.mjs
import extensionBuilder from '@jupyterlab/extension-builder';
import { writeFile } from 'fs/promises';

const { buildInstallInfo } = extensionBuilder;

const installData = await buildInstallInfo({
  pkgPath: process.cwd()
});

await writeFile('install.json', JSON.stringify(installData, null, 2));
console.log('✅ install.json generated from package.json');
