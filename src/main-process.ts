import { ipcRenderer } from 'electron';

declare global {
    interface Window {
        basePath: string;
        storagePath: string;
    }
}

const MainProcessIpc = {
    /** Quits the application or minimizes it to system tray, if enabled */
    exit: (force = false) => ipcRenderer.invoke('exit', force) as Promise<void>,
    minimize: () => ipcRenderer.invoke('minimize') as Promise<void>,
    setAutoStart: (enabled: boolean) => ipcRenderer.invoke('setAutoStart', enabled) as Promise<void>,
    setCloseToTray: (enabled: boolean) => ipcRenderer.invoke('setCloseToTray', enabled) as Promise<void>,
    restart: () => ipcRenderer.invoke('restart') as Promise<void>,
    getBasePath: () => ipcRenderer.invoke('getBasePath') as Promise<string>,
}

export default MainProcessIpc;