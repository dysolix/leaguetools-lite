import path from "path";
import fs from "fs/promises";

const CSS_VARIABLES = new Set<string>();
CSS_VARIABLES.add("--toggle-circle-checked-url");
CSS_VARIABLES.add("--toggle-circle-url");

export interface IColorTheme {
    name: string
    variables: Record<string, string>
}

const getCircle = (color: string) => `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='${encodeURI(color)}'/%3e%3c/svg%3e")`

export class ColorTheme implements IColorTheme {
    name: string;
    variables: Record<string, string>;
    
    public constructor(iColorTheme: IColorTheme) {
        this.name = iColorTheme.name;
        this.variables = iColorTheme.variables;
    }

    load() {
        const root = document.querySelector(':root')! as HTMLElement;
        CSS_VARIABLES.forEach(cssVar => root.style.removeProperty(cssVar));
        Object.entries(this.variables).forEach(([name, value]) => name.startsWith("--") && root.style.setProperty(`${name}`, value));

        const toggleCircleColor = this.variables["#unchecked-toggle-circle-color"];
        if(toggleCircleColor) {
            root.style.setProperty("--toggle-circle-url", getCircle(toggleCircleColor));
        }
        const toggleCircleCheckedColor = this.variables["#checked-toggle-circle-color"];
        if(toggleCircleCheckedColor){
            root.style.setProperty("--toggle-circle-checked-url", getCircle(toggleCircleCheckedColor));
        }
    }
}

export async function getAllThemes() {
    const customThemes = await getCustomThemes();
    const builtInThemes = getBuiltInThemes();

    const themes = [
        ...customThemes.filter(theme => !builtInThemes.some(t => t.name === theme.name) && !customThemes.some(t => t !== theme && t.name === theme.name)),
        ...builtInThemes
    ]

    themes.forEach(theme => Object.keys(theme.variables).forEach(key => CSS_VARIABLES.add(key)))
    return themes;
}

export function getBuiltInThemes() {
    const builtInThemes: IColorTheme[] = [
        {
            name: "dark/green",
            variables: { }
        },
        {
            name: "dark/purple",
            variables: {
                '--primary-color': '#6c00ff',
                '--secondary-color': '#5f00df',
                '--tertiary-color': '#5800cf',
                '--checked-toggle-color': 'var(--primary-color)',
                '--disconnected-color': 'white',
                '#checked-toggle-circle-color': 'white'
            }
        },
        {
            name: "black/red",
            variables: {
                "--primary-color": "rgb(255,0,0)",
                "--secondary-color": "rgb(204,0,0)",
                "--tertiary-color": "rgb(179,0,0)",
                "--primary-background-color": "rgb(88,88,88)",
                "--secondary-background-color": "rgb(0,0,0)",
                "--checked-toggle-color": "var(--primary-color)",
                "--disconnected-color": "rgb(230,66,66)",
                "--error-tone-1": "var(--primary-color)",
                "--error-tone-2": "var(--secondary-color)",
                "--error-tone-3": "var(--tertiary-color)",
                "#unchecked-toggle-circle-color": "rgb(0,0,0)",
                "#checked-toggle-circle-color": "rgb(0,0,0)"
            }
        }
    ]

    return builtInThemes.map(theme => new ColorTheme(theme))
}

export async function getCustomThemes() {
    const dirPath = path.join(window.basePath, "./themes");
    await fs.mkdir(dirPath).catch(() => {});
    const themes = [];
    for (const dirent of await fs.readdir(dirPath, { withFileTypes: true })) {
        if (!dirent.isFile() || !dirent.name.endsWith(".json"))
            continue;

        const theme = await fs.readFile(path.join(dirPath, dirent.name), "utf8").then(JSON.parse).then(theme => new ColorTheme(theme));
        themes.push(theme);
    }

    return themes;
}