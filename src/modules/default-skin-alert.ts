import Configuration from "../configuration";
import { getData } from "../data";
import { Client } from "../hasagi-client";
import MainProcessIpc from "../main-process";

export default function registerDefaultSkinAlertModule() {
    Client.on("champ-select-local-player-pick-completed", async (championId) => {
        if (!Configuration.get("enableDefaultSkinAlert"))
            return;
    
        if (!Client.isConnected)
            return;
    
        const champSelectSession = Client.champSelectSession;
        if (!champSelectSession)
            return;
    
        if(!champSelectSession.allowSkinSelection)
            return;
    
        const localPlayerCell = champSelectSession.myTeam.find(teamMember => teamMember.cellId === champSelectSession.localPlayerCellId);
        if (!localPlayerCell)
            return;
    
        const selectedChampion = getData().champions.getChampion(localPlayerCell.championId);
        if (!selectedChampion)
            return;
    
        const selectedChampionDefaultSkinId = selectedChampion.skins.find(skin => skin.name === "default")?.id;
        if (!selectedChampionDefaultSkinId)
            return;
    
        if (localPlayerCell.selectedSkinId === Number(selectedChampionDefaultSkinId)) {
            const championSkins = selectedChampion.skins.map(skin => Number(skin.id));
            delete championSkins[championSkins.indexOf(Number(selectedChampionDefaultSkinId))];
            const ownedSkins = Client.pickableSkinIds;
            const ownedChampionSkins = ownedSkins.filter(ownedSkin => championSkins.includes(ownedSkin))
            if (ownedChampionSkins.length > 0) {
                MainProcessIpc.sendNotification("No skin selected", `You own ${ownedChampionSkins.length} skin${ownedChampionSkins.length !== 1 ? "s" : ""} for ${selectedChampion.name}, but have the default skin selected.`);
            }
        }
    });
}