import { AppStatus } from "../types/status";
import { appStatus } from "../utils/status";
import { singleton } from "../utils/decors";
import { Service } from "./base";
import { MAX_TICKET, MIN_TICKET } from "../configs/base";
import { BaseModel } from "../types/model";

@singleton
export class ReferService extends Service {
    private readonly _refers: Record<string, BaseModel> = {};
    private _timestamp: number = Date.now();
    private _ticket: number = MIN_TICKET;

    @appStatus(AppStatus.MOUNTING)
    public init() {
        this._timestamp = Date.now();
        this._ticket = MIN_TICKET;
    }

    @appStatus(AppStatus.MOUNTED)
    public list(keys: string[]): BaseModel[] {
        const result: BaseModel[] = [];
        for (const key of keys) {
            if (this._refers[key]) {
                result.push(this._refers[key]);
            }
        }
        return result;
    }

    @appStatus(AppStatus.MOUNTED)
    public get(key: string): BaseModel {
        return this._refers[key];
    }

    @appStatus(
        AppStatus.MOUNTING, 
        AppStatus.MOUNTED,
        AppStatus.UNMOUNTED
    )
    public register(): string {
        let now = Date.now();
        const ticket = this._ticket;
        this._ticket += 1;
        if (this._ticket > MAX_TICKET) {
            this._ticket = MIN_TICKET;
            while (now === this._timestamp) {
                now = Date.now();
            }
            this._timestamp = now;
        }
        return ticket.toString(16) + now.toString(16);
    }


    @appStatus(
        AppStatus.MOUNTING, 
        AppStatus.MOUNTED,
        AppStatus.UNMOUNTED
    )
    public add(target: BaseModel) {
        this._refers[target.referId] = target;
    }

    @appStatus(AppStatus.MOUNTED)
    public remove(target: BaseModel) {
        delete this._refers[target.referId];
    }
}


