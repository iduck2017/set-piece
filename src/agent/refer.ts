import { Model } from "@/model";
import { Agent } from ".";
import { DebugService } from "@/service/debug";
import { TranxService } from "@/service/tranx";


export type ReferGroup<
    R1 extends Record<string, Model>, 
    R2 extends Record<string, Model>
> = 
    { [K in keyof R1]?: R1[K] } & 
    { [K in keyof R2]?: Readonly<Required<R2>[K][]> }

export type ReferAddrs<
    R1 extends Record<string, Model>, 
    R2 extends Record<string, Model>,
> = 
    { [K in keyof R1]?: string } & 
    { [K in keyof R2]?: Readonly<string[]> } 


@DebugService.is(target => target.target.name)
export class ReferAgent<
    R1 extends Record<string, Model> = Record<string, Model>,
    R2 extends Record<string, Model> = Record<string, Model>,
    M extends Model = Model,
> extends Agent<M> {
    public get current(): Readonly<ReferGroup<R1, R2>> {
        return { ...this.draft };
    }

    private readonly _addrs: ReferAddrs<R1, R2>;
    public get addrs() {
        return { ...this._addrs }
    }

    public readonly draft: ReferGroup<R1, R2>; 

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
    
    public bind() {
        ReferAgent.registry[this.target.uuid] = this.target;
    }

    public load() {
        for (const key of Object.keys(this._addrs)) {
            let value: string[] | string | undefined = this._addrs[key];
            if (!value) continue;
            if (!Array.isArray(value)) value = [value];

            for (const uuid of value) {
                if (!uuid) continue;
                const consumers = ReferAgent.router[uuid] ?? [];
                consumers.push(this.target.uuid);
                ReferAgent.router[uuid] = consumers;
            }
        }
    }

    public unload() {
        for (const key of Object.keys(this._addrs)) {
            let value: string[] | string | undefined = this._addrs[key];
            if (!value) continue;
            if (!Array.isArray(value)) value = [value];

            for (const uuid of value) {
                const consumers = ReferAgent.router[uuid] ?? [];
                const index = consumers.indexOf(this.target.uuid);
                if (index !== -1) consumers.splice(index, 1);
            }
        }
    }

    public uninit() {
        const router = ReferAgent.router[this.target.uuid] ?? [];
        for (const uuid of router) {
            const model = ReferAgent.query(uuid);
            if (!model) continue;

            const refer: Record<string, string | string[]> = model._agent.refer._addrs;
            for (const key of Object.keys(refer)) {
                const value = refer[key];
                if (Array.isArray(value)) {
                    refer[key] = value.filter(item => item !== this.target.uuid);
                }
                if (value === this.target.uuid) delete refer[key];
            }
        }
        delete ReferAgent.router[this.target.uuid];
        delete ReferAgent.registry[this.target.uuid];
    }

    public get(origin: any, key: string) {
        if (!this.target._cycle.isLoad) return undefined;

        const value = this._addrs[key];
        if (Array.isArray(value)) {
            return value.map(item => ReferAgent.query(item));
        }
        return ReferAgent.query(value)
    }

        
    @DebugService.log()
    @TranxService.span()
    private set(origin: Record<string, string | string[]>, key: string, next: Model | Model[]) {
        let prev = origin[key];

        if (!(prev instanceof Array)) prev = [prev];
        if (this.target._cycle.isLoad) {
            for (const uuid of prev) {
                const consumers = ReferAgent.router[uuid] ?? [];
                const index = consumers.indexOf(this.target.uuid);
                if (index !== -1) consumers.splice(index, 1);
            }
        }

        const isArray = next instanceof Array;
        
        if (!(next instanceof Array)) next = [next];
        if (this.target._cycle.isLoad) {
            for (const model of next) {
                if (!(model instanceof Model)) continue;
                const consumers = ReferAgent.router[model.uuid] ?? [];
                consumers.push(this.target.uuid);
                ReferAgent.router[model.uuid] = consumers;
            }
        }

        if (isArray) origin[key] = next.map(item => item.uuid);
        else origin[key] = next[0].uuid;

        return true;
    }

    @DebugService.log()
    @TranxService.span()
    private delete(origin: any, key: string) {
        let prev = origin[key];

        if (!(prev instanceof Array)) prev = [prev];
        if (this.target._cycle.isLoad) {
            for (const uuid of prev) {
                const consumers = ReferAgent.router[uuid] ?? [];
                const index = consumers.indexOf(this.target.uuid);
                if (index !== -1) consumers.splice(index, 1);
            }
        }

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