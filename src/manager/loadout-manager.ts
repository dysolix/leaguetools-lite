import fs from "fs/promises";
import path from "path";
import { Client } from "../hasagi-client";
import { LCUTypes } from "@hasagi/core"

const loadoutDirectory = path.join(window.basePath, "./loadouts");
const autoLoadoutFile = path.join(loadoutDirectory, "./auto-loadouts.json");
const loadoutPresetsFile = path.join(loadoutDirectory, "./saved-loadouts.json");

await fs.mkdir(loadoutDirectory).catch(() => { });

export type LoadoutPresetEntry = {
    /** Unique name */
    name: string,

    profileIconId?: number
    border?: {
        contentId: string,
        inventoryType: "REGALIA_CREST",
        itemId: number
    }
    displayedChallengeIds?: number[]
    titleId?: number
    banner?: {
        contentId: string,
        inventoryType: "REGALIA_BANNER",
        itemId: number
    }

    tacticianId?: number
    tftBoomId?: number,
    tftArenaId?: number,
    tftLegendId?: number

    ward?: {
        contentId: string,
        inventoryType: "WARD_SKIN",
        itemId: number
    }

    emotes?: {
        EMOTES_ACE?: {
            contentId: string,
            inventoryType: "EMOTE",
            itemId: number
        };
        EMOTES_FIRST_BLOOD?: {
            contentId: string,
            inventoryType: "EMOTE",
            itemId: number
        };
        EMOTES_START?: {
            contentId: string,
            inventoryType: "EMOTE",
            itemId: number
        };
        EMOTES_VICTORY?: {
            contentId: string,
            inventoryType: "EMOTE",
            itemId: number
        };
        EMOTES_WHEEL_CENTER?: {
            contentId: string,
            inventoryType: "EMOTE",
            itemId: number
        };
        EMOTES_WHEEL_LOWER_LEFT?: {
            contentId: string,
            inventoryType: "EMOTE",
            itemId: number
        };
        EMOTES_WHEEL_LOWER_RIGHT?: {
            contentId: string,
            inventoryType: "EMOTE",
            itemId: number
        };
        EMOTES_WHEEL_UPPER_LEFT?: {
            contentId: string,
            inventoryType: "EMOTE",
            itemId: number
        };
        EMOTES_WHEEL_UPPER_RIGHT?: {
            contentId: string,
            inventoryType: "EMOTE",
            itemId: number
        };
        EMOTES_WHEEL_LEFT?: {
            contentId: string,
            inventoryType: "EMOTE",
            itemId: number
        };
        EMOTES_WHEEL_LOWER?: {
            contentId: string,
            inventoryType: "EMOTE",
            itemId: number
        };
        EMOTES_WHEEL_RIGHT?: {
            contentId: string,
            inventoryType: "EMOTE",
            itemId: number
        };
        EMOTES_WHEEL_UPPER?: {
            contentId: string,
            inventoryType: "EMOTE",
            itemId: number
        };
    }

    clash?: {
        bannerId?: number
        trophyId?: number
    }
}
const loadoutPresets: LoadoutPresetEntry[] = await fs.readFile(loadoutPresetsFile, "utf8").then(c => JSON.parse(c), err => []).then(l => Array.isArray(l) ? l : []);
export const LoadoutPreset = {
    onupdate: null as ((loadoutPresets: LoadoutPresetEntry[]) => void) | null,

    get(name: string) {
        return loadoutPresets.find(l => l.name === name) ?? null;
    },
    getAll: () => structuredClone(loadoutPresets),
    exists(name: string) {
        return loadoutPresets.some(l => l.name === name);
    },
    set(key: string, preset: LoadoutPresetEntry | null) {
        if (this.exists(key)) {
            if (preset !== null) {
                console.debug(`Updating loadout preset ${key}...`)
                const target = this.get(key)!;
                target.name = preset.name;
                target.profileIconId = preset.profileIconId;
                target.border = preset.border;
                target.displayedChallengeIds = preset.displayedChallengeIds;
                target.titleId = preset.titleId;
                target.banner = preset.banner;
                target.tacticianId = preset.tacticianId;
                target.tftBoomId = preset.tftBoomId;
                target.tftArenaId = preset.tftArenaId;
                target.tftLegendId = preset.tftLegendId;
                target.ward = preset.ward;
                target.emotes = preset.emotes;
                target.clash = preset.clash;
                this.onupdate?.(loadoutPresets);
                return this.saveToFile();
            } else {
                console.debug(`Deleting loadout preset ${key}...`)
                loadoutPresets.splice(loadoutPresets.indexOf(this.get(key)!), 1);
                this.onupdate?.(loadoutPresets);
                return this.saveToFile();
            }
        } else if (preset !== null) {
            console.debug(`Creating loadout preset ${key}...`)
            preset.name = key;
            loadoutPresets.push(preset);
            this.onupdate?.(loadoutPresets);
            return this.saveToFile();
        }

        return Promise.resolve();
    },

    async loadFromFile() {
        const presets = await fs.readFile(loadoutPresetsFile, "utf8").then(c => JSON.parse(c), err => []).then(l => Array.isArray(l) ? l : []);
        loadoutPresets.splice(0, loadoutPresets.length, ...presets);
    },
    saveToFile() { return fs.writeFile(loadoutPresetsFile, JSON.stringify(loadoutPresets, null, 2)) },

    async loadPreset(loadoutPreset: string | LoadoutPresetEntry) {
        if (typeof loadoutPreset === "string") {
            let savedLoadout = this.get(loadoutPreset);
            if (savedLoadout === null)
                throw new Error(`Tried loading loadout that does not exist. (${loadoutPreset})`);

            loadoutPreset = savedLoadout;
        }

        console.debug(`Loading loadout preset ${loadoutPreset.name}...`)

        const l: Record<string, LCUTypes.LolLoadoutsItemKey> = {};
        if(loadoutPreset.ward)
            l.WARD_SKIN_SLOT = loadoutPreset.ward;
        if(loadoutPreset.clash?.bannerId)
            l.BANNER_FLAG = {
                contentId: "",
                inventoryType: "TOURNAMENT_FLAG",
                itemId: loadoutPreset.clash.bannerId
            }
        if(loadoutPreset.clash?.trophyId)
            l.TOURNAMENT_TROPHY = {
                contentId: "",
                inventoryType: "TOURNAMENT_TROPHY",
                itemId: loadoutPreset.clash.trophyId
            }
        if(loadoutPreset.emotes)
            Object.assign(l, loadoutPreset.emotes);

        await Client.Inventory.updateAccountLoadout(l);

        if (loadoutPreset.tacticianId) {
            await Client.Inventory.setLittleLegend(loadoutPreset.tacticianId);
        }

        if (loadoutPreset.tftBoomId) {
            await Client.Inventory.setTFTBoom(loadoutPreset.tftBoomId);
        }

        if (loadoutPreset.tftArenaId) {
            await Client.Inventory.setTFTArena(loadoutPreset.tftArenaId);
        }

        // Legends influence gameplay and Loadouts are only for cosmetics
        // if (loadoutPreset.tftLegendId) { 
        //     await Client.Inventory.setTFTLegend(loadoutPreset.tftLegendId);
        // }

        if (loadoutPreset.profileIconId)
            await Client.Inventory.setProfileIcon(loadoutPreset.profileIconId);
    }
};

