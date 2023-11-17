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
        if (!appContext.ready || !appContext.config?.theme)
            return;

        const root = document.querySelector(':root')! as HTMLElement;
        switch (appContext.config.theme) {
            default:
            case "dark/green":
                root.style.setProperty('--primaryColor', '#40bd40');
                root.style.setProperty('--secondaryColor', '#3cb33c');
                root.style.setProperty('--tertiaryColor', '#38aa38');

                root.style.setProperty('--primaryBackgroundColor', 'rgb(88, 88, 88)');
                root.style.setProperty('--secondaryBackgroundColor', 'rgb(39, 39, 39)');

                root.style.setProperty('--textColor', 'white');

                root.style.setProperty("--checkedToggleColor", "var(--primaryColor)")

                root.style.setProperty("--connectedColor", "var(--primaryColor)")
                root.style.setProperty("--disconnectedColor", "#e64242")
                break;

            case "dark/blue":
                root.style.setProperty('--primaryColor', '#0098ff');
                root.style.setProperty('--secondaryColor', '#0080d5');
                root.style.setProperty('--tertiaryColor', '#007acc');

                root.style.setProperty('--primaryBackgroundColor', 'rgb(88, 88, 88)');
                root.style.setProperty('--secondaryBackgroundColor', 'rgb(39, 39, 39)');

                root.style.setProperty('--textColor', 'white');

                root.style.setProperty("--checkedToggleColor", "var(--primaryColor)")

                root.style.setProperty("--connectedColor", "var(--primaryColor)")
                root.style.setProperty("--disconnectedColor", "#e64242")
                break;

            case "dark/purple":
                root.style.setProperty('--primaryColor', '#6c00ff');
                root.style.setProperty('--secondaryColor', '#5f00df');
                root.style.setProperty('--tertiaryColor', '#5800cf');

                root.style.setProperty('--primaryBackgroundColor', 'rgb(88, 88, 88)');
                root.style.setProperty('--secondaryBackgroundColor', 'rgb(39, 39, 39)');

                root.style.setProperty('--textColor', 'white');

                root.style.setProperty("--checkedToggleColor", "var(--primaryColor)")

                root.style.setProperty("--connectedColor", "var(--primaryColor)")
                root.style.setProperty("--disconnectedColor", "#4f00bb")
                break;

            case "light/blue":
                root.style.setProperty('--primaryColor', '#0098ff');
                root.style.setProperty('--secondaryColor', '#0080d5');
                root.style.setProperty('--tertiaryColor', '#007acc');

                root.style.setProperty('--primaryBackgroundColor', 'rgb(255 255 255)');
                root.style.setProperty('--secondaryBackgroundColor', 'rgb(210 238 255)');

                root.style.setProperty('--textColor', 'black');

                root.style.setProperty("--checkedToggleColor", "#0d6efd")

                root.style.setProperty("--connectedColor", "var(--primaryColor)")
                root.style.setProperty("--disconnectedColor", "#e64242")
                break
        }
    }, [appContext.ready, appContext.config, appContext.config?.theme]);

    return null;
}