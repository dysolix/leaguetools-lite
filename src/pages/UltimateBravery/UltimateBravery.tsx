import { useContext, useState } from "react";
import { Button, Section, Text, Toggle } from "../../components";
import { generateUltimateBraveryData } from "../../modules/ultimate-bravery";
import { getData } from "../../data";
import { AppContext } from "../../context";
import { Client } from "../../hasagi-client";
import { replaceLeagueToolsRunePage } from "../../util";

export default function UltimateBravery() {
    const appContext = useContext(AppContext);
    const [pageState, setPageState] = useState({
        forceMythic: true,
        forceBoots: true,
        forceSupportItem: true,
        autoLock: false
    });

    return (
        <div>
            <Section wide>
                <Button color="green" label="Generate" onClick={() => appContext.setUltimateBraveryData(generateUltimateBraveryData({ forceBoots: pageState.forceBoots, forceMythic: pageState.forceMythic, forceSupportItemIfSupport: pageState.forceSupportItem }))} />
                <Button title="Loads the generated runes (if a target rune page is present), summoner spells (if in champ select) and items (soon™)" color="green" disabled={appContext.ultimateBraveryData === null} label="Import" onClick={() => {
                    if (appContext.ultimateBraveryData === null)
                        return;

                    /*
                        {
                            "1": "SummonerBoost",
                            "3": "SummonerExhaust",
                            "4": "SummonerFlash",
                            "6": "SummonerHaste",
                            "7": "SummonerHeal",
                            "11": "SummonerSmite",
                            "12": "SummonerTeleport",
                            "14": "SummonerDot",
                            "21": "SummonerBarrier"
                        }
                    */

                    function getSpellIdByName(name: string) {
                        switch (name) {
                            case "SummonerBoost":
                                return 1;
                            case "SummonerExhaust":
                                return 3;
                            case "SummonerFlash":
                                return 4;
                            case "SummonerHaste":
                                return 6;
                            case "SummonerHeal":
                                return 7;
                            case "SummonerSmite":
                                return 11;
                            case "SummonerTeleport":
                                return 12;
                            case "SummonerDot":
                                return 14;
                            case "SummonerBarrier":
                                return 21;
                        }

                        return -1;
                    }

                    const spell1Id = getSpellIdByName(appContext.ultimateBraveryData.selectedSummonerSpells[0].id);
                    const spell2Id = getSpellIdByName(appContext.ultimateBraveryData.selectedSummonerSpells[1].id);

                    replaceLeagueToolsRunePage({
                        name: "Ultimate Bravery",
                        selectedPerkIds: appContext.ultimateBraveryData.selectedRunes.map(rune => rune.id),
                    });
                    Client.request({ method: "patch", url: "/lol-champ-select/v1/session/my-selection", data: { spell1Id, spell2Id } }).catch(() => { });
                }} />
                <Toggle label="Force Mythic" state={pageState.forceMythic} setState={s => setPageState(state => ({ ...state, forceMythic: s }))} />
                <Toggle label="Force Boots" state={pageState.forceBoots} setState={s => setPageState(state => ({ ...state, forceBoots: s }))} />
                <Toggle label="AutoLock" tooltip="Only enabled in full premade lobbys" disabled state={pageState.autoLock} setState={s => setPageState(state => ({ ...state, autoLock: s }))} />
            </Section>
            <Section wide forceMaxHeight>
                {appContext.ultimateBraveryData !== null ? (<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
                        <img style={{ height: "75px", width: "75px" }} src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${appContext.ultimateBraveryData.selectedChampion.key}.png`} title={appContext.ultimateBraveryData.selectedChampion.name} alt={appContext.ultimateBraveryData.selectedChampion.name} />
                        <img style={{ height: "75px", width: "75px" }} src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-career-stats/global/default/position_${appContext.ultimateBraveryData.selectedLane.toLowerCase()}.png`} alt={appContext.ultimateBraveryData.selectedLane[0] + appContext.ultimateBraveryData.selectedLane.substring(1).toLowerCase()} title={appContext.ultimateBraveryData.selectedLane[0] + appContext.ultimateBraveryData.selectedLane.substring(1).toLowerCase()} />
                        <div style={{ fontSize: "40px" }} title={appContext.ultimateBraveryData.abilityOrder.join(" > ")}>
                            <Text>{appContext.ultimateBraveryData.abilityOrder.join(" > ")}</Text>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-evenly", gap: "10px" }}>
                            {appContext.ultimateBraveryData.selectedSummonerSpells.map(spell => <img style={{ height: "75px", width: "75px" }} src={`http://ddragon.leagueoflegends.com/cdn/${getData().latestPatch}/img/spell/${spell.id}.png`} alt={spell.name} title={spell.name} />)}
                            {appContext.ultimateBraveryData.selectedLane === "JUNGLE" ? <img style={{ height: "75px", width: "75px" }} src={appContext.ultimateBraveryData.selectedJungleItem.icon} alt={appContext.ultimateBraveryData.selectedJungleItem.name} title={appContext.ultimateBraveryData.selectedJungleItem.name} /> : null}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }}>
                                {appContext.ultimateBraveryData.selectedRunes.slice(0, 4).map(rune => <img style={{ height: "50px", width: "50px" }} src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`} alt={rune.name} title={rune.name} />)}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }}>
                                {appContext.ultimateBraveryData.selectedRunes.slice(4, 6).map(rune => <img style={{ height: "50px", width: "50px" }} src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`} alt={rune.name} title={rune.name} />)}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }}>
                                {appContext.ultimateBraveryData.selectedRunes.slice(6, 9).map(rune => <img style={{ height: "50px", width: "50px" }} src={`https://ddragon.leagueoflegends.com/cdn/img/${getPathByStatPerkId(rune.id)}`} alt={getDisplayNameByStatPerkId(rune.id)} title={getDisplayNameByStatPerkId(rune.id)} />)}
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                                {appContext.ultimateBraveryData.selectedItems.slice(0, 2).map(item => <img style={{ height: "50px", width: "50px" }} src={item.icon} alt={item.name} title={item.name} />)}
                            </div>
                            <div style={{ display: "flex", flexDirection: "row", gap: "10px", paddingTop: "10px" }}>
                                {appContext.ultimateBraveryData.selectedItems.slice(2, 4).map(item => <img style={{ height: "50px", width: "50px" }} src={item.icon} alt={item.name} title={item.name} />)}
                            </div>
                            <div style={{ display: "flex", flexDirection: "row", gap: "10px", paddingTop: "10px" }}>
                                {appContext.ultimateBraveryData.selectedItems.slice(4, 6).map(item => <img style={{ height: "50px", width: "50px" }} src={item.icon} alt={item.name} title={item.name} />)}
                            </div>
                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", paddingTop: "10px" }}>
                                <img style={{ height: "50px", width: "50px" }} src={appContext.ultimateBraveryData.selectedTrinket.icon} alt={appContext.ultimateBraveryData.selectedTrinket.name} title={appContext.ultimateBraveryData.selectedTrinket.name} />
                            </div>
                        </div>
                    </div>
                </div>) : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "30px" }}>Click 'Generate' to start</div>}
            </Section>
        </div>
    );
}

// 5008 = Adaptive Force
// 5005 = Attack Speed
// 5007 = Ability Haste
// 5002 = Armor
// 5003 = Magic Resist
// 5001 = Health
function getPathByStatPerkId(id: number) {
    switch (id) {
        case 5008:
            return "perk-images/StatMods/StatModsAdaptiveForceIcon.png";
        case 5005:
            return "perk-images/StatMods/StatModsAttackSpeedIcon.png";
        case 5007:
            return "perk-images/StatMods/StatModsCDRScalingIcon.png";
        case 5002:
            return "perk-images/StatMods/StatModsArmorIcon.png";
        case 5003:
            return "perk-images/StatMods/StatModsMagicResIcon.png";
        case 5001:
            return "perk-images/StatMods/StatModsHealthScalingIcon.png";
    }

    return "Unknown";
}

function getDisplayNameByStatPerkId(id: number) {
    switch (id) {
        case 5008:
            return "Adaptive Force";
        case 5005:
            return "Attack Speed";
        case 5007:
            return "Ability Haste";
        case 5002:
            return "Armor";
        case 5003:
            return "Magic Resist";
        case 5001:
            return "Health";
    }

    return "Unknown";
}