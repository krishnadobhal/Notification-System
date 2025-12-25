import { connectClients } from "./client/client.ts";



async function init() {
    await connectClients();
}

init().catch(console.error);