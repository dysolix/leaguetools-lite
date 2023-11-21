import { Constants } from "@hasagi/extended";
import Configuration from "../configuration";
import { getData } from "../data";
import { Client } from "../hasagi-client";
import { AutoLoadout, LoadoutPreset } from "../manager/loadout-manager";

export default function registerAutoLoadoutModule() {
    Client.on("champ-select-local-player-pick-completed", async championId => {
        if (!Configuration.get("enableAutomaticLoadoutImport"))
            return;

        if(((await Client.getClientRegion())?.region ?? "PBE") === "PBE" && Configuration.get("disableAutomaticLoadoutImportOnPBE"))
            return;

        const isAram = Client.gameflowSession?.gameData.queue.id === Constants.ARAM_QUEUE_ID;

        const key = getData().champions.getChampion(championId)?.key;
        if (!key)
            return;

        let autoLoadoutTarget = AutoLoadout.get(key);
        if (!autoLoadoutTarget)
            autoLoadoutTarget = AutoLoadout.get("default");

        if (!autoLoadoutTarget)
            return;

        if(!LoadoutPreset.exists(autoLoadoutTarget.value))
            return;

        await LoadoutPreset.loadPreset(autoLoadoutTarget.value);

        if(isAram){
            const aramLoadout = LoadoutPreset.get(AutoLoadout.get("aram_little_legend")?.value ?? "");
            if(!aramLoadout)
                return;

            if(aramLoadout.tacticianId)
                Client.Inventory.setLittleLegend(aramLoadout.tacticianId)
        }
    })

    Client.on("gameflow-phase-update", async (newPhase) => {
        if (!Configuration.get("enableAutomaticLoadoutImport"))
            return;

        if(((await Client.getClientRegion()).region ?? "PBE") === "PBE" && Configuration.get("disableAutomaticLoadoutImportOnPBE"))
            return;

        if (newPhase !== "EndOfGame")
            return;

        let autoLoadoutTarget = AutoLoadout.get("default");

        if (!autoLoadoutTarget)
            return;

        LoadoutPreset.loadPreset(autoLoadoutTarget.value);
    })

    //TODO: Check for TFT lobby and load default TFT loadout
}