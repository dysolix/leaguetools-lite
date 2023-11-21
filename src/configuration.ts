import path from "path";
import fs from "fs/promises";

const getConfigPath = () => path.join(window.basePath, "config.json")

const _Configuration = {
    schemaVersion: 1,

    startInSystemTray: false,
    minimizeToSystemTray: false,
    launchOnSystemStartup: false,

    runeImportPrefix: "[LT]",
    enableAutomaticRuneImport: false,

    enableDefaultSkinAlert: false,

    enableAutomaticLoadoutImport: false,
    disableAutomaticLoadoutImportOnPBE: true,

    developerMode: false,

    theme: "black/red",

    lockfilePath: null as string | null,
}

let updateCallback = null as ((config: ConfigType) => void) | null;

const Configuration = {
    set<K extends keyof typeof _Configuration, V extends (typeof _Configuration)[K]>(key: K, value: V): void {
        _Configuration[key] = value;
        saveConfig();
        
        if(updateCallback)
            updateCallback(_Configuration);
    },

    get<K extends keyof typeof _Configuration, V extends (typeof _Configuration)[K]>(key: K): V {
        return _Configuration[key] as any;
    },

    async load(config: Partial<ConfigType> & { [key: string]: any }) {
        const verifiedConfig = upgradeConfig(config) as ConfigType & { [key: string]: any };

        for (const key in verifiedConfig) {
            if (Object.hasOwn(_Configuration, key))
                Object.defineProperty(_Configuration, key, { value: verifiedConfig[key] })
        }

        if(updateCallback)
            updateCallback(_Configuration);
    },

    getFullConfig(): ConfigType {
        return { ..._Configuration };
    },

    setUpdateCallback(callback: (config: ConfigType) => void) {
        updateCallback = callback;
    }
}

export type ConfigType = typeof _Configuration;
export default Configuration;


function upgradeConfig(config: Partial<ConfigType>) {
    switch (config.schemaVersion) {
        case 1:
        default:
            config.schemaVersion = 1;
            return config;
    }
}

export async function loadConfig() {
    try {
        const config = await fs.readFile(getConfigPath(), { encoding: "utf-8" }).then(JSON.parse) as Partial<ConfigType>;
        Configuration.load(config);
    } catch (e) {
        saveConfig();
    }
}

async function saveConfig() {
    await fs.writeFile(getConfigPath(), JSON.stringify(_Configuration, null, 2), { encoding: "utf-8" });
}