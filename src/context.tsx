import HasagiClient, { Hasagi, ChampSelectSession } from "@hasagi/extended";
import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { Client } from "./hasagi-client";
import { type Page } from "./pages/index";
import Configuration, { type ConfigType, loadConfig } from "./configuration";
import { LeagueData, getData, loadData } from "./data";
import { generateUltimateBraveryData } from "./modules/ultimate-bravery";
import MainProcessIpc from "./main-process";
import { delay, setBasePath } from "./util";
import os from "os"
import { ColorTheme, getAllThemes } from "./manager/theme-manager";
import { LoadoutPresetEntry, AutoLoadout, LoadoutPreset, AutoLoadoutEntry } from "./manager/loadout-manager";
import { AutoRuneEntry, AutoRunes, RunePages, SavedRunePage } from "./manager/rune-manager";
import path from "path";
import { checkForUpdates } from "./updater";

// App context
export const DefaultAppContext = {
    ready: false,
    basePath: null! as string,
    config: null! as ConfigType,
    data: null! as LeagueData,
    themes: null! as ColorTheme[],
    updateInfo: null as { version: string, url: string } | null,
}

// Module context
export const DefaultModuleContext = {
    ultimateBraveryData: null! as ReturnType<typeof generateUltimateBraveryData>,
    setUltimateBraveryData: null! as (data: ReturnType<typeof generateUltimateBraveryData>) => void,

    loadoutPresets: null! as Array<LoadoutPresetEntry>,
    autoLoadouts: null! as Array<AutoLoadoutEntry>,

    savedRunePages: null! as Array<SavedRunePage>,
    autoRuneEntries: null! as Array<AutoRuneEntry>,
}

export const ModuleContext = createContext(DefaultModuleContext);

export const AppContext = createContext(DefaultAppContext);

// Navigation context
export const DefaultNavigationContext = {
    page: "Runes" as Page,
    setPage: null! as (page: Page) => void
}

export const NavigationContext = createContext(DefaultNavigationContext);

// League of Legends context
export const DefaultLoLContext = {
    state: "None" as "Lobby" | "InQueue" | "ChampSelect" | "InGame" | "PostGame" | "None",
    gameflowPhase: "None",
    isConnected: false,
    runePages: [],
} as {
    isConnected: boolean, runePages: ReadonlyArray<Hasagi.RunePage>,
    gameflowPhase: Hasagi.GameflowPhase, liveClientData?: Awaited<ReturnType<HasagiClient["LiveClient"]["getLiveClientData"]>>,
    lobby?: Hasagi.Lobby, queueState?: Hasagi.QueueState,
    champSelectSession?: ChampSelectSession, endOfGameStats?: Hasagi.EndOfGameData
} & (
        { state: "None" } |
        { state: "Lobby", lobby: Hasagi.Lobby } |
        { state: "InQueue", lobby: Hasagi.Lobby, queueState: Hasagi.QueueState } |
        { state: "ChampSelect", lobby: Hasagi.Lobby, champSelectSession: ChampSelectSession } |
        { state: "InGame", lobby: Hasagi.Lobby, liveClientData: Awaited<ReturnType<HasagiClient["LiveClient"]["getLiveClientData"]>> } |
        { state: "PostGame", lobby: Hasagi.Lobby, endOfGameStats: Hasagi.EndOfGameData }
    )

export const LoLContext = createContext(DefaultLoLContext);

