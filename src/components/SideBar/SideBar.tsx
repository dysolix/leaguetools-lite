import QuitButton from "../QuitButton";
import SidebarLink from "./SidebarLink/SidebarLink";
import "./SideBar.css";

export default function SideBar() {
    return (
        <div id="sidebar">
            <SidebarLink target="UltimateBravery" title="UltimateBravery" />
            <SidebarLink target="Miscellaneous" title="Miscellaneous" />
            <SidebarLink target="Settings" title="Settings" />
            <QuitButton />
        </div>
    );
}