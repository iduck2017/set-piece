import { Model } from "@/model";
import { Agent } from ".";
import { ChildChunk, FlatChildChunk } from "@/types/chunk";
import { DebugContext } from "@/context/debug";
import { ProductContext } from "@/context/product";
import { TrxContext } from "@/context/trx";
import { Callback } from "@/types";
import { ReferAgent } from "./refer";

export class ChildAgent<
    C1 extends Record<string, Model> = Record<string, Model>,
    C2 extends Model = Model,
    M extends Model = Model
> extends Agent<M> {   
    public current: Readonly<C1 & C2[]>;
    
    private history?: Model.Child<M>;

    public readonly proxy: ChildChunk<C1, C2>

    private workspace: ChildChunk<C1, C2>
    
    private removed: string[];
    
    private created: Model[];

    private altered: boolean
    
    constructor(
        target: M, 
        props: FlatChildChunk<C1, C2>,
    ) {
        super(target);

        const origin: any = [];
        console.log('props', props)
        const keys = Object.keys(props);
        for (const key of keys) {
            const chunk = props[key];
            chunk.uuid = ReferAgent.check(chunk.uuid);
            const model = this.create(chunk, key);
            origin[key] = model;
        }
        this.current = origin;
        this.workspace = origin;

        this.proxy = new Proxy({} as any, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.delete.bind(this),
        })

        this.removed = [];
        this.created = [];
        this.altered = false;
    }

    public copy(origin?: C1 & C2[]): C1 & C2[] {
        if (!origin) origin = this.current;
        const result: any = [];
        const keys = Object.keys(origin);
        for (const key of keys) {
            const value = Reflect.get(origin, key);
            Reflect.set(result, key, value);
        }
        return result;
    }


    @DebugContext.log()
    public commitBefore() {
        const models = Object.values(this.current);
        for (const uuid of this.removed) {
            const model = models.find(item => item.uuid === uuid);
            if (!model) continue;
            const child = model.agent.child;
            child.unload() 
        }
    }

    @DebugContext.log()
    public commit() {
        const current: any = []
        const memory = Object.values(this.current); 
        for (const key of Object.keys(this.workspace)) {
            const chunk: Model.Chunk | undefined = this.workspace[key];
            if (!chunk) continue;
            let model = ReferAgent.recycle(chunk.uuid);
            if (model) {
                this.created.push(model);
                current[key] = model;
                continue;
            }
            model = memory.find(item => item.uuid === chunk.uuid);
            if (model) {
                current[key] = model;
                continue;
            }
            model = this.create(chunk, key);
            if (model) {
                chunk.uuid = model.uuid;
                this.created.push(model);
                current[key] = model;
                continue;
            }
        }
        this.history = this.target.child;
        this.current = current;
    }

    @DebugContext.log()
    public commitDone() {
        for (const model of this.created) {
            const child = model?.agent.child;
            if (child) child.load()
        }
    }

    @DebugContext.log()
    public reset() {
        console.log('history', this.history);
        if (!this.history) return;
        this.agent.event.emit('onChildUpdate', {
            prev: this.history,
            next: this.current
        })
        this.removed = [];
        this.created = [];
        this.history = undefined;
    }

    @TrxContext.use()
    public load() {
        const state = this.agent.state;
        const refer = this.agent.refer;
        const event = this.agent.event;
        state.load();
        refer.load();
        event.load();
        for (const key of Object.keys(this.current)) {
            const child = this.current[key]?.agent.child;
            if (child) child.load();
        }
    }

    public unload() {
        const state = this.agent.state;
        const refer = this.agent.refer;
        const event = this.agent.event;
        state.unload();
        refer.unload();
        event.unload();
        for (const key of Object.keys(this.current)) {
            const child = this.current[key]?.agent.child;
            if (child) child.unload()
        }
    }

    public destroy() {
        const state = this.agent.state;
        const refer = this.agent.refer;
        const event = this.agent.event;
        state.destroy();
        refer.destroy();
        event.destroy();
        for (const key of Object.keys(this.current)) {
            const child = this.current[key]?.agent.child;
            if (child) child.destroy()
        }
    }
    
    @DebugContext.log({ useResult: false })
    private create<M extends Model>(props: Model.Chunk<M>, key: string | number): Model | undefined {
        const constructor = ProductContext.query(props.code);
        if (!constructor) return undefined;
        if (!isNaN(Number(key))) key = '0';
        console.log('createChild', constructor, props.code);
        return new constructor({
            ...props,
            path: key,
            parent: this.target,
        })
    }

    private get(origin: never, key: string) {
        if (key === 'push') return this.push.bind(this);
        if (key === 'pop') return this.pop.bind(this);
        if (key === 'shift') return this.shift.bind(this);
        if (key === 'unshift') return this.unshift.bind(this);
        if (key === 'splice') return this.splice.bind(this);
        if (key === 'reverse') return this.reverse.bind(this);
        if (key === 'sort') return this.sort.bind(this);
        if (key === 'fill') return this.fill.bind(this); 
        const value = this.current[key];
        if (value instanceof Model) return value.chunk;
        return value;
    }

    private unregister(uuid: string | undefined) {
        if (!uuid) return;
        if (this.removed.includes(uuid)) return;
        this.removed.push(uuid);
    }

    @TrxContext.use()
    @DebugContext.log()
    private set(origin: never, key: string, value: Model.Props<Model>) {
        const uuid: string | undefined = this.current[key]?.uuid;
        this.unregister(uuid);
        this.altered = true;
        Reflect.set(this.workspace, key, value);
        return true;
    }

    @TrxContext.use()
    @DebugContext.log()
    private delete(origin: never, key: string) {
        const uuid: string | undefined = this.current[key]?.uuid;
        this.unregister(uuid);
        this.altered = true;
        Reflect.deleteProperty(this.workspace, key);
        return true;
    }

    @TrxContext.use()
    @DebugContext.log()
    private push(...args: Model.Chunk[]) {
        const result = this.workspace.push(...args);
        return result;
    }

    @TrxContext.use()
    @DebugContext.log()
    private pop() {
        const result: Model.Chunk | undefined = this.workspace.pop();
        const uuid = result?.uuid;
        this.unregister(uuid)
        return result;
    }

    @TrxContext.use()
    @DebugContext.log()
    private shift() {
        const result = this.workspace.shift()
        const uuid = result?.uuid;
        this.unregister(uuid);
        return result;
    }

    @TrxContext.use()
    @DebugContext.log()
    private unshift(...args: Model.Chunk[]) {
        const result = this.workspace.unshift(...args);
        return result;
    }

    @TrxContext.use()
    @DebugContext.log()
    private splice(index: number, count: number, ...args: Model.Chunk[]) {
        const result = this.workspace.splice(index, count, ...args);
        const uuids: Array<string | undefined> = result.map(item => item?.uuid);
        for (const uuid of uuids) this.unregister(uuid);
        return result;
    }

    @TrxContext.use()
    @DebugContext.log()
    private reverse() {
        const result = this.workspace.reverse();
        return result;
    }

    @TrxContext.use()
    @DebugContext.log()
    private fill(chunk: Model.Chunk) {
        const chunks = [ ...this.workspace ];
        const uuids = chunks.map(item => item?.uuid);
        for (const uuid of uuids) this.unregister(uuid);
        const result = this.workspace.fill(chunk);
        return result;
    }

    @TrxContext.use()
    @DebugContext.log()
    private sort(handler: Callback) {
        const result = this.workspace.sort(handler);
        return result;
    }
}