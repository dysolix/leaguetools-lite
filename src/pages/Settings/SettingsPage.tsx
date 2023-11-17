import { useContext } from "react";
import { Toggle, Section, DropdownList } from "../../components";
import Configuration from "../../configuration";
import { AppContext } from "../../context";
import { ipcRenderer } from "electron";
import MainProcessIpc from "../../main-process";

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
                    <option key="dark/green" value="dark/green">Dark/Green</option>
                    <option key="dark/blue" value="dark/blue">Dark/Blue</option>
                    <option key="dark/purple" value="dark/purple">Dark/Purple</option>
                    <option key="light/blue" value="light/blue">WTF MAN?</option>
                </DropdownList>
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