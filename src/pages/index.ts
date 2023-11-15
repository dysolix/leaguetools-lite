import Settings from "./Settings";

export { Settings }

export type Page = keyof typeof Pages

const Pages = {
    "settings": Settings,
}

export default Pages;