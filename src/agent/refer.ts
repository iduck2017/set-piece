import { Model } from "@/model";
import { Agent } from ".";
import { ReferAddrs, ReferGroup } from "@/types/refer";

export class ReferAgent<
    R1 extends Record<string, Model> = Record<string, Model>,
    R2 extends Record<string, Model> = Record<string, Model>,
    M extends Model = Model,
> extends Agent<M> {

    // get refer(): Readonly<ReferGroup<R1, R2>> { return this.copyRefer(this.referDelegator) }
    // private referReleased: Readonly<ReferAddrs<R1, R2>>
    // private referSnapshot?: Readonly<ReferGroup<R1, R2>>
    // private readonly referWorkspace: ReferAddrs<R1, R2>;
    // p

    public current: Readonly<ReferAddrs<R1, R2>>;
    public history?: Readonly<ReferGroup<R1, R2>>;
    public proxy: ReferGroup<R1, R2>
    public workspace: Readonly<ReferAddrs<R1, R2>>;
    
    public copy(origin?: ReferGroup<R1, R2>): ReferGroup<R1, R2> {
        if (!origin) origin = this.proxy;
        const result: ReferGroup<R1, R2> = { ...origin };
        for (const key of Object.keys(origin)) {
            Reflect.set(result, key, [ ...origin[key] ])
        }
        return result;
    }

    public commit() {

    }

    public reset() {

    }

    public load() {

    }

    public unload() {
        
    }
}