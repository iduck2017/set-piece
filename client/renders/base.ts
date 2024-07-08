import type { App } from "../app";
import { BaseIntf } from "../types/model";
import { Handler } from "../utils/handler";

export abstract class Renderer<
    H extends BaseIntf
> {
    public readonly app: App;

    public readonly abstract handler: Handler<H>;

    constructor(app: App) {
        this.app = app;
    }
}