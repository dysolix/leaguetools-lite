import Configuration from "../configuration";
import { Client } from "../hasagi-client";

Client.on("rune-pages-update", () => {
    if (!Configuration.get("enableMagicalFootwearReplacer")) return;
    let currentRunePage = Client.runePages.find(rp => rp.current);
    if (currentRunePage === undefined) return;
    let mfIndex = currentRunePage.selectedPerkIds.findIndex(rune => rune === 8304);
    if (mfIndex === -1) return;
    currentRunePage.selectedPerkIds[mfIndex] = 8313;
    Client.Runes.replaceRunePage(currentRunePage.id, currentRunePage);
})