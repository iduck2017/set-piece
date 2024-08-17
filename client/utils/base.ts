import type { App } from "../app";

export class Util<T = any> {
    public readonly host: T;
    public readonly app: App;
    constructor(host: T, app: App) {
        this.host = host;
        this.app = app;
    }
}