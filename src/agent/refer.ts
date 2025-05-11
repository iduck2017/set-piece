import { Model } from "@/model";
import { Agent } from ".";
import { DebugService } from "@/service/debug";
import { ReferAddrs } from "@/types/model";

export class ReferAgent<
    R1 extends Record<string, Model> = Record<string, Model>,
    R2 extends Record<string, Model[]> = Record<string, Model[]>,
    M extends Model = Model,
> extends Agent<M> {
    public get current(): Readonly<Partial<R1 & R2>> {
        return { ...this.draft };
    }

    private readonly _addrs: Partial<ReferAddrs<R1, R2>>;
    public get addrs() {
        return { ...this._addrs }
    }

    public readonly draft: Partial<R1 & R2>; 

    constructor(
        target: M,
        props?: Partial<ReferAddrs<R1, R2>>
    ) {
        super(target);

        this._addrs = props ?? {}
        this.draft = new Proxy(this._addrs as any, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.delete.bind(this)
        })
    }

    
    public init() {
        ReferAgent.registry[this.target.uuid] = this.target;
    }

    public uninit() {
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


    private bind(target?: string | string[]) {
        if (target instanceof Array) {
            for (const uuid of target) this.bind(uuid);
            return;
        }
        if (!target) return;

        const consumers = ReferAgent.router[target] ?? [];
        consumers.push(this.target.uuid);
        ReferAgent.router[target] = consumers;
    }

    private unbind(target?: string | string[]) {
        if (target instanceof Array) {
            for (const uuid of target) this.unbind(uuid);
            return;
        }
        if (!target) return;

        const consumers = ReferAgent.router[target] ?? [];
        const index = consumers.indexOf(this.target.uuid);
        if (index !== -1) consumers.splice(index, 1);
    }
        

    @DebugService.log()
    private set(origin: any, key: string, value: Model | Model[] | undefined) {
        console.log('refer set:', key, value);
        const prev = origin[key];
        this.unbind(prev);
        const next = value instanceof Array ? 
            value.map(item => item?.uuid) : 
            value?.uuid;
        origin[key] = next;
        this.bind(next);
        return true;
    }

    @DebugService.log()
    private delete(origin: any, key: string) {
        let prev = origin[key];
        this.unbind(prev);
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