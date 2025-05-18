import { Model } from "@/model";
import { Agent } from ".";
import { DebugService } from "@/service/debug";
import { TranxService } from "@/service/tranx";
import { Addrs, Refer } from "@/types/model";

@DebugService.is(target => target.target.name)
export class ReferAgent<
    R1 extends Record<string, Model> = Record<string, Model>,
    R2 extends Record<string, Model> = Record<string, Model>,
    M extends Model = Model,
> extends Agent<M> {
    public get current(): Readonly<Refer<R1, R2>> {
        return { ...this.draft };
    }

    private readonly _addrs: Addrs<R1, R2>;
    public get addrs() {
        return { ...this._addrs }
    }

    public readonly draft: Refer<R1, R2>; 

    constructor(
        target: M,
        props?: Partial<Addrs<R1, R2>>
    ) {
        super(target);

        this._addrs = props ?? {}
        this.draft = new Proxy(this._addrs as any, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.delete.bind(this)
        })
    }

    
    public bind() {
        ReferAgent.registry[this.target.uuid] = this.target;
    }

    public unbind() {
        const router = ReferAgent.router[this.target.uuid] ?? [];
        for (const uuid of router) {
            const model = ReferAgent.query(uuid);
            if (!model) continue;
            const refer: Record<string, Model | Model[]> = model._agent.refer.draft;
            for (const key of Object.keys(refer)) {
                const value = refer[key];
                if (value instanceof Array) {
                    refer[key] = value.filter(item => item !== this.target);
                } else if (value === this.target) {
                    delete refer[key];
                }
            }
        }
    }

    public get(origin: any, key: string) {
        const value: unknown = this._addrs[key];
        if (typeof value === 'string') return ReferAgent.query(value);
        if (value instanceof Array) {
            return value.map(item => ReferAgent.query(item));
        }
        return undefined;
    }


    private _link(target?: string | string[]) {
        if (target instanceof Array) {
            for (const uuid of target) this._link(uuid);
            return;
        }
        if (!target) return;

        const consumers = ReferAgent.router[target] ?? [];
        consumers.push(this.target.uuid);
        ReferAgent.router[target] = consumers;
    }

    private _unlink(target?: string | string[]) {
        if (target instanceof Array) {
            for (const uuid of target) this._unlink(uuid);
            return;
        }
        if (!target) return;

        const consumers = ReferAgent.router[target] ?? [];
        const index = consumers.indexOf(this.target.uuid);
        if (index !== -1) consumers.splice(index, 1);
    }
        
    @DebugService.log()
    @TranxService.span()
    private set(origin: any, key: string, value: Model | Model[] | undefined) {
        console.log('refer set:', key, value);
        const prev = origin[key];
        this._unlink(prev);
        const next = value instanceof Array ? 
            value.map(item => item?.uuid) : 
            value?.uuid;
        origin[key] = next;
        this._link(next);
        return true;
    }

    @DebugService.log()
    @TranxService.span()
    private delete(origin: any, key: string) {
        let prev = origin[key];
        this._unlink(prev);
        delete origin[key];
        return true;
    }



    private static readonly router: Record<string, string[]> = {}

    private static readonly registry: Record<string, Model> = {}

    public static query(uuid?: string): Model | undefined {
        if (!uuid) return undefined;
        return ReferAgent.registry[uuid];        
    }
    
}