import type { App } from "../app";
import type { Model } from "../models";
import { Emitter } from "../utils/emitter";
import { Handler } from "../utils/handler";
import { singleton } from "../utils/singleton";

export const MIN_TICKET = 100000;
export const MAX_TICKET = 999999;

@singleton
export class ReferenceService {
    public readonly app: App;
    public modelDict: Record<string, Model> = {};
    public emitterDict: Record<string, Emitter> = {};
    public handlerDict: Record<string, Handler> = {};

    constructor(app: App) {
        this.app = app;
        this.$timestamp = Date.now();
        this.$ticket = MIN_TICKET;
        this.modelDict = {};
    }

    private $timestamp: number; 
    private $ticket: number;

    public reset() {
        this.$timestamp = Date.now();
        this.$ticket = MIN_TICKET;
        this.modelDict = {};
    }

    public getUniqId(): string {
        let now = Date.now();
        const ticket = this.$ticket;
        this.$ticket += 1;
        if (this.$ticket > MAX_TICKET) {
            this.$ticket = MIN_TICKET;
            while (now === this.$timestamp) now = Date.now();
            this.$timestamp = now;
        }
        return ticket.toString(16) + now.toString(16);
    }
}


