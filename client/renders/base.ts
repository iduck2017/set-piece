import type { App } from "../app";
import { Consumer } from "../models/node";
import { BaseEvent } from "../types/base";

export abstract class Renderer<
    H extends BaseEvent
> {
    public readonly app: App;

    public readonly abstract consumer: Consumer<H>;

    constructor(app: App) {
        this.app = app;
    }
}