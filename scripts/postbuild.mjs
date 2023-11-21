import * as fs from "fs/promises";
import prompt from "prompt";


const packageObj = JSON.parse(await fs.readFile("./package.json", { encoding: "utf8" }));

prompt.start();

let { version } = await prompt.get(
    {
        name: 'version',
        validator: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,
        allowEmpty: true,
        default: packageObj.version,
    }
);

if (!version)
    throw new Error("Version input is null");

let indexHtml = await fs.readFile("./build/index.html", "utf8");
while (indexHtml.includes('="/'))
    indexHtml = indexHtml.replace('="/', '="./');

indexHtml = indexHtml.replace("manifest.json", "asset-manifest.json")

await fs.writeFile("./build/index.html", indexHtml);
try {
    await fs.rm("./build/appdata", { recursive: true });
} catch (e) { }

packageObj.version = version;
await fs.writeFile("./package.json", JSON.stringify(packageObj, null, 4))

await fs.readdir("./build/static/js", { withFileTypes: true }).then(async entries => {
    const target = entries.find(e => e.isFile() && e.name.endsWith(".js"));
    const targetContent = await fs.readFile("./build/static/js/" + target.name, { encoding: "utf8" });
    await fs.writeFile("./build/static/js/" + target.name, targetContent.replace(/\$VERSION/, packageObj.version))
})