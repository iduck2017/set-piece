import { AppStatus } from "../types/status";
import { Lifecycle } from "../utils/lifecyle";
import { singleton } from "../utils/singleton";
import { Service } from "./base";
import { MAX_TICKET, MIN_TICKET } from "../configs/base";
import { BaseCall, BaseModel, BaseRecv } from "../types/model";
import type { App } from "../app";

@singleton
export class ReferenceService extends Service {
    private $dict  !: ReferenceManager<BaseModel>;
    private $recv  !: ReferenceManager<BaseRecv>;
    private $emit  !: ReferenceManager<BaseCall>;
    private $ts    !: number; 
    private $ticket!: number;

    public get dict() { return this.$dict; }
    public get recv() { return this.$recv; }
    public get emit() { return this.$emit; }

    constructor(
        app: App 
    ) {
        super(app);
        this.reset();
    }


    @Lifecycle.app(
        AppStatus.MOUNTING,
        AppStatus.UNMOUNTED
    )
    public reset() {
        this.$ts = Date.now();
        this.$ticket = MIN_TICKET;
        this.$dict = new ReferenceManager();
        this.$recv = new ReferenceManager();
        this.$emit = new ReferenceManager();
    }

    @Lifecycle.app(
        AppStatus.MOUNTING, 
        AppStatus.MOUNTED,
        AppStatus.UNMOUNTED
    )
    public get(): string {
        let now = Date.now();
        const ticket = this.$ticket;
        this.$ticket += 1;
        if (this.$ticket > MAX_TICKET) {
            this.$ticket = MIN_TICKET;
            while (now === this.$ts) now = Date.now();
            this.$ts = now;
        }
        return ticket.toString(16) + now.toString(16);
    }
}

export class ReferenceManager<T extends { key: string }> {
    private readonly $map: Record<string, T> = {};
    public get map() { return { ...this.$map }; }

    @Lifecycle.app(
        AppStatus.MOUNTING, 
        AppStatus.MOUNTED,
        AppStatus.UNMOUNTED
    )
    public add(target: T) {
        this.$map[target.key] = target;
    }

    @Lifecycle.app(AppStatus.MOUNTED)
    public del(target: T) {
        delete this.$map[target.key];
    }

}


