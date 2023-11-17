import QuitButton from "../QuitButton";
import SidebarLink from "./SidebarLink/SidebarLink";
import "./SideBar.css";
import { useContext } from "react";
import { AppContext, NavigationContext } from "../../context";

export default function SideBar() {
    const appContext = useContext(AppContext);
    const navContext = useContext(NavigationContext);

    return (
        <div id="sidebar">
            <SidebarLink target="UltimateBravery" title="UltimateBravery" />
            <SidebarLink target="Miscellaneous" title="Miscellaneous" />
            <SidebarLink target="Settings" title={navContext.page === "DeveloperSettings" ? "Developer Settings" : "Settings"} pages={appContext.ready && appContext.config.developerMode ? ["Settings", "DeveloperSettings"] : ["Settings"]} />
            <QuitButton />
        </div>
    );
}