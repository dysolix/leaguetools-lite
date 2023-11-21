import HasagiClient from "@hasagi/extended";
import registerModules from "./modules/register-modules";
export const Client = new HasagiClient();
window.hasagiClient = Client;

await registerModules();

declare global {
    interface Window {
        hasagiClient: HasagiClient
    }
}