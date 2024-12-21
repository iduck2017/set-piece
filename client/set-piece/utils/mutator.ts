import { Base, Delegator, Dict } from "@/set-piece";
import { Mutable } from "utility-types";

export const AbortSignal = Symbol('abort signal');

export class Mutator<T extends Base.Dict> {
    public readonly data: Mutable<T>;
    public readonly lock: {
        [K in Dict.Key<T>]?: boolean;
    } = {}

    constructor(info: T) {
        this.data = new Proxy(info, {
            set: (target, key: Dict.Key<T>, value) => {
                if (this.lock[key]) return true;
                target[key] = value;
                return true;
            }
        });
        this.lock = new Proxy(this.lock, {
            set: (target, key: Dict.Key<T>, value) => {
                if (target[key]) return true;
                target[key] = value;
                return true;
            }
        })
    }
}