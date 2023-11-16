import UltimateBravery from "./UltimateBravery";
import Miscellaneous from "./Miscellaneous";
import Settings from "./Settings";

export { UltimateBravery, Miscellaneous, Settings }

export type Page = keyof typeof Pages

const Pages = {
    "UltimateBravery": UltimateBravery,
    "Miscellaneous": Miscellaneous,
    "Settings": Settings,
}

export default Pages;