import QuitButton from "../QuitButton";
import SidebarLink from "./SidebarLink/SidebarLink";
import "./SideBar.css";

export default function SideBar() {
    return (
        <div id="sidebar">
            <SidebarLink target="settings" title="Settings" />
            <QuitButton />
        </div>
    );
}