import { DataTypes } from "@hasagi/data"
import crypto from "crypto";
import { getData } from "../data";

type Lanes = "TOP" | "JUNGLE" | "MID" | "BOTTOM" | "SUPPORT";

type UltimateBraveryConfig = {
    lanes?: Lanes[],
    forceSmiteIfJungle?: boolean,
    forceJungleItemIfJungle?: boolean,
    forceBoots?: boolean,
    forceSupportItemIfSupport?: boolean,
    forceMythic?: boolean,
}

export function generateUltimateBraveryData(config?: UltimateBraveryConfig) {
    const abilities = ["Q", "W", "E"];
    const lanes = config?.lanes ?? ["TOP", "JUNGLE", "MID", "BOTTOM", "SUPPORT"];
    const forceSmiteIfJungle = config?.forceSmiteIfJungle ?? true;
    const forceBoots = config?.forceBoots ?? true;
    const forceSupportItemIfSupport = config?.forceSupportItemIfSupport ?? true;
    const forceMythic = config?.forceMythic ?? true;

    const data = getData(); 
    const items = data.items;

    const summonerSpells = data.summonerSpells.values().filter(spell => spell.modes.includes("CLASSIC"));
    const boots = items.values().filter(item => item.maps?.includes(11) && item.rank.includes("BOOTS") && item.buildsInto.length === 0);
    const mythics = items.values().filter(item => item.maps?.includes(11) && item.rank.includes("MYTHIC") && item.shop.purchasable);
    const itemPool = items.values().filter(item => item.maps?.includes(11) && item.rank.includes("LEGENDARY") && item.shop.purchasable);
    const jungleItems = items.values().filter(item => item.maps?.includes(11) && item.nicknames.includes("jungle") && item.shop.purchasable);
    const supportItems = items.values().filter(item => item.maps?.includes(11) && [3850, 3854, 3858, 3862].includes(item.id));
    const trinkets = items.values().filter(item => item.maps?.includes(11) && [3340, 3364, 3363].includes(item.id));

    const selectedLane = lanes[randomInt(0, lanes.length)];
    const selectedItems: DataTypes.XMerakiAnalytics.Item[] = [];
    const selectedSummonerSpells: DataTypes.DataDragon.SummonerSpell[] = [];
    const selectedChampion = data.champions.values()[randomInt(0, data.champions.values().length)];
    const selectedTrinket = trinkets[randomInt(0, trinkets.length)];
    const selectedJungleItem = jungleItems[randomInt(0, jungleItems.length)];
    const abilityOrder = abilities.sort(() => Math.random() - 0.5).sort(() => Math.random() - 0.5).sort(() => Math.random() - 0.5);
    const selectedRuneTrees: DataTypes.DataDragon.RuneTree[] = [];
    const selectedRunes: DataTypes.DataDragon.Rune[] = [];

    if(!forceBoots) {
        itemPool.push(...boots);
    }

    if(!forceMythic) {
        itemPool.push(...mythics);
    }

    if(!forceSupportItemIfSupport) {
        itemPool.push(...supportItems);
    }

    while (selectedRuneTrees.length < 2) {
        const tree = data.runes.values()[randomInt(0, data.runes.values().length)];
        if (!selectedRuneTrees.includes(tree)) {
            selectedRuneTrees.push(tree);
        }
    }

    let tree = selectedRuneTrees[0];
    tree.slots.forEach(slot => {
        const rune = slot.runes[randomInt(0, slot.runes.length)];
        if (!selectedRunes.includes(rune)) {
            selectedRunes.push(rune);
        }
    });

    tree = selectedRuneTrees[1];
    const s1 = tree.slots[randomInt(1, tree.slots.length)];
    let s2 = tree.slots[randomInt(1, tree.slots.length)];
    while (s2 === s1) {
        s2 = tree.slots[randomInt(1, tree.slots.length)];
    }

    // 5008 = Adaptive Force
    // 5005 = Attack Speed
    // 5007 = Ability Haste
    // 5002 = Armor
    // 5003 = Magic Resist
    // 5001 = Health

    selectedRunes.push(s1.runes[randomInt(0, s1.runes.length)]);
    selectedRunes.push(s2.runes[randomInt(0, s2.runes.length)]);

    const m1 = [5008, 5005, 5007];
    const m2 = [5008, 5002, 5003];
    const m3 = [5002, 5003, 5001];

    selectedRunes.push({ id: m1[randomInt(0, m1.length)] } as any);
    selectedRunes.push({ id: m2[randomInt(0, m2.length)] } as any);
    selectedRunes.push({ id: m3[randomInt(0, m3.length)] } as any);

    while (selectedItems.length < 6) {
        if (forceSupportItemIfSupport && selectedLane === "SUPPORT" && !selectedItems.some(i => supportItems.includes(i))) {
            const item = supportItems[randomInt(0, supportItems.length)];
            selectedItems.push(item);
            continue;
        }

        if (forceMythic && !selectedItems.some(i => mythics.includes(i))) {
            const item = mythics[randomInt(0, mythics.length)];
            selectedItems.push(item);
            continue;
        }

        if (forceBoots && !selectedItems.some(i => boots.includes(i))) {
            const item = boots[randomInt(0, boots.length)];
            selectedItems.push(item);
            continue;
        }

        const availableItems = itemPool.filter(i => {
            if(selectedItems.includes(i)) return false;
            if(i.passives.some(p => p.unique && selectedItems.some(ii => ii.passives.some(pp => pp.unique && pp.name === p.name)))) return false;
            if(selectedItems.some(ii => ii.rank.includes("MYTHIC")) && i.rank.includes("MYTHIC")) return false;
            if(selectedItems.some(ii => ii.rank.includes("BOOTS")) && i.rank.includes("BOOTS")) return false;
            if(selectedLane !== "SUPPORT" && supportItems.includes(i)) return false;
            if(selectedItems.some(ii => supportItems.includes(ii)) && supportItems.includes(i)) return false;

            return true;
        });

        const i = availableItems[randomInt(0, availableItems.length)];
        if(i.id === 4643 && !selectedItems.some(i => supportItems.includes(i))) continue;
        selectedItems.push(i);
    }

    while (selectedSummonerSpells.length < 2) {
        if (forceSmiteIfJungle && selectedLane === "JUNGLE" && !selectedSummonerSpells.some(s => s.id === "SummonerSmite")) {
            selectedSummonerSpells.push(summonerSpells.find(s => s.id === "SummonerSmite")!);
            continue;
        }

        const spell = summonerSpells[randomInt(0, summonerSpells.length)];
        if (!selectedSummonerSpells.includes(spell)) {
            selectedSummonerSpells.push(spell);
        }
    }

    return {
        selectedLane,
        selectedChampion,
        abilityOrder,
        selectedItems,
        selectedTrinket,
        selectedSummonerSpells,
        selectedRunes,
        selectedJungleItem
    }
}

function randomInt(min: number, max: number) {
    return crypto.randomInt(min, max);
}