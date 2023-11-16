import { ipcRenderer } from "electron";
import fs from "fs/promises";
import path from "path";
import { DataDragon, MerakiAnalytics } from "@hasagi/data";

const basePath = await ipcRenderer.invoke('getBasePath');
window.basePath = basePath;
await fs.mkdir(basePath, { recursive: true });

console.log(window.basePath);

const latestPatch = await DataDragon.getLatestPatch("euw");

try {
    const data = await fs.readFile(path.join(basePath, "./data.json"), "utf-8").then(JSON.parse);
    if (data.patch !== latestPatch)
        throw new Error();

    if (data.champions === undefined)
        throw new Error();

    if (data.runes === undefined)
        throw new Error();

    if (data.summonerSpells === undefined)
        throw new Error();

    if (data.items === undefined)
        throw new Error();

    window.loadedLeagueData = data;
} catch (e) {
    const downloadedData = {
        patch: latestPatch,
        champions: (await DataDragon.getChampions(latestPatch)).entries,
        runes: (await DataDragon.getRunes(latestPatch)).entries,
        summonerSpells: (await DataDragon.getSummonerSpells(latestPatch)).entries,
        items: (await MerakiAnalytics.getItems()).entries
    }

    window.loadedLeagueData = downloadedData;
    await fs.writeFile(path.join(basePath, "./data.json"), JSON.stringify(downloadedData));
}

console.log(window.loadedLeagueData);