import HasagiClient from "@hasagi/extended";
export var Client: HasagiClient;
export function setClient(client: HasagiClient) {
    Client = client;
    window.hasagiClient = client;
}

declare global {
    interface Window {
        hasagiClient: HasagiClient
    }
}