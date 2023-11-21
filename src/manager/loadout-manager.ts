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

    add(preset: LoadoutPresetEntry) {
        if (loadoutPresets.find(l => l.name === preset.name))
            throw new Error(`Loadout with name ${preset.name} already exists.`);

        loadoutPresets.push(preset);
        this.saveToFile();
        this.onupdate?.(loadoutPresets);
    },
    get(name: string) {
        return loadoutPresets.find(l => l.name === name) ?? null;
    },
    getAll: () => structuredClone(loadoutPresets),
    exists(name: string) {
        return loadoutPresets.some(l => l.name === name);
    },
    update(target: LoadoutPresetEntry | string, preset: Partial<LoadoutPresetEntry>) {
        if (typeof target === "string") {
            const _target = this.get(target);
            if (_target === null)
                throw new Error(`Tried updating loadout that does not exist. (${target})`);
            target = _target;
        }

        if (!target)
            throw new Error(`Tried updating loadout that does not exist. (${target})`);

        Object.assign(target, preset);
        this.saveToFile();
        this.onupdate?.(loadoutPresets);
    },
    delete(preset: LoadoutPresetEntry | string) {
        if (typeof preset === "string") {
            const _loadout = this.get(preset);
            if (_loadout === null)
                throw new Error(`Tried deleting loadout that does not exist. (${preset})`);
            preset = _loadout;
        }

        if (!preset)
            throw new Error(`Tried deleting loadout that does not exist. (${preset})`);

        loadoutPresets.splice(loadoutPresets.indexOf(preset), 1);
        this.saveToFile();
        this.onupdate?.(loadoutPresets);
    },

    async loadFromFile() {
        const presets = await fs.readFile(loadoutPresetsFile, "utf8").then(c => JSON.parse(c), err => []).then(l => Array.isArray(l) ? l : []);
        loadoutPresets.splice(0, loadoutPresets.length, ...presets);
    },
    saveToFile() { return fs.writeFile(loadoutPresetsFile, JSON.stringify(loadoutPresets)) },

    async loadPreset(loadoutPreset: string | LoadoutPresetEntry) {
        if (typeof loadoutPreset === "string") {
            let savedLoadout = this.get(loadoutPreset);
            if (savedLoadout === null)
                throw new Error(`Tried loading loadout that does not exist. (${loadoutPreset})`);

            loadoutPreset = savedLoadout;
        }

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
    add(key: AutoLoadoutKey, value: string) {
        if (autoLoadouts.find(l => l.key === key))
            throw new Error(`Auto loadout with key ${key} already exists.`);

        autoLoadouts.push({ key, value });
        this.saveToFile();
        this.onupdate?.(autoLoadouts);
    },
    get(key: AutoLoadoutKey) {
        return autoLoadouts.find(l => l.key === key) ?? null;
    },
    getAll: () => structuredClone(autoLoadouts),
    exists(key: AutoLoadoutKey) {
        return autoLoadouts.some(l => l.key === key);
    },
    update(target: AutoLoadoutEntry | AutoLoadoutKey, value: string | null) {
        const name = typeof target === "string" ? target : target.key;
        if(this.exists(name)) {
            if(value !== null) {
                const _target = this.get(name)!;
                _target.value = value;
                this.saveToFile();
                this.onupdate?.(autoLoadouts);
            } else {
                this.delete(name);
            }
        } else {
            if(value !== null) {
                this.add(name, value);
            } 
        }
    },
    delete(target: AutoLoadoutEntry | AutoLoadoutKey) {
        if (typeof target === "string") {
            const _target = this.get(target);
            if (_target === null)
                throw new Error(`Tried deleting auto loadout that does not exist. (${target})`);
            target = _target;
        }

        if (!target)
            throw new Error(`Tried deleting auto loadout that does not exist. (${target})`);

        autoLoadouts.splice(autoLoadouts.indexOf(target), 1);
        this.saveToFile();
        this.onupdate?.(autoLoadouts);
    },

    async loadFromFile() {
        const presets = await fs.readFile(autoLoadoutFile, "utf8").then(c => JSON.parse(c), err => []).then(l => Array.isArray(l) ? l : []);
        autoLoadouts.splice(0, autoLoadouts.length, ...presets);
    },
    saveToFile() { return fs.writeFile(autoLoadoutFile, JSON.stringify(autoLoadouts)) }
};