export function ContextProviders(props: PropsWithChildren) {
    const [appContext, setAppContext] = useState(DefaultAppContext);
    useEffect(() => {
        if (appContext.themes === null) {
            getAllThemes().then(themes => setAppContext(ctx => ({ ...ctx, themes })))
            Configuration.setUpdateCallback(config => setAppContext(ctx => ({ ...ctx, config })));
            MainProcessIpc.getBasePath().then((basePath) => {
                window.basePath = basePath;
                setBasePath(basePath);
                setAppContext(ctx => ({ ...ctx, basePath }))
                loadConfig().then(() => setAppContext(ctx => ({ ...ctx, config: Configuration.getFullConfig() }))).then(async () => {
                    while (true) {
                        console.debug("Checking for updates...")
                        if (!Configuration.get("enableAutoUpdater")){
                            await delay(60000);
                            continue;
                        }
    
                        const updateInfo = await checkForUpdates();
                        if (!updateInfo){
                            await delay(60000);
                            continue;
                        }
    
                        setAppContext(ctx => ({ ...ctx, updateInfo }));
                        break;
                    }
                })
                loadData().then(() => setAppContext(ctx => ({ ...ctx, data: getData() })))
            })
        }
    }, [appContext.themes]);

    const [moduleContext, setModuleContext] = useState(DefaultModuleContext);
    useEffect(() => {
        if (moduleContext.autoLoadouts === null || moduleContext.loadoutPresets === null || moduleContext.setUltimateBraveryData === null) {
            setModuleContext(ctx => ({
                ...ctx,
                setUltimateBraveryData: (data) => setModuleContext(c => ({ ...c, ultimateBraveryData: data })),
                autoLoadouts: AutoLoadout.getAll(),
                loadoutPresets: LoadoutPreset.getAll(),
                autoRuneEntries: AutoRunes.getAll(),
                savedRunePages: RunePages.getAll()
            }));

            RunePages.onupdate = savedRunePages => setModuleContext(ctx => ({ ...ctx, savedRunePages }));
            AutoRunes.onupdate = autoRuneEntries => setModuleContext(ctx => ({ ...ctx, autoRuneEntries }));

            AutoLoadout.onupdate = autoLoadouts => setModuleContext(ctx => ({ ...ctx, autoLoadouts }));
            LoadoutPreset.onupdate = loadoutPresets => setModuleContext(ctx => ({ ...ctx, loadoutPresets }));
        }
    }, [moduleContext.autoLoadouts, moduleContext.loadoutPresets, moduleContext.setUltimateBraveryData]);

    useEffect(() => {
        if (appContext.basePath !== null && appContext.config !== null && appContext.data !== null && appContext.themes !== null)
            setAppContext(ctx => ({ ...ctx, ready: true }))
    }, [appContext.basePath, appContext.config, appContext.data, appContext.themes])

    const [navigationContext, setNavigationContext] = useState(DefaultNavigationContext);
    useEffect(() => {
        if (navigationContext.setPage === null)
            setNavigationContext(ctx => ({ ...ctx, setPage: (page) => setNavigationContext(ctx => ({ ...ctx, page })) }));
    }, [navigationContext.setPage]);

    const [lolContext, setLoLContext] = useState(DefaultLoLContext);
    useEffect(() => {
        Client.on("connection-state-change", (isConnected) => setLoLContext(ctx => ({ ...ctx, isConnected })));
        Client.on("rune-pages-update", (runePages) => setLoLContext(ctx => ({ ...ctx, runePages: runePages.filter(r => r.isEditable) })));

        Client.on("lobby-update", lobby => {
            if (lobby)
                setLoLContext(ctx => ({ ...ctx, lobby }));
        });

        Client.on("queue-state-update", queueState => {
            if (queueState) {
                setLoLContext(ctx => ({ ...ctx, queueState }));
            } else {
                setLoLContext(ctx => ({ ...ctx } as any));
            }
        });

        Client.on("champ-select-session-update", champSelectSession => {
            if (champSelectSession) {
                setLoLContext(ctx => ({ ...ctx, champSelectSession }));
            } else {
                setLoLContext(ctx => ({ ...ctx } as any));
            }
        });

        Client.on("gameflow-phase-update", phase => {
            setLoLContext(ctx => ({ ...ctx, gameflowPhase: phase }));
        });

        Client.on("end-of-game-data-received", endOfGameStats => {
            setLoLContext(ctx => ({ ...ctx, endOfGameStats }));
        });
    }, []);

    useEffect(() => {
        if (!appContext.config || appContext.ready)
            return;

        const lockfilePath = appContext.config.lockfilePath ?? process.env["LEAGUE_TOOLS_LOCKFILE_PATH"] ?? null;
        if (lockfilePath && path.isAbsolute(lockfilePath)) {
            console.log("lockfile");
            Client.connect({ authenticationStrategy: "lockfile", lockfile: lockfilePath });
            Client.on("disconnected", () => Client.connect({ authenticationStrategy: "lockfile", lockfile: lockfilePath }));
        } else {
            Client.connect();
            Client.on("disconnected", () => Client.connect());
        }
    }, [appContext.ready, appContext.config])

    useEffect(() => {
        if (lolContext.gameflowPhase === "None" && lolContext.state !== "None") {
            setLoLContext(ctx => {
                const context = structuredClone(ctx);
                context.state = "None";
                delete context.lobby;
                delete context.queueState;
                delete context.champSelectSession;
                delete context.liveClientData;
                delete context.endOfGameStats;
                return context;
            });
        } else if (lolContext.gameflowPhase === "Lobby" && lolContext.state !== "Lobby") {
            if (lolContext.lobby !== undefined)
                setLoLContext(ctx => {
                    const context = structuredClone(ctx);
                    context.state = "Lobby";
                    context.lobby = ctx.lobby!;
                    delete context.queueState;
                    delete context.champSelectSession;
                    delete context.liveClientData;
                    delete context.endOfGameStats;
                    return context;
                });
        } else if (lolContext.gameflowPhase === "Matchmaking" && lolContext.state !== "InQueue") {
            if (lolContext.lobby !== undefined && lolContext.queueState !== undefined)
                setLoLContext(ctx => {
                    const context = structuredClone(ctx);
                    context.state = "InQueue";
                    context.lobby = ctx.lobby!;
                    context.queueState = ctx.queueState!;
                    delete context.champSelectSession;
                    delete context.liveClientData;
                    delete context.endOfGameStats;
                    return context;
                });
        } else if (lolContext.gameflowPhase === "ChampSelect" && lolContext.state !== "ChampSelect") {
            if (lolContext.lobby !== undefined && lolContext.champSelectSession !== undefined)
                setLoLContext(ctx => {
                    const context = structuredClone(ctx);
                    context.state = "ChampSelect";
                    context.lobby = ctx.lobby!;
                    context.champSelectSession = ctx.champSelectSession!;
                    delete context.queueState;
                    delete context.liveClientData;
                    delete context.endOfGameStats;
                    return context;
                });
        } else if (lolContext.gameflowPhase === "InProgress" && lolContext.state !== "InGame") {
            if (lolContext.lobby !== undefined && lolContext.liveClientData !== undefined)
                setLoLContext(ctx => {
                    const context = structuredClone(ctx);
                    context.state = "InGame";
                    context.lobby = ctx.lobby!;
                    context.liveClientData = ctx.liveClientData!;
                    delete context.queueState;
                    delete context.champSelectSession;
                    delete context.endOfGameStats;
                    return context;
                });
        } else if (lolContext.gameflowPhase === "EndOfGame" && lolContext.state !== "PostGame") {
            if (lolContext.lobby !== undefined && lolContext.endOfGameStats !== undefined)
                setLoLContext(ctx => {
                    const context = structuredClone(ctx);
                    context.state = "PostGame";
                    context.lobby = ctx.lobby!;
                    context.endOfGameStats = ctx.endOfGameStats!;
                    delete context.queueState;
                    delete context.champSelectSession;
                    delete context.liveClientData;
                    return context;
                });
        }
    }, [lolContext.champSelectSession, lolContext.endOfGameStats, lolContext.gameflowPhase, lolContext.liveClientData, lolContext.lobby, lolContext.queueState, lolContext.state])

    return (
        <AppContext.Provider value={appContext}>
            <NavigationContext.Provider value={navigationContext}>
                <LoLContext.Provider value={lolContext}>
                    <ModuleContext.Provider value={moduleContext}>
                        {props.children}
                    </ModuleContext.Provider>
                </LoLContext.Provider>
            </NavigationContext.Provider>
        </AppContext.Provider>
    );
}