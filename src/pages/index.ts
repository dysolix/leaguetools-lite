import UltimateBravery from "./UltimateBravery";
import Miscellaneous from "./Miscellaneous";
import { SettingsPage, DeveloplerSettingsPage } from "./Settings";

export { UltimateBravery, Miscellaneous, SettingsPage, DeveloplerSettingsPage }

export type Page = keyof typeof Pages

const Pages = {
    "UltimateBravery": UltimateBravery,
    "Miscellaneous": Miscellaneous,
    "Settings": SettingsPage,
    "DeveloperSettings": DeveloplerSettingsPage
}

export default Pages;