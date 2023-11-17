import { Collections, DataDragon, MerakiAnalytics } from "@hasagi/data";
import path from "path";
import fs from "fs/promises";
import { getBasePath } from "./util";
export interface ILeagueData {
    champions: Collections.DDragonChampionCollection["entries"],
    runes: Collections.DDragonRuneCollection["entries"],
    summonerSpells: Collections.DDragonSummonerSpellCollection["entries"],
    items: Collections.MerakiItemCollection["entries"],
    patch: string
}

export class LeagueData {
    private _champions: Collections.DDragonChampionCollection;
    private _runes: Collections.DDragonRuneCollection;
    private _summonerSpells: Collections.DDragonSummonerSpellCollection;
    private _items: Collections.MerakiItemCollection;
    public latestPatch: string;

    public get champions() {
        return this._champions.clone();
    }

    public get runes() {
        return this._runes.clone();
    }

    public get summonerSpells() {
        return this._summonerSpells.clone();
    }

    public get items() {
        return this._items.clone();
    }

    public constructor(data: ILeagueData) {
        console.log(data);
        this._champions = new Collections.DDragonChampionCollection(data.champions as any);
        this._runes = new Collections.DDragonRuneCollection(data.runes as any);
        this._summonerSpells = new Collections.DDragonSummonerSpellCollection(data.summonerSpells as any);
        this._items = new Collections.MerakiItemCollection(data.items as any);
        this.latestPatch = data.patch;
    }

    toJSON() {
        return {
            champions: this.champions,
            runes: this.runes,
            summonerSpells: this.summonerSpells,
            items: this.items,
            patch: this.latestPatch
        }
    }
}

let _data: LeagueData;

export async function loadData() {
    const latestPatch = await DataDragon.getLatestPatch("euw");

    try {
        const data = await fs.readFile(path.join(getBasePath(), "./data.json"), "utf-8").then(JSON.parse);
        if (data.patch !== latestPatch)
            throw new Error();

        if (data.champions === undefined)
            throw new Error();

        if (data.runes === undefined)
            throw new Error();

        if (data.summonerSpells === undefined)
            throw new Error();

        if (data.items === undefined)
            throw new Error();

        _data = new LeagueData(data);

    } catch (e) {
        const downloadedData = {
            patch: latestPatch,
            champions: await DataDragon.getChampions(latestPatch).then(d => Object.fromEntries(d.entries.entries())),
            runes: await DataDragon.getRunes(latestPatch).then(d => Object.fromEntries(d.entries.entries())),
            summonerSpells: await DataDragon.getSummonerSpells(latestPatch).then(d => Object.fromEntries(d.entries.entries())),
            items: await MerakiAnalytics.getItems().then(d => Object.fromEntries(d.entries.entries()))
        }

        _data = new LeagueData(downloadedData as any);
        await fs.writeFile(path.join(getBasePath(), "./data.json"), JSON.stringify(downloadedData));
    }
}

export function getData() {
    return _data;
}