import Configuration from "./configuration";
import axios from "axios";
import os from "os";

let updateAvailableCallback: ((info: {version: string, url: string}) => void) | null = null;
export function setUpdateAvailableCallback(callback: (info: {version: string, url: string}) => void) {
    updateAvailableCallback = callback;
}

export async function checkForUpdates(): Promise<{ version: string, url: string } | null> {
    const [username, repo] = Configuration.get("autoUpdaterGitHubRepo").split("/");
    const latestRelease = await axios.get(`https://api.github.com/repos/${username}/${repo}/releases/latest`).then(res => res.data);
    const latestVersion: string = latestRelease.tag_name.substring(1);

    if(process.env.NODE_ENV === "development")
        return null;

    if(latestVersion === window.appVersion)
        return null;

    if(os.type() === "Windows_NT") {
        const asset = latestRelease.assets.find((asset: any) => asset.name.endsWith(".exe"));
        const availableUpdate = { version: latestVersion, url: asset.browser_download_url };
        updateAvailableCallback?.(availableUpdate);
        return availableUpdate;
    } else if (os.type() === "Linux") {
        return null; // AutoUpdater is not tested on Linux #TODO

        const asset = latestRelease.assets.find((asset: any) => asset.name.endsWith(".AppImage"));
        return asset.browser_download_url;
    }

    return null;
}