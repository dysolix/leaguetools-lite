import "./TitleBar.css";
import { CgClose, CgSoftwareDownload, CgSpinnerAlt } from "react-icons/cg";
import { PiLightning, PiLightningBold, PiLightningFill, PiLightningSlash, PiLightningSlashBold, PiLightningSlashFill, PiPlugsConnectedBold } from "react-icons/pi";
import { TbPlugConnectedX } from "react-icons/tb";
import { MdMinimize } from "react-icons/md";
import { useContext, useState } from "react";
import { AppContext, LoLContext } from "../../context";
import MainProcessIpc from "../../main-process";

declare global {
    interface Window {
        appVersion: string
    }
}

export default function TitleBar() {
    const [isUpdating, setUpdating] = useState(false);
    const appContext = useContext(AppContext);
    const lolContext = useContext(LoLContext);

    return (
        <div id="title-bar">
            <div id="app-title">
                LeagueTools
            </div>

            <div id="title-bar-connection-state" style={{ color: (lolContext.isConnected ? "var(--connected-color)" : undefined) }}>
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

                <div title={appContext.updateInfo?.version ? `Update to version ${appContext.updateInfo.version}` : ""} id="title-bar-update" className="title-bar-button" style={{ display: appContext.updateInfo === null ? "none" : undefined }} onClick={() => {
                    if (appContext.updateInfo && !isUpdating) {
                        MainProcessIpc.installUpdate(appContext.updateInfo);
                        setUpdating(true);
                    }
                }}>
                    {isUpdating ? <div className="spin"> <CgSpinnerAlt /> </div> : <CgSoftwareDownload />}
                </div>
            </div>
        </div>
    )
}