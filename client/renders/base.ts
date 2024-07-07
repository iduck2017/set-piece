import type { App } from "../app";
import { BaseEvent } from "../types/model";
import { Consumer } from "../utils/consumer";

export abstract class Renderer<
    H extends BaseEvent
> {
    public readonly app: App;

    public readonly abstract consumer: Consumer<H>;

    constructor(app: App) {
        this.app = app;
    }
}