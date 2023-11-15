import { app, BrowserWindow, ipcMain, Tray, nativeImage, Menu, Notification } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const config = { startInSystemTray: false, developerMode: true };
const iconPath = path.join(__dirname, '/favicon.ico');

async function createWindow() {
    const win = new BrowserWindow({
        width: 1100,
        height: 700,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: !app.isPackaged || config.developerMode
        },
        frame: false,
        icon: iconPath,
        show: config.startInSystemTray !== undefined ? !config.startInSystemTray : false
    });

    try {
        if (app.isPackaged) await fs.mkdir(path.join(app.getPath("userData"), "/storage"));
    } catch (e) { }

    if (app.isPackaged)
        await win.loadURL("file://" + path.join(__dirname, "index.html"));
    else
        await win.loadURL("http://localhost:3000");


    app.setAppUserModelId("LeagueTools");

    return win;
}

function showAndFocusWindow() {
    if (BrowserWindow.getAllWindows().length !== 0) {
        let browserWindow = BrowserWindow.getAllWindows()[0];
        browserWindow.show()
        browserWindow.focus();
    } else {
        createWindow(true);
    }
}

var tray = null;
var win = null;
var contextMenu = null;
var closeToTray = true;

app.on("ready", async () => {
    win = await createWindow();
    tray = new Tray(nativeImage.createFromPath(iconPath));
    tray.setTitle("LeagueTools");
    tray.setToolTip("LeagueTools");
    contextMenu = Menu.buildFromTemplate([
        { label: "Close", click: () => app.quit() }
    ]);

    tray.setContextMenu(contextMenu);

    tray.on('click', (ev) => {
        showAndFocusWindow();
    })

    win.setTitle("LeagueTools");
});