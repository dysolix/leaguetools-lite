import "./TitleBar.css";
import { CgClose } from "react-icons/cg";
import { PiLightning, PiLightningBold, PiLightningFill, PiLightningSlash, PiLightningSlashBold, PiLightningSlashFill, PiPlugsConnectedBold } from "react-icons/pi";
import { TbPlugConnectedX } from "react-icons/tb";
import { MdMinimize } from "react-icons/md";
import { useContext, useState } from "react";
import { LoLContext } from "../../context";
import MainProcessIpc from "../../main-process";

declare global {
    interface Window {
        appVersion: string
    }
}

export default function TitleBar() {
    const lolContext = useContext(LoLContext);

    return (
        <div id="title-bar">
            <div id="app-title">
                LeagueTools
            </div>

            <div id="title-bar-connection-state" style={{ color: (lolContext.isConnected ? "var(--connectedColor)" : undefined) }}>
                {lolContext.isConnected ? <PiLightningFill /> : <PiLightningSlashBold />}
            </div>

            <div id="title-bar-app-version">
                {window.appVersion}
            </div>

            <div id="title-bar-right">
                <div id="title-bar-close" className="title-bar-button" onClick={() => MainProcessIpc.exit()}>
                    <CgClose />
                </div>

                <div id="title-bar-minimize" className="title-bar-button" onClick={() => MainProcessIpc.minimize()}>
                    <MdMinimize />
                </div>
            </div>
        </div>
    )
}