import type { App } from "../app";

export abstract class Entity {
    public readonly app: App;

    constructor(app: App) {
        this.app = app;
    }
}