import HasagiClient, { Hasagi, ChampSelectSession } from "@hasagi/extended";
import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { Client } from "./hasagi-client";
import { type Page } from "./pages/index";
import Configuration, { loadConfig } from "./configuration";
import MainProcessIpc from "./main-process";

// App context
export const DefaultAppContext = {
    config: Configuration.getFullConfig(),
    baseAppDirectoryPath: null! as string
}

export const AppContext = createContext(DefaultAppContext);

// Navigation context
export const DefaultNavigationContext = {
    page: "settings" as Page,
    setPage: null! as (page: Page) => void
}

export const NavigationContext = createContext(DefaultNavigationContext);

// League of Legends context
export const DefaultLoLContext = {
    state: "None" as "Lobby" | "InQueue" | "ChampSelect" | "InGame" | "PostGame" | "None",
    gameflowPhase: "None",
    isConnected: false,
    runePages: []
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
        Configuration.setUpdateCallback(config => setAppContext(ctx => ({ ...ctx, config })));
        console.log("called")
        loadConfig();
    }, []);

    const [navigationContext, setNavigationContext] = useState(DefaultNavigationContext);
    useEffect(() => {
        if (navigationContext.setPage === null)
            setNavigationContext(ctx => ({ ...ctx, setPage: (page) => setNavigationContext(ctx => ({ ...ctx, page })) }));
    }, [navigationContext.setPage]);

    const [lolContext, setLoLContext] = useState(DefaultLoLContext);
    useEffect(() => {
        Client.on("connection-state-change", (isConnected) => setLoLContext(ctx => ({ ...ctx, isConnected })));
        Client.on("disconnected", () => Client.connect());
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

        Client.connect();
    }, []);

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
                    {props.children}
                </LoLContext.Provider>
            </NavigationContext.Provider>
        </AppContext.Provider>
    );
}