import { Model } from "@/model";
import { Agent } from ".";
import { ReferAddrs, ReferGroup } from "@/types/refer";
import { TrxContext } from "@/context/trx";
import { DebugContext } from "@/context/debug";
import { ValidatorContext } from "@/context/validator";

export class ReferAgent<
    R1 extends Record<string, Model> = Record<string, Model>,
    R2 extends Record<string, Model> = Record<string, Model>,
    M extends Model = Model,
> extends Agent<M> {
    
    public current: Readonly<ReferGroup<R1, R2>>;
    
    public history?: Model.Refer<M>;
    
    public readonly proxy = {} as ReferAddrs<R1, R2>
    
    public readonly workspace: ReferAddrs<R1, R2>;

    private consumers: Model[];

    constructor(
        target: M,
        props: ReferAddrs<R1, R2>,
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

    @DebugContext.log()
    public unload() {
        const uuid = this.target.uuid;
        ReferAgent.memoryOrigin[uuid] = this.target;
        delete ReferAgent.registry[uuid];
    }

    @DebugContext.log()
    public destroy() {
        for (const consumer of this.consumers) {
            const refer = consumer.agent.refer;
            for (const key of Object.keys(refer.workspace)) {
                const value: unknown = Reflect.get(refer.workspace, key);
                if (value === this.target) {
                    Reflect.deleteProperty(refer.workspace, key)
                } else if (value instanceof Array) {
                    for (const model of value) {
                        if (model === this.target) Reflect.deleteProperty(refer.workspace, key);
                    }
                }
            }
        }
    }

    private diff(uuids: string[], models: Model[]): [Model[], string[]] {
        const removed: Model[] = [];
        const created: string[] = [];
        models = [ ...models ]
        for (const uuid of uuids) {
            const index = models.findIndex(item => item.uuid === uuid);
            if (index !== -1) models.splice(index, 1);
            else created.push(uuid);
        }
        for (const model of models) removed.push(model);
        return [removed, created]
    }

    @DebugContext.log()
    public commitBefore() {
        const keys = Object.keys(ReferAgent.memoryOrigin);
        for (const key of keys) {
            const model = ReferAgent.memoryOrigin[key];
            if (model) model.agent.child.destroy();
            delete ReferAgent.memoryOrigin[key];
        }
    }

    @DebugContext.log()
    public commit() {
        this.commitBefore();

        const removed: Model[] = [];
        const created: Model[] = [];
        const current: any = {};
        for (const key of Object.keys(this.workspace)) {
            const value: unknown = this.workspace[key];
            if (typeof value === 'string') {
                const uuid: string = value;
                let model: Model | undefined = this.current[key];
                if (model instanceof Model) {
                    if (model.uuid === uuid) current[key] = model;
                    else {
                        removed.push(model)
                        model = ReferAgent.registry[uuid];
                        if (!model) continue;
                        current[key] = model;
                        created.push(model);
                    }
                } else {
                    model = ReferAgent.registry[uuid];
                    if (!model) continue;
                    current[key] = model;
                    created.push(model); 
                }
            } 
            if (value instanceof Array) {
                const uuids: string[] = value;
                const models: unknown = this.current[key];
                if (models instanceof Array) {
                    const [
                        subRemoved,
                        subCreated
                    ] = this.diff(uuids, models);
                    removed.push(...subRemoved)
                    for (const uuid of uuids) {
                        current[key] = []
                        const model = ReferAgent.registry[uuid];
                        if (model) {
                            current[key].push(model);
                            const index = subCreated.indexOf(uuid);
                            if (index !== -1) {
                                subCreated.splice(index, 1);
                                created.push(model);
                            }
                        }
                    }
                } else {
                    for (const uuid of uuids) {
                        const model = ReferAgent.registry[uuid];
                        if (!model) continue;
                        current[key].push(model);
                        created.push(model);
                    }
                }
            }
        }
        for (const key of Object.keys(this.current)) {
            if (!this.workspace[key]) {
                const value: unknown = this.current[key];
                if (value instanceof Model) {
                    removed.push(value);
                } else if (value instanceof Array) {
                    for (const model of value) {
                        if (model) removed.push(model);
                    }
                }
            }
        }
        
        for (const model of removed) {
            const refer = model.agent.refer;
            const index = refer.consumers.indexOf(this.target);
            if (index !== -1) refer.consumers.splice(index, 1);
        }
        for (const model of created) {
            const refer = model.agent.refer;
            refer.consumers.push(this.target);
        }

        this.history = this.target.refer;
        this.current = current;
    }

    private get(origin: never, key: string) {
        const value: unknown = Reflect.get(this.current, key);
        if (value instanceof Model) return value.uuid;
        if (value instanceof Array) return value.map(item => item.uuid);
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
    
    private static readonly memoryOrigin: Record<string, Model> = {};
    
    public static get memory(): Readonly<Record<string, Model>> { 
        return { ...ReferAgent.memoryOrigin } 
    }

    private static readonly tickets: Set<string> = new Set();

    // @DebugContext.log()
    // static commit() {
    //     for (const key of Object.keys(ReferAgent.memory)) {
    //         const model = ReferAgent.memory[key];
    //         if (!model) continue;
    //         model.agent.child.destroy();
    //         delete ReferAgent.memory[key];
    //     }
    // }

    @DebugContext.log()
    static recycle(uuid?: string): Model | undefined {
        if (!uuid) return undefined;
        const result = this.memoryOrigin[uuid];
        if (result) delete this.memoryOrigin[uuid];
        return result;
    }
    
    @DebugContext.log()
    static check(uuid?: string) {
        if (!uuid) uuid = crypto.randomUUID();
        while (this.tickets.has(uuid)) {
            console.log('check', uuid);
            uuid = crypto.randomUUID();
        }
        this.tickets.add(uuid);
        return uuid;
    }
}