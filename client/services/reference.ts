import { AppStatus } from "../types/status";
import { Lifecycle } from "../utils/lifecyle";
import { singleton } from "../utils/singleton";
import { Service } from "./base";
import { MAX_TICKET, MIN_TICKET } from "../configs/base";
import { BaseDict, BaseModel } from "../types/model";

@singleton
export class ReferenceService extends Service {
    private readonly $ref: BaseDict = {};
    
    private $ts    : number = Date.now();
    private $ticket: number = MIN_TICKET;

    @Lifecycle.app(
        AppStatus.MOUNTING,
        AppStatus.UNMOUNTED
    )
    public reset() {
        this.$ts = Date.now();
        this.$ticket = MIN_TICKET;
    }

    @Lifecycle.app(
        AppStatus.MOUNTED,
        AppStatus.MOUNTING,
        AppStatus.UNMOUNTED
    )
    public get<T extends BaseModel>(key: string): T | undefined {
        return this.$ref[key] as T | undefined;
    }

    public list<T extends BaseModel>(keys?: string[]): T[] {
        if (!keys) return [];
        const result: T[] = [];
        for (const key of keys) {
            const item = this.$ref[key];
            if (item) result.push(item as T);
        }
        return result;
    }

    @Lifecycle.app(
        AppStatus.MOUNTING, 
        AppStatus.MOUNTED,
        AppStatus.UNMOUNTED
    )
    public register(): string {
        let now = Date.now();
        const ticket = this.$ticket;
        this.$ticket += 1;
        if (this.$ticket > MAX_TICKET) {
            this.$ticket = MIN_TICKET;
            while (now === this.$ts) {
                now = Date.now();
            }
            this.$ts = now;
        }
        return ticket.toString(16) + now.toString(16);
    }

    @Lifecycle.app(
        AppStatus.MOUNTING, 
        AppStatus.MOUNTED,
        AppStatus.UNMOUNTED
    )
    public add(target: BaseModel) {
        this.$ref[target.key] = target;
    }

    @Lifecycle.app(AppStatus.MOUNTED)
    public remove(target: BaseModel) {
        delete this.$ref[target.key];
    }
}


