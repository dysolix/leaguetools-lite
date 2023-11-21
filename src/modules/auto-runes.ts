import Configuration from "../configuration";
import { getData } from "../data";
import { Client } from "../hasagi-client";
import { AutoRunes, RunePages } from "../manager/rune-manager";
import { replaceLeagueToolsRunePage } from "../util";

export default function registerAutoRunesModule() {
    Client.on("champ-select-local-player-pick-completed", async (id) => {
        if (!Configuration.get("enableAutomaticRuneImport")) return;
        let champion = getData().champions.getChampion(id);
        if (champion === null) return;
        let mapId = Client.gameflowSession?.map.id;
        let arEntry = AutoRunes.get(champion.id);

        if (mapId === 11) {
            if (arEntry?.summonersRiftRunePage && arEntry.summonersRiftRunePage !== "") {
                const runePage = RunePages.get(arEntry.summonersRiftRunePage);
                if(!runePage)
                    return;

                replaceLeagueToolsRunePage({ name: champion.name, primaryStyleId: runePage.primaryRuneTreeId, selectedPerkIds: runePage.runeIds, subStyleId: runePage.secondaryRuneTreeId })
            } 
        } else if (mapId === 12) {
            if (arEntry?.howlingAbyssRunePage && arEntry.howlingAbyssRunePage !== "") {
                const runePage = RunePages.get(arEntry.howlingAbyssRunePage);
                if(!runePage)
                    return;

                replaceLeagueToolsRunePage({ name: champion.name, primaryStyleId: runePage.primaryRuneTreeId, selectedPerkIds: runePage.runeIds, subStyleId: runePage.secondaryRuneTreeId })
            } 
        }
    })
}