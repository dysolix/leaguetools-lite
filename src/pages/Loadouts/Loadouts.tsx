import { useContext, useEffect, useState } from "react";
import { Button, DropdownList, Section, TextInput, Toggle } from "../../components";
import { ModuleContext } from "../../context";
import { Client } from "../../hasagi-client";
import { LoadoutPresetEntry, AutoLoadout, LoadoutPreset } from "../../manager/loadout-manager";

export default function Emotes() {
    const moduleContext = useContext(ModuleContext);
    const [pageState, setPageState] = useState({
        saveAsInputValue: "",
        saveAsInputValid: true,
        includeProfileIcon: false,
        includeWard: false,
        includeEmotes: false,
        includeTFTMap: false,
        includeTFTBoom: false,
        includeLittleLegend: false,
        selectedSavedLoadout: "" as string,

        blockWriteActions: false,
        blockLoading: false
    });

    useEffect(() => {
        if (moduleContext.loadoutPresets && moduleContext.loadoutPresets.length !== 0 && pageState.selectedSavedLoadout === "") {
            setPageState(pageState => { return { ...pageState, selectedSavedLoadout: moduleContext.loadoutPresets[0].name } })
        } else if ((!moduleContext.loadoutPresets || moduleContext.loadoutPresets.length === 0) && pageState.selectedSavedLoadout !== "") {
            setPageState(pageState => { return { ...pageState, selectedSavedLoadout: "" } })
        }
    }, [moduleContext.loadoutPresets, pageState.selectedSavedLoadout]);

    return (
        <div>
            <Section>
                <TextInput placeholder="Name" value={pageState.saveAsInputValue} valid={pageState.saveAsInputValid} onChange={ev => {
                    const value = ev.target.value;
                    let isValid = true;
                    if (value.trim().length > 32 || value.trim().length === 0)
                        isValid = false;
                    else if (LoadoutPreset.exists(value))
                        isValid = false;

                    setPageState({ ...pageState, saveAsInputValue: value, saveAsInputValid: isValid });
                }} />
            </Section>
            <Section>
                <Toggle label="Include profile icon" state={pageState.includeProfileIcon} setState={state => setPageState({ ...pageState, includeProfileIcon: state })} />
                <Toggle label="Include emotes" state={pageState.includeEmotes} setState={state => setPageState({ ...pageState, includeEmotes: state })} />
                <Toggle label="Include ward skin" state={pageState.includeWard} setState={state => setPageState({ ...pageState, includeWard: state })} />
                <Toggle label="Include Little Legend" state={pageState.includeLittleLegend} setState={state => setPageState({ ...pageState, includeLittleLegend: state })} />
                <Toggle label="Include TFT Arena" state={pageState.includeTFTMap} setState={state => setPageState({ ...pageState, includeTFTMap: state })} />
                <Toggle label="Include TFT Boom" state={pageState.includeTFTBoom} setState={state => setPageState({ ...pageState, includeTFTBoom: state })} />
            </Section>
            <Section>
                <Button disabled={pageState.blockWriteActions} label="Create loadout preset" color="primary" onClick={async () => {
                    if (pageState.blockWriteActions)
                        return;

                    const name = pageState.saveAsInputValue;
                    if (name === "")
                        return;
                    else if (name.length > 32)
                        return;
                    else if (LoadoutPreset.exists(name))
                        return;

                    setPageState(pageState => { return { ...pageState, blockWriteActions: true } })

                    await Client.Inventory.getAccountLoadout().then(async currentLoadout => {
                        var loadoutPreset: LoadoutPresetEntry = {
                            name
                        }

                        if (pageState.includeEmotes) {
                            loadoutPreset.emotes = {
                                EMOTES_WHEEL_LOWER: currentLoadout.loadout.EMOTES_WHEEL_LOWER,
                                EMOTES_WHEEL_LEFT: currentLoadout.loadout.EMOTES_WHEEL_LEFT,
                                EMOTES_WHEEL_UPPER: currentLoadout.loadout.EMOTES_WHEEL_UPPER,
                                EMOTES_WHEEL_RIGHT: currentLoadout.loadout.EMOTES_WHEEL_RIGHT,
                                EMOTES_WHEEL_CENTER: currentLoadout.loadout.EMOTES_WHEEL_CENTER,
                                EMOTES_WHEEL_LOWER_LEFT: currentLoadout.loadout.EMOTES_WHEEL_LOWER_LEFT,
                                EMOTES_WHEEL_LOWER_RIGHT: currentLoadout.loadout.EMOTES_WHEEL_LOWER_RIGHT,
                                EMOTES_WHEEL_UPPER_LEFT: currentLoadout.loadout.EMOTES_WHEEL_UPPER_LEFT,
                                EMOTES_WHEEL_UPPER_RIGHT: currentLoadout.loadout.EMOTES_WHEEL_UPPER_RIGHT,
                                EMOTES_START: currentLoadout.loadout.EMOTES_START,
                                EMOTES_FIRST_BLOOD: currentLoadout.loadout.EMOTES_FIRST_BLOOD,
                                EMOTES_ACE: currentLoadout.loadout.EMOTES_ACE,
                                EMOTES_VICTORY: currentLoadout.loadout.EMOTES_VICTORY
                            } as any
                        }

                        if (pageState.includeWard)
                            loadoutPreset.ward = currentLoadout.loadout.WARD_SKIN_SLOT as any;

                        if (pageState.includeLittleLegend)
                            loadoutPreset.tacticianId = currentLoadout.loadout.COMPANION_SLOT.itemId;

                        if (pageState.includeTFTMap)
                            loadoutPreset.tftArenaId = currentLoadout.loadout.TFT_MAP_SKIN_SLOT.itemId;

                        if (pageState.includeTFTBoom)
                            loadoutPreset.tftBoomId = currentLoadout.loadout.TFT_DAMAGE_SKIN_SLOT.itemId;

                        if (pageState.includeProfileIcon)
                            loadoutPreset.profileIconId = await Client.getLocalSummoner().then(s => s.profileIconId);

                        await LoadoutPreset.set(loadoutPreset.name, loadoutPreset);
                    })

                    setPageState(pageState => { return { ...pageState, blockWriteActions: false, saveAsInputValue: "", saveAsInputValid: true } })
                }} />
            </Section>
            <Section>
                <DropdownList label="Loadout preset" disabled={moduleContext.loadoutPresets === null || moduleContext.loadoutPresets.length === 0} value={pageState.selectedSavedLoadout} onChange={ev => setPageState(pageState => { return { ...pageState, selectedSavedLoadout: ev.target.value } })}>
                    {moduleContext.loadoutPresets !== null && moduleContext.loadoutPresets.length !== 0 ?
                        moduleContext.loadoutPresets.sort((s1, s2) => s1.name.localeCompare(s2.name)).map(loadout => <option key={loadout.name} value={loadout.name}>{loadout.name}</option>)
                        :
                        <option value={""}>{moduleContext.loadoutPresets === null ? "Loading..." : "None"}</option>}
                </DropdownList>
                <Button label="Load" disabled={pageState.selectedSavedLoadout === "" || pageState.blockLoading} wide color="primary" onClick={async () => {
                    if(pageState.blockLoading)
                        return;

                    const savedLoadout = LoadoutPreset.get(pageState.selectedSavedLoadout!);
                    if (!savedLoadout)
                        return;

                    setPageState(pageState => { return { ...pageState, blockLoading: true } })
                    await LoadoutPreset.loadPreset(savedLoadout);
                    setPageState(pageState => { return { ...pageState, blockLoading: false } })
                }} />
                <Button label="Replace" disabled={pageState.selectedSavedLoadout === "" || pageState.blockWriteActions} title="Replace the selected loadout preset" wide color="caution" onClick={async () => {
                    if(pageState.selectedSavedLoadout === "")
                        return;

                    if(pageState.blockWriteActions)
                        return;

                    setPageState(pageState => { return { ...pageState, blockWriteActions: true } })

                    await Client.Inventory.getAccountLoadout().then(async currentLoadout => {
                        const loadoutPreset = LoadoutPreset.get(pageState.selectedSavedLoadout!)!;
                        if(!loadoutPreset)
                            return;

                        if (pageState.includeEmotes) {
                            loadoutPreset.emotes = {
                                EMOTES_WHEEL_LOWER: currentLoadout.loadout.EMOTES_WHEEL_LOWER,
                                EMOTES_WHEEL_LEFT: currentLoadout.loadout.EMOTES_WHEEL_LEFT,
                                EMOTES_WHEEL_UPPER: currentLoadout.loadout.EMOTES_WHEEL_UPPER,
                                EMOTES_WHEEL_RIGHT: currentLoadout.loadout.EMOTES_WHEEL_RIGHT,
                                EMOTES_WHEEL_CENTER: currentLoadout.loadout.EMOTES_WHEEL_CENTER,
                                EMOTES_WHEEL_LOWER_LEFT: currentLoadout.loadout.EMOTES_WHEEL_LOWER_LEFT,
                                EMOTES_WHEEL_LOWER_RIGHT: currentLoadout.loadout.EMOTES_WHEEL_LOWER_RIGHT,
                                EMOTES_WHEEL_UPPER_LEFT: currentLoadout.loadout.EMOTES_WHEEL_UPPER_LEFT,
                                EMOTES_WHEEL_UPPER_RIGHT: currentLoadout.loadout.EMOTES_WHEEL_UPPER_RIGHT,
                                EMOTES_START: currentLoadout.loadout.EMOTES_START,
                                EMOTES_FIRST_BLOOD: currentLoadout.loadout.EMOTES_FIRST_BLOOD,
                                EMOTES_ACE: currentLoadout.loadout.EMOTES_ACE,
                                EMOTES_VICTORY: currentLoadout.loadout.EMOTES_VICTORY
                            } as any
                        } else
                            delete loadoutPreset.emotes;

                        if (pageState.includeWard)
                            loadoutPreset.ward = currentLoadout.loadout.WARD_SKIN_SLOT as any;
                        else
                            delete loadoutPreset.ward;

                        if (pageState.includeLittleLegend)
                            loadoutPreset.tacticianId = currentLoadout.loadout.COMPANION_SLOT.itemId;
                        else
                            delete loadoutPreset.tacticianId;

                        if (pageState.includeTFTMap)
                            loadoutPreset.tftArenaId = currentLoadout.loadout.TFT_MAP_SKIN_SLOT.itemId;
                        else
                            delete loadoutPreset.tftArenaId;

                        if (pageState.includeTFTBoom)
                            loadoutPreset.tftBoomId = currentLoadout.loadout.TFT_DAMAGE_SKIN_SLOT.itemId;
                        else
                            delete loadoutPreset.tftBoomId;

                        if (pageState.includeProfileIcon)
                            loadoutPreset.profileIconId = await Client.getLocalSummoner().then(s => s.profileIconId);
                        else
                            delete loadoutPreset.profileIconId;

                        LoadoutPreset.set(loadoutPreset.name, loadoutPreset);
                    })

                    setPageState(pageState => { return { ...pageState, blockWriteActions: false } })
                }} />
                <Button label="Delete" disabled={pageState.selectedSavedLoadout === "" || pageState.blockWriteActions} wide color="caution" onClick={async () => {
                    if(pageState.selectedSavedLoadout === "")
                        return;

                    if(pageState.blockWriteActions)
                        return;

                    setPageState(pageState => { return { ...pageState, blockWriteActions: true } })
                    await LoadoutPreset.set(pageState.selectedSavedLoadout!, null);
                    setPageState(pageState => { return { ...pageState, blockWriteActions: false } })
                }} />
            </Section>
        </div>
    )
}