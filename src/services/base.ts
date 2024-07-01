import type { App } from "../app";

export abstract class Service {
    public readonly app: App;

    constructor(app: App) {
        this.app = app;
    }
}