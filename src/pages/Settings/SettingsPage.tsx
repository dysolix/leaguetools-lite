import { useContext } from "react";
import { Toggle, Section, DropdownList, TextInput } from "../../components";
import Configuration from "../../configuration";
import { AppContext } from "../../context";
import { ipcRenderer } from "electron";
import MainProcessIpc from "../../main-process";
import path from "path";

export default function SettingsPage() {
    const appContext = useContext(AppContext);

    return (
        <div>
            <Section>
                <Toggle label="Start in system tray" state={appContext.config.startInSystemTray} setState={newState => {
                    Configuration.set("startInSystemTray", newState);
                }} />
                <Toggle label="Minimize to system tray" state={appContext.config.minimizeToSystemTray} setState={newState => {
                    Configuration.set("minimizeToSystemTray", newState);
                    ipcRenderer.invoke("setCloseToTray", newState);
                }} />
                <Toggle label="Launch on system startup" state={appContext.config.launchOnSystemStartup} setState={newState => {
                    Configuration.set("launchOnSystemStartup", newState);
                    ipcRenderer.invoke("setAutoStart", newState);
                }} />
            </Section>
            <Section>
                <DropdownList label="Theme" value={appContext.config.theme} onChange={ev => Configuration.set("theme", ev.target.value)}>
                    {appContext.themes.map(theme => <option key={theme.name} value={theme.name}>{theme.name}</option>)}
                </DropdownList>
            </Section>
            <Section>
                <Toggle label="Use lockfile" tooltip="Requires a restart to show effect" state={appContext.config.lockfilePath !== null} setState={state => {
                    if(state) {
                        Configuration.set("lockfilePath", "");
                    } else {
                        Configuration.set("lockfilePath", null);
                    }
                }}/>
                {appContext.config.lockfilePath !== null ? <TextInput placeholder="Absolute path to lockfile" value={appContext.config.lockfilePath} valid={path.isAbsolute(appContext.config.lockfilePath)} onChange={ev => Configuration.set("lockfilePath", ev.target.value)} /> : null}
            </Section>
            <Section>
                <Toggle label="Enable developer mode" tooltip="Requires a restart to show effect." state={appContext.config.developerMode} setState={newState => {
                    Configuration.set("developerMode", newState);
                    MainProcessIpc.restart();
                }} />
            </Section>
        </div>
    )
}