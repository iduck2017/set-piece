import type { App } from "../app";
import { Model } from "../models";
import { singleton } from "../utils/singleton";

export const MIN_TICKET = 100000;
export const MAX_TICKET = 999999;

@singleton
export class ReferenceService {
    public readonly app: App;

    constructor(app: App) {
        this.app = app;
        this.reset();
    }

    private $referDict: Record<string, Model> = {};
    public get referDict() { return { ...this.$referDict }; }
    public addRefer(target: Model) { this.$referDict[target.id] = target; }
    public removeRefer(target: Model) { delete this.$referDict[target.id]; }

    private $timestamp!: number; 
    private $ticket!: number;

    public reset() {
        this.$timestamp = Date.now();
        this.$ticket = MIN_TICKET;
        this.$referDict = {};
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


