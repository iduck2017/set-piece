import type { App } from "../app";
import { BaseIntf } from "../types/base";
import { Receivable } from "../utils/receivable";

export abstract class Renderer<
    H extends BaseIntf
> {
    private readonly $app: App;
    public get app() { return this.$app; }

    protected readonly $recv: Receivable<H>;

    constructor(conf: {
        app  : App,
        event: H
    }) {
        this.$app = conf.app;
        this.$recv = new Receivable({
            target: this,
            ref   : {},
            event : conf.event
        });
    }
}