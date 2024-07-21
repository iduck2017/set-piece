import { App } from "./app";

async function main() {
    const app = new App();
    window.$app = app;
    const start = Date.now();
    await app.init();
    const end = Date.now();
    console.log('Time consume', end - start);
}

main();