import type { App } from "../app";

export abstract class Service {
    private _app: App;
    public get app() { return this._app; }

    constructor(app: App) {
        this._app = app;
    }
}