import UltimateBravery from "./UltimateBravery";
import Miscellaneous from "./Miscellaneous";
import { SettingsPage, DeveloplerSettingsPage } from "./Settings";
import Loadouts from "./Loadouts";
import AutoLoadoutPage from "./AutoLoadout";
import Runes from "./Runes";
import AutoRunes from "./AutoRunes";

export { UltimateBravery, Miscellaneous, SettingsPage, DeveloplerSettingsPage, Loadouts, AutoLoadoutPage, Runes, AutoRunes }

export type Page = keyof typeof Pages

const Pages = {
    "AutoRunes": AutoRunes,
    "Runes": Runes,
    "AutoLoadouts": AutoLoadoutPage,
    "Loadouts": Loadouts,
    "UltimateBravery": UltimateBravery,
    "Miscellaneous": Miscellaneous,
    "Settings": SettingsPage,
    "DeveloperSettings": DeveloplerSettingsPage
}

export default Pages;