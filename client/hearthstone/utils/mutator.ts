import { Base, Delegator, Dict } from "@/set-piece";

export const AbortSignal = Symbol('abort signal');

export class Mutator<T extends Base.Dict> {
    public readonly editor: {
        [K in Dict.Key<T>]: Dict.Value<T> | typeof AbortSignal;
    };
    public readonly result: Readonly<T>;

    constructor(info: T) {
        this.editor = new Proxy(info, {
            set: (target, key: Dict.Key<T>, value: Dict.Value<T>) => {
                if (value === AbortSignal) {
                    Object.defineProperty(target, key, {
                        writable: false
                    });
                    return true;
                }
                target[key] = value;
                return true;
            }
        });
        this.result = Delegator.Readonly(info);
    }
}