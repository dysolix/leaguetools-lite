import path from "path";
import fs from "fs/promises";

export type SavedRunePage = {
    name: string,
    primaryRuneTreeId: number,
    secondaryRuneTreeId: number,
    runeIds: number[]
}

export type AutoRuneEntry = {
    key: string,

    summonersRiftRunePage: string | null
    howlingAbyssRunePage: string | null
}

const runeDirectoryy = path.join(window.basePath, "./runes");
const autoRunesFile = path.join(runeDirectoryy, "./auto-runes.json");
const runePagesFile = path.join(runeDirectoryy, "./rune-pages.json");

await fs.mkdir(runeDirectoryy).catch(() => { });
const runePages: SavedRunePage[] = await fs.readFile(runePagesFile, "utf8").then(c => JSON.parse(c), err => []).then(l => Array.isArray(l) ? l : []);
const autoRunes: AutoRuneEntry[] = await fs.readFile(autoRunesFile, "utf8").then(c => JSON.parse(c), err => []).then(l => Array.isArray(l) ? l : []);

export const RunePages = {
    onupdate: null as ((runePages: SavedRunePage[]) => void) | null,
    save() {
        return fs.writeFile(runePagesFile, JSON.stringify(runePages, null, 2), "utf8");
    },
    get(name: string) {
        return runePages.find(p => p.name === name) ?? null;
    },
    getAll: () => structuredClone(runePages),
    exists(name: string) {
        return this.get(name) !== null;
    },
    upsert(page: SavedRunePage | { name: string }) {
        if(this.exists(page.name)) {
            const _page = this.get(page.name)!;
            _page.name = page.name ?? _page.name;
            if("primaryRuneTreeId" in page)
                _page.primaryRuneTreeId = page.primaryRuneTreeId ?? _page.primaryRuneTreeId;
            if("secondaryRuneTreeId" in page)
                _page.secondaryRuneTreeId = page.secondaryRuneTreeId ?? _page.secondaryRuneTreeId;
            if("runeIds" in page)
                _page.runeIds = page.runeIds ?? _page.runeIds;
        } else if("name" in page && "primaryRuneTreeId" in page && "secondaryRuneTreeId" in page && "runeIds" in page) {
            runePages.push(page);
        }

        this.save();
        this.onupdate?.(runePages);
    },
    delete(name: string) {
        const page = this.get(name);
        if(!page)
            throw new Error(`Tried deleting rune page that does not exist. (${name})`);

        runePages.splice(runePages.indexOf(page), 1);

        this.save();
        this.onupdate?.(runePages);
    }
}

export const AutoRunes = {
    onupdate: null as ((autoRunes: AutoRuneEntry[]) => void) | null,
    save() {
        return fs.writeFile(autoRunesFile, JSON.stringify(autoRunes, null, 2), "utf8");
    },
    get(key: string) {
        return autoRunes.find(p => p.key === key) ?? null;
    },
    getAll: () => structuredClone(autoRunes),
    exists(name: string) {
        return this.get(name) !== null;
    },
    set(key: string, value: AutoRuneEntry | null) {
        if(this.exists(key)) {
            if(value !== null) {
                const _page = this.get(key)!;
                _page.summonersRiftRunePage = value.summonersRiftRunePage ?? _page.summonersRiftRunePage;
                _page.howlingAbyssRunePage = value.howlingAbyssRunePage ?? _page.howlingAbyssRunePage;

                if(_page.summonersRiftRunePage === null && _page.howlingAbyssRunePage === null)
                    this.delete(key);
            } else {
                this.delete(key);
            }
        } else {
            if(value !== null) {
                autoRunes.push(value);
            } 
        }

        this.save();
        this.onupdate?.(autoRunes);
    },
    delete(name: string) {
        const page = this.get(name);
        if(!page)
            throw new Error(`Tried deleting auto rune that does not exist. (${name})`);

        autoRunes.splice(autoRunes.indexOf(page), 1);

        this.save();
        this.onupdate?.(autoRunes);
    }
}