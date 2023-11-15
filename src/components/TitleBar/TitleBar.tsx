import "./TitleBar.css";
import { CgClose, CgSoftwareDownload, CgSpinnerAlt } from "react-icons/cg";
import { MdMinimize } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import { useContext, useState } from "react";
import { LoLContext } from "../../context";
import MainProcessIpc from "../../main-process";

const APP_VERSION = "0.0.1";

export default function TitleBar() {
    const lolContext = useContext(LoLContext);

    return (
        <div id="title-bar">
            <div id="app-title">
                LeagueTools
            </div>

            <div id="title-bar-connection-state" style={{ color: (lolContext.isConnected ? "var(--primaryColor)" : undefined) }}>
                <GoDotFill />
            </div>

            <div id="title-bar-app-version">
                {APP_VERSION}
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