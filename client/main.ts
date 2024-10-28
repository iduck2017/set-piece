import { App } from "./app";

async function main() {
    const app = App.instance;
    await app.init();
}

main();
