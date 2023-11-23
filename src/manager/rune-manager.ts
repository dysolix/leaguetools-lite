import path from "path";
import fs from "fs/promises";

/*
    Buttons get disabled when they can't be used; Added auto loadout/rune verification
*/

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
const autoRunes: AutoRuneEntry[] = await fs.readFile(autoRunesFile, "utf8")
    .then(c => JSON.parse(c), err => [])
    .then(l => Array.isArray(l) ? l : []);

autoRunes.forEach(rune => {
    if (rune.howlingAbyssRunePage !== null && !RunePages.exists(rune.howlingAbyssRunePage))
        rune.howlingAbyssRunePage = null;
    if (rune.summonersRiftRunePage !== null && !RunePages.exists(rune.summonersRiftRunePage))
        rune.summonersRiftRunePage = null;
});

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
    set(name: string, page: Partial<SavedRunePage> | null) {
        if (this.exists(name)) {
            if (page !== null) {
                const _page = this.get(name)!;
                _page.name = page.name ?? _page.name;
                _page.primaryRuneTreeId = page.primaryRuneTreeId ?? _page.primaryRuneTreeId;
                _page.secondaryRuneTreeId = page.secondaryRuneTreeId ?? _page.secondaryRuneTreeId;
                _page.runeIds = page.runeIds ?? _page.runeIds;
            } else {
                runePages.splice(runePages.indexOf(this.get(name)!), 1);
            }

            this.onupdate?.(runePages);
            return this.save();
        } else if (page !== null && page.name !== undefined && page.primaryRuneTreeId !== undefined && page.secondaryRuneTreeId !== undefined && page.runeIds !== undefined) {
            runePages.push(page as SavedRunePage);
            this.onupdate?.(runePages);
            return this.save();
        }

        return Promise.resolve();
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
        if (this.exists(key)) {
            if (value !== null) {
                if (value.summonersRiftRunePage !== null && !RunePages.exists(value.summonersRiftRunePage))
                    value.summonersRiftRunePage = null;
                if (value.howlingAbyssRunePage !== null && !RunePages.exists(value.howlingAbyssRunePage))
                    value.howlingAbyssRunePage = null;

                const _page = this.get(key)!;
                _page.summonersRiftRunePage = value.summonersRiftRunePage ?? _page.summonersRiftRunePage;
                _page.howlingAbyssRunePage = value.howlingAbyssRunePage ?? _page.howlingAbyssRunePage;

                if (_page.summonersRiftRunePage === null && _page.howlingAbyssRunePage === null)
                    return this.delete(key);

                this.onupdate?.(autoRunes);
                return this.save();
            } else {
                return this.delete(key);
            }
        } else {
            if (value !== null) {
                autoRunes.push(value);
                this.onupdate?.(autoRunes);
                return this.save();
            }
        }

        return Promise.resolve();
    },
    delete(name: string) {
        const page = this.get(name);
        if (!page)
            throw new Error(`Tried deleting auto rune that does not exist. (${name})`);

        autoRunes.splice(autoRunes.indexOf(page), 1);

        this.onupdate?.(autoRunes);
        return this.save();
    }
}