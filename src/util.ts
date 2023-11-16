import { fileURLToPath } from 'url';
import path from 'path';
import { Client } from './hasagi-client';
import { getData } from './data';
import Configuration from './configuration';
import { Hasagi } from '@hasagi/extended';

export function getDirAndFileName(importMeta: ImportMeta) {
    const __filename = fileURLToPath(importMeta.url);
    const __dirname = path.dirname(__filename);
    return { __filename, __dirname }
}

export async function replaceLeagueToolsRunePage(runePage: Partial<Hasagi.RunePage> & { name: string, selectedPerkIds: number[] }) {
    const client = Client;
    if (!client) {
        //logClientNotAvailableError();
        return false;
    }

    if (runePage.primaryStyleId === undefined) {
        runePage.primaryStyleId = getData().runes.getRuneTreeByRune(runePage.selectedPerkIds[0])?.id;
    }

    if (runePage.subStyleId === undefined) {
        runePage.subStyleId = getData().runes.getRuneTreeByRune(runePage.selectedPerkIds[4])?.id;
    }

    if (runePage.primaryStyleId === undefined || runePage.subStyleId === undefined)
        return false;

    let targetRunePage = client.runePages.find(rp => rp.name.startsWith(Configuration.get("runeImportPrefix")));
    if (targetRunePage === undefined) {
        return false
    };
    
    if(!runePage.name.startsWith(Configuration.get("runeImportPrefix")))
        runePage.name = Configuration.get("runeImportPrefix").trim() + " " + runePage.name.trim();

    return await client.Runes.replaceRunePage(targetRunePage.id, runePage).then(() => true, () => false);
}