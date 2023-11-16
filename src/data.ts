import { Collections } from "@hasagi/data";

export interface ILeagueData {
    champions: Collections.DDragonChampionCollection["entries"],
    runes: Collections.DDragonRuneCollection["entries"],
    summonerSpells: Collections.DDragonSummonerSpellCollection["entries"],
    items: Collections.MerakiItemCollection["entries"],
    patch: string
}

export class LeagueData {
    private _champions: Collections.DDragonChampionCollection["entries"];
    private _runes: Collections.DDragonRuneCollection["entries"];
    private _summonerSpells: Collections.DDragonSummonerSpellCollection["entries"];
    private _items: Collections.MerakiItemCollection["entries"];
    public latestPatch: string;

    public get champions() {
        return new Collections.DDragonChampionCollection(structuredClone(this._champions));
    }

    public get runes() {
        return new Collections.DDragonRuneCollection(structuredClone(this._runes));
    }

    public get summonerSpells() {
        return new Collections.DDragonSummonerSpellCollection(structuredClone(this._summonerSpells));
    }

    public get items() {
        return new Collections.MerakiItemCollection(structuredClone(this._items));
    }

    public constructor(data: ILeagueData) {
        this._champions = data.champions;
        this._runes = data.runes;
        this._summonerSpells = data.summonerSpells;
        this._items = data.items;
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

declare global {
    interface Window {
        loadedLeagueData: ILeagueData
    }
}

const _data: LeagueData = new LeagueData(window.loadedLeagueData);

export function getData() {
    return _data; 
}