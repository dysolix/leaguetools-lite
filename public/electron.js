import { app, BrowserWindow, Tray, nativeImage, Menu, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconPath = path.join(__dirname, '/favicon.ico');
const baseDirPath = app.isPackaged ? app.getPath("userData") : path.join(__dirname, "../development", "./userData");
const configFilePath = path.join(baseDirPath, "./config.json");

/** @type {Partial<import("../src/configuration.ts").ConfigType>} */
const config = await fs.readFile(configFilePath, { encoding: "utf-8" }).then(JSON.parse).catch(() => ({ }));
config.startInSystemTray = config.startInSystemTray ?? false;
config.developerMode = config.developerMode ?? false;

async function createWindow() {
    const win = new BrowserWindow({
        width: 1100,
        height: 700,
        resizable: false,
        webPreferences: {
            nodeIntegration: true, // We can enable this because we do not load external scripts in this window
            contextIsolation: false,
            devTools: !app.isPackaged || config.developerMode,
            preload: path.join(__dirname, "preload.mjs")
        },
        frame: false,
        icon: iconPath,
        show: config.startInSystemTray !== undefined ? !config.startInSystemTray : false,
        
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

function setAutoStart(value) {
    if (!app.isPackaged || app.getLoginItemSettings().openAtLogin === value) return;

    app.setLoginItemSettings({
        openAtLogin: value,
        path: app.getPath("exe"),
        args: ["--autostart"]
    })
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

console.log(app.getVersion())

ipcMain.handle("getVersion", () => (app.getVersion() + (app.isPackaged ? "" : "-dev")))
ipcMain.handle("getBasePath", () => baseDirPath);
ipcMain.handle("showNotification", (ev, title, body) => new Notification({ title, body, icon: iconPath }).show())
ipcMain.handle("exit", (ev, force) => closeToTray && !force ? BrowserWindow.getAllWindows()[0]?.hide() : app.quit());
ipcMain.handle("minimize", () => BrowserWindow.getFocusedWindow()?.minimize());
ipcMain.handle("setAutoStart", (ev, autoStart) => setAutoStart(autoStart));
ipcMain.handle("setCloseToTray", (ev, state) => closeToTray = state);
ipcMain.handle("restart", () => { if(!app.isPackaged) return; app.relaunch(); app.exit(0); })