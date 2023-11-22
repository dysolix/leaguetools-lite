import { useContext, useEffect, useState } from "react";
import { DropdownList, Section, Toggle } from "../../components";
import { AppContext, ModuleContext } from "../../context";
import { AutoLoadout } from "../../manager/loadout-manager";
import Configuration from "../../configuration";


export default function AutoLoadoutPage() {
    const appContext = useContext(AppContext);
    const moduleContext = useContext(ModuleContext);
    const [pageState, setPageState] = useState({
        selectedChampionKey: "",
        selectedSavedLoadout: "",
        selectedDefaultSavedLoadout: AutoLoadout.get("default")?.value ?? "",
        selectedAramLittleLegendLoadout: AutoLoadout.get("aram_little_legend")?.value ?? ""
    })

    useEffect(() => {
        if (appContext.data && pageState.selectedChampionKey === "") {
            setPageState(pageState => { return { ...pageState, selectedChampionKey: appContext.data!.champions.values()[0].key } });
        }
    }, [appContext.data, pageState.selectedChampionKey]);

    useEffect(() => {
        if (pageState.selectedChampionKey !== "") {
            setPageState(pageState => { return { ...pageState, selectedSavedLoadout: AutoLoadout.get(pageState.selectedChampionKey)?.value ?? "" } })
        } else {
            setPageState(pageState => { return { ...pageState, selectedSavedLoadout: "" } })
        }
    }, [pageState.selectedChampionKey])

    return (
        <div>
            <Section>
                <Toggle label="Automatic loadout import" state={appContext.config.enableAutomaticLoadoutImport} setState={state => {
                    Configuration.set("enableAutomaticLoadoutImport", state);
                }} />
                <Toggle label="Disable on PBE" state={appContext.config.disableAutomaticLoadoutImportOnPBE} setState={state => {
                    setPageState(pageState => { return { ...pageState, disableOnPBE: state } })
                    Configuration.set("disableAutomaticLoadoutImportOnPBE", state);
                }} />
            </Section>
            <Section>
                <DropdownList label="Champion" disabled={appContext.data?.champions === undefined} value={pageState.selectedChampionKey} onChange={ev => setPageState(pageState => { return { ...pageState, selectedChampionKey: ev.target.value } })} >
                    {appContext.data?.champions !== undefined ? appContext.data.champions.values().toSorted((c1, c2) => c1.name.localeCompare(c2.name)).map(c => <option key={c.key} value={c.key}>{c.name}</option>) : <option value={""}>Loading...</option>}
                </DropdownList>
                <DropdownList label="Loadout preset" disabled={moduleContext.loadoutPresets  === null} value={pageState.selectedSavedLoadout} onChange={ev => {
                    setPageState(pageState => { return { ...pageState, selectedSavedLoadout: ev.target.value } });
                    AutoLoadout.set(pageState.selectedChampionKey, ev.target.value === "" ? null : ev.target.value );
                }} >
                    <option value={""}>{moduleContext.loadoutPresets === null ? "Loading..." : "None"}</option>
                    {moduleContext.loadoutPresets !== null && moduleContext.loadoutPresets.length !== 0 ?
                        moduleContext.loadoutPresets.toSorted((s1, s2) => s1.name.localeCompare(s2.name)).map(loadout => <option key={loadout.name} value={loadout.name}>{loadout.name}</option>) :
                        null
                    }
                </DropdownList>
            </Section>
            <Section>
                <DropdownList label="Default loadout preset" disabled={moduleContext.loadoutPresets === null} value={pageState.selectedDefaultSavedLoadout} onChange={ev => {
                    setPageState(pageState => { return { ...pageState, selectedDefaultSavedLoadout: ev.target.value } });
                    AutoLoadout.set("default", ev.target.value === "" ? null : ev.target.value);
                }} >
                    <option value={""}>{moduleContext.loadoutPresets === null ? "Loading..." : "None"}</option>
                    {moduleContext.loadoutPresets !== null && moduleContext.loadoutPresets.length !== 0 ?
                        moduleContext.loadoutPresets.toSorted((s1, s2) => s1.name.localeCompare(s2.name)).map(loadout => <option key={loadout.name} value={loadout.name}>{loadout.name}</option>) :
                        null
                    }
                </DropdownList>
                <DropdownList label="Default ARAM tactician" disabled={moduleContext.loadoutPresets === null} value={pageState.selectedAramLittleLegendLoadout} onChange={ev => {
                    setPageState(pageState => { return { ...pageState, selectedAramLittleLegendLoadout: ev.target.value } });
                    AutoLoadout.set("aram_little_legend", ev.target.value === "" ? null : ev.target.value);
                }} >
                    <option value={""}>{moduleContext.loadoutPresets === null ? "Loading..." : "None"}</option>
                    {moduleContext.loadoutPresets !== null && moduleContext.loadoutPresets.length !== 0 ?
                        moduleContext.loadoutPresets.toSorted((s1, s2) => s1.name.localeCompare(s2.name)).map(loadout => <option key={loadout.name} value={loadout.name}>{loadout.name}</option>) :
                        null
                    }
                </DropdownList>
            </Section>
        </div >
    )
}