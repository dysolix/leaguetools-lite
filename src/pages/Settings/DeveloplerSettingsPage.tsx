import { useContext, useEffect } from "react";
import { Section, Text } from "../../components";
import { AppContext, NavigationContext } from "../../context";
import { Client } from "../../hasagi-client";
import { IoCopy } from "react-icons/io5";

export default function DeveloperSettingsPage() {
    const appContext = useContext(AppContext);
    const navContext = useContext(NavigationContext);
    useEffect(() => {
        if (!appContext.config.developerMode) {
            navContext.setPage("Settings");
        }
    }, [appContext.config.developerMode, navContext])

    return (
        <div>
            <Section wide>
                <Text align="center">
                    <span title="Copy to clipboard" onClick={() => { navigator.clipboard.writeText("https://127.0.0.1:" + Client.getPort()) }}>Address: {"https://127.0.0.1:" + Client.getPort()} <IoCopy /></span>
                    <span title="Copy to clipboard" onClick={() => { navigator.clipboard.writeText("Basic " + Client.getBasicAuthToken()) }}>Authorization: Basic {Client.getBasicAuthToken()} <IoCopy /></span>
                </Text>
            </Section>
        </div>
    )
}