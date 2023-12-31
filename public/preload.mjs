import { ipcRenderer } from "electron";
import fs from "fs/promises";

const basePath = await ipcRenderer.invoke('getBasePath');
window.basePath = basePath;
await fs.mkdir(basePath, { recursive: true });

const version = await ipcRenderer.invoke('getVersion');
window.appVersion = version;