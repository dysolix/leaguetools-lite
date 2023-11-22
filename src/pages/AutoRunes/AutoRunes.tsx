import { useContext, useEffect, useState } from "react";
import { } from "../../App";
import { DropdownList, Section, Toggle } from "../../components";
import { AppContext, ModuleContext } from "../../context";
import { AutoRunes } from "../../manager/rune-manager";
import Configuration from "../../configuration";

export default function AutoRunesPage() {
    const appContext = useContext(AppContext);
    const moduleContext = useContext(ModuleContext);

    const [pageState, setPageState] = useState({
        selectedChampion: "",
        selectedSrRunePage: "",
        selectedHaRunePage: ""
    });

    useEffect(() => {
        if (appContext.data && pageState.selectedChampion === "") {
            setPageState(pageState => { return { ...pageState, selectedChampion: appContext.data!.champions.values()[0].name } })
        } else if (pageState.selectedChampion !== "") {
            const arEntry = AutoRunes.get(pageState.selectedChampion);
            setPageState(pageState => { return { ...pageState, selectedSrRunePage: arEntry?.summonersRiftRunePage ?? "", selectedHaRunePage: arEntry?.howlingAbyssRunePage ?? "" } })
        }
    }, [appContext.data, pageState.selectedChampion])

    return (
        <div>
            <Section>
                <Toggle label="Enable automatic rune import" state={appContext.config.enableAutomaticRuneImport} setState={state => {
                    Configuration.set("enableAutomaticRuneImport", state);
                }} />
            </Section>
            <Section>
                <DropdownList label="Champion" value={pageState.selectedChampion} onChange={ev => setPageState({ ...pageState, selectedChampion: ev.target.value })}>
                    {appContext.data !== null ? appContext.data.champions.values().toSorted((c1, c2) => c1.name.localeCompare(c2.name)).map(c => <option key={c.id} value={c.id}>{c.name}</option>) : <option value={""}>Loading...</option>}
                </DropdownList>

                <DropdownList label="Summoner's Rift Rune Page" value={pageState.selectedSrRunePage} disabled={pageState.selectedChampion === ""} onChange={ev => {
                    setPageState({ ...pageState, selectedSrRunePage: ev.target.value });
                    AutoRunes.set(pageState.selectedChampion, { key: pageState.selectedChampion, summonersRiftRunePage: ev.target.value === "" ? null : ev.target.value, howlingAbyssRunePage: pageState.selectedHaRunePage });
                }}>
                    <option value="">None</option>
                    {moduleContext.savedRunePages.toSorted((s1, s2) => s1.name.localeCompare(s2.name)).map(srp => <option key={srp.name} value={srp.name}>{srp.name}</option>)}
                </DropdownList>

                <DropdownList label="Howling Abyss Rune Page" value={pageState.selectedHaRunePage} disabled={pageState.selectedChampion === ""} onChange={ev => {
                    setPageState({ ...pageState, selectedHaRunePage: ev.target.value });
                    AutoRunes.set(pageState.selectedChampion, { key: pageState.selectedChampion, summonersRiftRunePage: pageState.selectedSrRunePage, howlingAbyssRunePage: ev.target.value === "" ? null : ev.target.value });
                }}>
                    <option value="">None</option>
                    {moduleContext.savedRunePages.toSorted((s1, s2) => s1.name.localeCompare(s2.name)).map(srp => <option key={srp.name} value={srp.name}>{srp.name}</option>)}
                </DropdownList>
            </Section>
        </div>
    )
}