export const RESERVED_AUTO_LOADOUT_NAMES = ["default", "aram_little_legend"] as const;
export type AutoLoadoutKey = typeof RESERVED_AUTO_LOADOUT_NAMES[number] | string;
export type AutoLoadoutEntry = { key: AutoLoadoutKey, value: string };
const autoLoadouts: AutoLoadoutEntry[] = await fs.readFile(autoLoadoutFile, "utf8").then(c => JSON.parse(c), err => []).then(l => Array.isArray(l) ? l : []);
export const AutoLoadout = {
    reservedNames: RESERVED_AUTO_LOADOUT_NAMES,

    onupdate: null as ((autoLoadouts: AutoLoadoutEntry[]) => void) | null,
    get(key: AutoLoadoutKey) {
        return autoLoadouts.find(l => l.key === key) ?? null;
    },
    getAll: () => structuredClone(autoLoadouts),
    exists(key: AutoLoadoutKey) {
        return autoLoadouts.some(l => l.key === key);
    },
    set(key: AutoLoadoutKey, value: string | null) {
        if (this.exists(key)) {
            if (value !== null) {
                console.debug(`Updating auto loadout ${key}...`)
                const _loadout = this.get(key)!;
                _loadout.value = value;
                this.onupdate?.(autoLoadouts);
                return this.saveToFile();
            } else {
                console.debug(`Deleting auto loadout ${key}...`)
                autoLoadouts.splice(autoLoadouts.indexOf(this.get(key)!), 1);
                this.onupdate?.(autoLoadouts);
                return this.saveToFile();
            }   
        } else if (value !== null) {
            console.debug(`Creating auto loadout ${key}...`)
            autoLoadouts.push({ key, value });
            this.onupdate?.(autoLoadouts);
            return this.saveToFile();
        }
    },
    async loadFromFile() {
        const presets = await fs.readFile(autoLoadoutFile, "utf8").then(c => JSON.parse(c), err => []).then(l => Array.isArray(l) ? l : []);
        autoLoadouts.splice(0, autoLoadouts.length, ...presets);
    },
    saveToFile() { return fs.writeFile(autoLoadoutFile, JSON.stringify(autoLoadouts, null, 2)) }
};