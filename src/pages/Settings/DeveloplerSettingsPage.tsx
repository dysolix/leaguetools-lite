import { useContext, useEffect } from "react";
import { Toggle, Section } from "../../components";
import Configuration from "../../configuration";
import { AppContext, NavigationContext } from "../../context";

export default function DeveloperSettingsPage() {
    const appContext = useContext(AppContext);
    const navContext = useContext(NavigationContext);
    useEffect(() => {
        if(!appContext.config.developerMode) {
            navContext.setPage("Settings");
        }
    }, [appContext.config.developerMode, navContext])

    return (
        <div>
            <Section>
                <Toggle label="Enable schema updater" state={appContext.config.enableSchemaUpdater} setState={newState => {
                    Configuration.set("enableSchemaUpdater", newState);
                }} />
            </Section>
        </div>
    )
}