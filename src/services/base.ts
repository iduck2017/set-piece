import type { App } from "../app";
import { BaseRecord } from "../types/base";

export abstract class Service<
    D extends BaseRecord = BaseRecord
> {
    public readonly app: App;

    constructor(app: App) {
        this.app = app;
    }
}