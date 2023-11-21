import registerAutoLoadoutModule from "./auto-loadouts";
import registerAutoRunesModule from "./auto-runes";
import registerDefaultSkinAlertModule from "./default-skin-alert";

export default async function registerModules() {
    registerDefaultSkinAlertModule();
    registerAutoLoadoutModule();
    registerAutoRunesModule();
}