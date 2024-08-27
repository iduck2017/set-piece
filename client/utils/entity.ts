import type { App } from "../app";

export class Entity {
    public readonly app: App;

    constructor(app: App) {
        this.app = app;
    }
}