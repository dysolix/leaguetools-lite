import { useContext } from "react";
import { Section, Toggle } from "../../components";
import Configuration from "../../configuration";
import { AppContext } from "../../context";

export default function Miscellaneous() {
    const appContext = useContext(AppContext);

    return (
        <div>
            <Section>
                <Toggle label="Default skin warning" tooltip="If you pick a champion for which you own skins but have the default skin selected, you get notified." state={appContext.config.enableDefaultSkinAlert} setState={state => {
                    Configuration.set("enableDefaultSkinAlert", state);
                }} />
                <Toggle label="Magical Footwear replacer" tooltip="Replaces Magical Footwear with Perfect Timing." state={appContext.config.enableMagicalFootwearReplacer} setState={state => {
                    Configuration.set("enableMagicalFootwearReplacer", state);
                }} />
            </Section>
        </div>
    )
}