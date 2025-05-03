import { Model } from "@/model";
import { Agent } from ".";
import { TrxContext } from "@/context/trx";
import { DebugContext } from "@/context/debug";
import { ReferChunk } from "@/types/chunk";
import { EventAccessor } from "./event";
import { EventHandler } from "@/types/event";
import { DecorProducer, DecorUpdater } from "@/types/decor";

export class ReferAgent<
    R1 extends Record<string, Model> = Record<string, Model>,
    R2 extends Record<string, Model[]> = Record<string, Model[]>,
    M extends Model = Model,
> extends Agent<M> {
    public current?: Readonly<R1 & R2>;
    
    public history?: Model.Refer<M>;
    
    public readonly proxy = {} as R1 & R2
    
    public readonly workspace: R1 & R2

    private consumers: Model[];

    public get chunk(): Readonly<ReferChunk<R1, R2>> {
        const result: any = {}
        const origin = this.current ?? this.workspace;
        for (const key of Object.keys(origin)) {
            const value = origin[key];
            if (value instanceof Model) result[key] = value.uuid;
            if (value instanceof Array) result[key] = value.map(item => item?.uuid)
        }
        return result;
    }

    constructor(
        target: M,
        props: R1 & R2
    ) {
        super(target);
        const current: any = {}
        for (const key of Object.keys(props)) {
            const value: unknown = props[key]
            if (value instanceof Array) {
                current[key] = [];
            }
        }
        this.current = current;
        this.workspace = props;
        this.proxy = new Proxy(this.proxy, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.delete.bind(this)
        })
        this.consumers = [];
    }

    public reset() {
        if (!this.history) return;
        this.agent.event.emit('onChildUpdate', {
            prev: this.history,
            next: this.current
        })
        this.history = undefined;
    }

    @DebugContext.log()
    public load() {
        const uuid = this.target.uuid;
        ReferAgent.registry[uuid] = this.target;
    }

    public copy(origin?: R1 & R2): R1 & R2 {
        origin = origin ?? this.current ?? this.workspace;
        const result: any = {};
        for (const key of Object.keys(origin)) {
            const value = origin[key];
            if (value instanceof Array) result[key] = [...value];
            else result[key] = value;
        }
        return result;
    }

    @DebugContext.log()
    public unload() {
        const uuid = this.target.uuid;
        delete ReferAgent.registry[uuid];
        TrxContext.recycle(this.target);
    }

    @DebugContext.log()
    public destroy() {
        for (const consumer of this.consumers) {
            const referAgent = consumer.agent.refer;
            for (const key of Object.keys(referAgent.workspace)) {
                const value: unknown = Reflect.get(referAgent.workspace, key);
                if (value instanceof Model && value === this.target) {
                    delete this.workspace[key]
                }
                if (value instanceof Array && value.includes(this.target)) {
                    Reflect.set(this.workspace, key, value.filter(item => item !== this.target));
                }
            }
        }
    }

    private diff(prev: Model[], next: Model[]): [Model[], Model[]] {
        const removed: Model[] = [];
        const created: Model[] = [];
        for (const model of prev) {
            if (!next.includes(model)) removed.push(model);
        }
        for (const model of next) {
            if (!prev.includes(model)) created.push(model);
        }
        return [removed, created];
    }


    @DebugContext.log()
    public commit() {
        const removed: Model[] = [];
        const created: Model[] = [];
        const origin: Record<string, Model | Model[]> = this.current ?? {};
       
        for (const key of Object.keys(this.workspace)) {
            let value = this.workspace[key];
            if (value instanceof Model) {
                const childAgent = value.agent.child;
                if (childAgent.isLoad) continue;
                delete this.workspace[key];
            }
            if (value instanceof Array) {
                const result: Model[] = [];
                for (const model of value) {
                    const childAgent = model.agent.child;
                    if (!childAgent.isLoad) continue;
                    result.push(model);
                }
                Reflect.set(this.workspace, key, result);
            }
        }
        
        for (const key of Object.keys(this.workspace)) {
            const prev = origin[key];
            const next = this.workspace[key];
            if (prev instanceof Array && next instanceof Array) {
                const diffInfo = this.diff(prev, next);
                removed.push(...diffInfo[0]);
                created.push(...diffInfo[1]);
            } else if (prev !== next && next) {
                if (next instanceof Model) created.push(next);
                if (next instanceof Array) created.push(...next);
            }
        }

        for (const key of Object.keys(origin)) {
            const prev = origin[key]
            const next = this.workspace[key]
            if (prev && prev !== next) {
                if (prev instanceof Model) removed.push(prev);
                if (prev instanceof Array) removed.push(...prev);
            }
        }

        console.log('removed', removed)
        for (const model of removed) {
            const referAgent = model.agent.refer;
            const consumers = referAgent.consumers;
            const index = consumers.indexOf(this.target);
            if (index == -1) continue;
            consumers.splice(index, 1);
        }

        console.log('created', created)
        for (const model of created) {
            const referAgent = model.agent.refer;
            const consumers = referAgent.consumers;
            consumers.push(this.target);
        }

        this.history = this.target.refer;
        this.current = this.copy(this.workspace);
    }

    private get(origin: any, key: string) {
        origin = this.current ?? this.workspace;
        const value = origin[key];
        return value;
    }

    @TrxContext.use()
    @DebugContext.log()
    private set(origin: never, key: string, uuid: string | string[]) {
        Reflect.set(this.workspace, key, uuid) 
        return true;
    }

    @TrxContext.use()
    @DebugContext.log()
    private delete(origin: never, key: string) {
        Reflect.deleteProperty(this.workspace, key);
        return true;
    }
    
    private static readonly registry: Record<string, Model> = {}
    
    @DebugContext.log()
    static check(uuid: string): boolean {
        return Boolean(ReferAgent.registry[uuid]);
    }

    // @DebugContext.log()
    // public static use<
    //     S, 
    //     M extends Model, 
    //     I extends Model, 
    //     K extends keyof Model.Refer<I>
    // >(
    //     key: K,
    //     accessor: (model: Model.Decoy<I>) => DecorProducer<S, M> | undefined
    // ) {
    //     return function(
    //         target: I,
    //         key: string,
    //         descriptor: TypedPropertyDescriptor<DecorUpdater<S, M>>
    //     ): TypedPropertyDescriptor<DecorUpdater<S, M>> {
    //         // const registry = StateAgent.registry.get(target.constructor) ?? {};
    //         // if (!registry[key]) registry[key] = [];
    //         // registry[key].push(accessor);
    //         // StateAgent.registry.set(target.constructor, registry);
    //         // return descriptor;
    //     }
    // }
}