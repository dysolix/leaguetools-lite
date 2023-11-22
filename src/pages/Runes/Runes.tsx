import { useContext, useEffect, useState } from "react";
import { Button, DropdownList, Section, TextInput, TextInputWithButton } from "../../components";
import Hasagi from "@hasagi/extended/types";
import { AppContext, LoLContext, ModuleContext } from "../../context";
import { Client } from "../../hasagi-client";
import Configuration from "../../configuration";
import { RunePages } from "../../manager/rune-manager";

export default function Runes(){
    const leagueContext = useContext(LoLContext);
    const moduleContext = useContext(ModuleContext);

    const [pageState, setPageState] = useState({
        selectedRunePage: -1,
        saveAsInputValue: "",
        saveAsInputValid: true,
        selectedSavedRunePage: "" as string,
        renameInputValue: "",
        renameInputValid: true,
        copyInputValue: "",
        copyInputValid: true,
        loadButtonDisabled: false,
        importPrefix: Configuration.get("runeImportPrefix")
    });

    useEffect(() => {
        if(leagueContext.runePages && leagueContext.runePages.length > 0 && pageState.selectedRunePage === -1){
            setPageState(state => { return { ...state, selectedRunePage: leagueContext.runePages!.find(runePage => runePage.current)?.id ?? leagueContext.runePages![0].id } })
        }
    }, [leagueContext.runePages, pageState.selectedRunePage])

    useEffect(() => {
        if(moduleContext.savedRunePages && moduleContext.savedRunePages.length !== 0 && pageState.selectedSavedRunePage === ""){
            setPageState(pageState => { return { ...pageState, selectedSavedRunePage: moduleContext.savedRunePages[0].name } })
        }else if((!moduleContext.savedRunePages || moduleContext.savedRunePages.length === 0) && pageState.selectedSavedRunePage !== ""){
            setPageState(pageState => { return { ...pageState, selectedSavedRunePage: "" } })
        }
    }, [leagueContext.runePages, moduleContext.savedRunePages, pageState.selectedSavedRunePage])

    return (
        <div>
            <Section>
                <DropdownList label="Rune page" disabled={leagueContext.runePages === null || !leagueContext.isConnected} value={pageState.selectedRunePage} onChange={ev => setPageState(pageState => { return { ...pageState, selectedRunePage: Number(ev.target.value)} })}>
                    {leagueContext.runePages !== null && leagueContext.runePages.length > 0 ? leagueContext.runePages.toSorted((s1, s2) => s1.name.localeCompare(s2.name)).map(runePage => <option key={runePage.id} value={runePage.id}>{runePage.name}</option>) : <option key={-1} value={-1}>{leagueContext.isConnected ? "Loading..." : "Waiting for client..."}</option>}
                </DropdownList>
                <TextInputWithButton
                    textInput={
                        {
                            placeholder: "Save as",
                            value: pageState.saveAsInputValue,
                            valid: pageState.saveAsInputValid,
                            disabled: pageState.selectedRunePage === -1 || leagueContext.runePages?.length === 0,
                            onChange: ev => {
                                let value = ev.target.value;
                                if (value.trim().length > 32)
                                    return;

                                setPageState({ ...pageState, saveAsInputValid: value.trim().length > 0 && !RunePages.exists(value.trim()), saveAsInputValue: value });
                            }
                        }
                    }

                    button={
                        {
                            label: "Save",
                            color: "primary",
                            disabled: pageState.selectedRunePage === -1 || leagueContext.runePages?.length === 0,
                            onClick: ev => {
                                if (pageState.saveAsInputValue.length === 0 || pageState.saveAsInputValue.length > 32)
                                    return;

                                if (RunePages.exists(pageState.saveAsInputValue))
                                    return;

                                let runePage = leagueContext.runePages?.find(rp => rp.id === pageState.selectedRunePage);
                                if (runePage === undefined)
                                    return;

                                if (runePage.primaryStyleId === undefined)
                                    return;

                                if (runePage.subStyleId === undefined)
                                    return;

                                RunePages.upsert({
                                    name: pageState.saveAsInputValue,
                                    runeIds: runePage.selectedPerkIds,
                                    primaryRuneTreeId: runePage.primaryStyleId,
                                    secondaryRuneTreeId: runePage.subStyleId,
                                })

                                setPageState({ ...pageState, saveAsInputValue: "", saveAsInputValid: true })
                            }
                        }
                    }
                />
            </Section>
            <Section>
                <DropdownList label="Saved rune pages" value={pageState.selectedSavedRunePage} onChange={ev => setPageState({ ...pageState, selectedSavedRunePage: ev.target.value })} disabled={moduleContext.savedRunePages.length === 0}>
                    {moduleContext.savedRunePages.length !== 0 ? moduleContext.savedRunePages.toSorted((s1, s2) => s1.name.localeCompare(s2.name)).map(r => <option key={r.name} value={r.name}>{r.name}</option>) : <option value={""}>None</option>}
                </DropdownList>
                <TextInputWithButton
                    textInput={{
                        placeholder: "Rename to",
                        value: pageState.renameInputValue,
                        valid: pageState.renameInputValid,
                        disabled: pageState.selectedSavedRunePage === "",
                        onChange: ev => {
                            let value = ev.target.value;
                            if (value.trim().length > 32)
                                return;

                            setPageState({ ...pageState, renameInputValid: value.trim().length > 0 && !RunePages.exists(value), renameInputValue: value})
                        }
                    }}

                    button={{
                        label: "Rename",
                        color: "primary",
                        disabled: pageState.selectedSavedRunePage === "",
                        onClick: ev => {
                            if (pageState.renameInputValue.length === 0 || pageState.renameInputValue.length > 32)
                                return;

                            if (RunePages.exists(pageState.renameInputValue))
                                return;

                            let runePage = RunePages.get(pageState.selectedSavedRunePage);
                            if (runePage === undefined)
                                return;

                            RunePages.upsert({ name: pageState.selectedSavedRunePage });

                            setPageState({ ...pageState, renameInputValue: "", renameInputValid: true })
                        }
                    }} />

                <TextInputWithButton
                    textInput={{
                        placeholder: "Copy as",
                        value: pageState.copyInputValue,
                        valid: pageState.copyInputValid,
                        disabled: pageState.selectedSavedRunePage === "",
                        onChange: ev => {
                            let value = ev.target.value;
                            if (value.length > 32)
                                return;

                            setPageState({ ...pageState, copyInputValid: !RunePages.exists(value), copyInputValue: value })
                        }
                    }}

                    button={{
                        label: "Copy",
                        color: "primary",
                        disabled: pageState.selectedSavedRunePage === "",
                        onClick: ev => {
                            if (pageState.copyInputValue.length === 0 || pageState.copyInputValue.length > 32)
                                return;

                            if (RunePages.exists(pageState.copyInputValue))
                                return;

                            let runePage = RunePages.get(pageState.selectedSavedRunePage);
                            if (runePage === undefined)
                                return;

                            RunePages.upsert({
                                ...runePage!,
                                name: pageState.copyInputValue
                            })

                            setPageState({ ...pageState, copyInputValue: "", copyInputValid: true })
                        }
                    }} />

                <Button label="Load" disabled={pageState.selectedSavedRunePage === "" || pageState.loadButtonDisabled || !leagueContext.isConnected} color="primary" wide onClick={async ev => {
                    if (pageState.loadButtonDisabled) {
                        return;
                    }

                    let targetRunePage = leagueContext.runePages?.find(rp => rp.name.startsWith(Configuration.get("runeImportPrefix")));
                    if (targetRunePage === undefined) return;
                    if (pageState.selectedSavedRunePage === "") return;
                    setPageState({ ...pageState, loadButtonDisabled: true });
                    let savedRunePage = RunePages.get(pageState.selectedSavedRunePage);
                    let newRunePage: Partial<Hasagi.RunePage> = { name: savedRunePage!.name, selectedPerkIds: savedRunePage!.runeIds, primaryStyleId: savedRunePage!.primaryRuneTreeId, subStyleId: savedRunePage!.secondaryRuneTreeId }
                    newRunePage.name = Configuration.get("runeImportPrefix").trim() + " " + newRunePage.name;
                    Client.Runes.replaceRunePage(targetRunePage.id, newRunePage).then(() => setPageState({ ...pageState, loadButtonDisabled: false }));
                }} />

                <Button label="Delete" disabled={pageState.selectedSavedRunePage === ""} color="caution" wide onClick={ev => {
                    RunePages.delete(pageState.selectedSavedRunePage);
                }} />
                <TextInput style={{ textAlign: "center" }} value={pageState.importPrefix} placeholder="Import page prefix" valid={pageState.importPrefix.length > 2 && pageState.importPrefix.length <= 12} onChange={ev => {
                    setPageState({ ...pageState, importPrefix: ev.target.value });
                }} formText="Prefix of the rune page that gets replaced when loading runes. Has to be 3-12 characters long." onBlur={ev => {
                    if (pageState.importPrefix.length >= 3 && pageState.importPrefix.length <= 12 && Configuration.get("runeImportPrefix") !== ev.target.value) {
                        Configuration.set("runeImportPrefix", ev.target.value);
                    }
                }} />
            </Section>
        </div>
    );
}