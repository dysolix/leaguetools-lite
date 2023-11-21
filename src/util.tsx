import { fileURLToPath } from 'url';
import path from 'path';
import { Client } from './hasagi-client';
import { getData, loadData } from './data';
import Configuration, { loadConfig } from './configuration';
import { Hasagi } from '@hasagi/extended';
import MainProcessIpc from './main-process';
import { Section } from './components';
import { useContext, useEffect } from 'react';
import { AppContext, NavigationContext } from './context';
import fs from "fs/promises";

let basePath: string;

export function setBasePath(path: string) {
    basePath = path;
}

export function getBasePath() {
    return basePath;
}

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

    if (!runePage.name.startsWith(Configuration.get("runeImportPrefix")))
        runePage.name = Configuration.get("runeImportPrefix").trim() + " " + runePage.name.trim();

    return await client.Runes.replaceRunePage(targetRunePage.id, runePage).then(() => true, () => false);
}

export function LargePageText(props: { text: string }) {
    return (
        <div>
            <Section wide forceMaxHeight>
                <div className="center" style={{ color: "white", fontSize: "32px", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                    {props.text}
                </div>
            </Section>
        </div>
    )
}

export function ThemeHandler() {
    const appContext = useContext(AppContext);
    useEffect(() => {
        if (appContext.themes === null || appContext.config === null)
            return;
        
        const theme = appContext.themes.find(theme => theme.name === appContext.config.theme);
        if(theme) {
            theme.load();
        }
    }, [appContext.config, appContext.config?.theme, appContext.themes]);

    return null;
}