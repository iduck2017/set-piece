import { Model } from "@/model";
import { Agent } from ".";
import { DebugContext } from "@/context/debug";
import { TrxContext } from "@/context/trx";
import { Callback } from "@/types";
import { ReferAgent } from "./refer";
import { ChildChunk } from "@/types/chunk";

export class ChildAgent<
    C1 extends Record<string, Model> = Record<string, Model>,
    C2 extends Model = Model,
    P extends Model = Model,
    M extends Model = Model
> extends Agent<M> {   
    public parent?: P

    public path?: string;

    public current?: Readonly<C1 & C2[]>;

    public isLoad: boolean;
    
    private history?: Model.Child<M>;

    public readonly proxy: Readonly<C1 & C2[]>

    private workspace: Readonly<C1 & C2[]>

    private memory?: Readonly<C1 & C2[]>

    public get chunk(): ChildChunk<C1, C2> {
        const origin = this.current ?? this.workspace;
        const result: any = {}
        for (const key of Object.keys(origin)) {
            const value: Model | undefined = origin[key];
            if (value) result[key] = value.chunk
        }
        return result;
    }
    
    constructor(
        target: M, 
        props: C1 & Record<number, C2>,
    ) {
        super(target);

        const origin: any = [];
        for (const key of Object.keys(props)) {
            origin[key] = props[key];
        }
        this.isLoad = false;
        this.current = this.copy(origin);
        this.workspace = this.copy(origin);
        this.proxy = new Proxy({} as any, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.delete.bind(this),
        })
    }

    @DebugContext.log()
    public copy(origin?: C1 & C2[]): C1 & C2[] {
        origin = origin ?? this.current ?? this.workspace;
        const result: any = [];
        for (const key of Object.keys(origin)) {
            result[key] = origin[key];
        }
        return result;
    }

    @DebugContext.log()
    public commitBefore() {
        const removed: Model[] = [];
        const origin: Record<string, Model> = this.current ?? {};
        for (const key of Object.keys(origin)) {
            const next: Model | undefined = this.workspace[key];
            const prev: Model | undefined = origin[key];
            if (next !== prev && prev) {
                removed.push(prev);
            }
        }
        for (const model of removed) {
            const childAgent = model.agent.child;
            childAgent.unload()
        }
    }

    @DebugContext.log()
    public commit() {
        const created: Model[] = [];
        const origin: Record<string, Model> = this.current ?? {};
        for (const key of Object.keys(this.workspace)) {
            const next = this.workspace[key];
            const prev = origin[key];
            if (next !== prev && next) {
                if (!ReferAgent.check(next.uuid)) {
                    // replace with valid one
                }
                created.push(this.workspace[key]);
            }
        }
        this.history = this.target.child;
        this.memory = this.copy(this.current);
        this.current = this.copy(this.workspace);
        for (const model of created) {
            const childAgent = model.agent.child;
            childAgent.commit();
        }
    }

    @DebugContext.log()
    public commitDone() {
        if (!this.memory) return;
        if (!this.current) return;
        const created: Record<string, Model> = {};
        for (const key of Object.keys(this.current)) {
            const next = this.current[key]
            const prev = this.memory[key];
            if (next !== prev && next) {
                created[key] = next;
            }
        }
        for (const key of Object.keys(created)) {
            const model = created[key];
            const childAgent = model.agent.child;
            const parent: any = this.target;
            childAgent.load(parent, key)
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
        this.memory = undefined;
        this.history = undefined;
    }

    @TrxContext.use()
    public load(parent: P, path: string) {
        this.parent = parent;
        this.path = path;
        this.isLoad = true;
        const stateAgent = this.agent.state;
        const referAgent = this.agent.refer;
        const eventAgent = this.agent.event;
        stateAgent.load();
        referAgent.load();
        eventAgent.load();
        if (!this.current) return;
        for (const key of Object.keys(this.current)) {
            const child = this.current[key]?.agent.child;
            const parent: any = this.target;
            if (child) child.load(parent, key);
        }
    }

    @DebugContext.log()
    public unload() {
        this.parent = undefined;
        this.path = undefined;
        this.isLoad = false;
        const stateAgent = this.agent.state;
        const referAgent = this.agent.refer;
        const eventAgent = this.agent.event;
        stateAgent.unload();
        referAgent.unload();
        eventAgent.unload();
        if (!this.current) return;
        for (const key of Object.keys(this.current)) {
            const child = this.current[key]?.agent.child;
            if (child) child.unload()
        }
        this.current = undefined;
    }

    @DebugContext.log()
    public destroy() {
        const stateAgent = this.agent.state;
        const referAgent = this.agent.refer;
        const eventAgent = this.agent.event;
        stateAgent.destroy();
        referAgent.destroy();
        eventAgent.destroy();
        if (!this.current) return;
        for (const key of Object.keys(this.current)) {
            const child = this.current[key]?.agent.child;
            if (child) child.destroy()
        }
    }

    private get(origin: any, key: string) {
        origin = this.current ?? this.workspace;
        if (key === 'push') return this.push.bind(this);
        if (key === 'pop') return this.pop.bind(this);
        if (key === 'shift') return this.shift.bind(this);
        if (key === 'unshift') return this.unshift.bind(this);
        if (key === 'splice') return this.splice.bind(this);
        if (key === 'reverse') return this.reverse.bind(this);
        if (key === 'sort') return this.sort.bind(this);
        if (key === 'fill') return this.fill.bind(this); 
        const value = origin[key];
        return value;
    }

    @TrxContext.use()
    @DebugContext.log()
    private set(origin: never, key: string, value: Model) {
        Reflect.set(this.workspace, key, value);
        return true;
    }

    @TrxContext.use()
    @DebugContext.log()
    private delete(origin: never, key: string) {
        Reflect.deleteProperty(this.workspace, key);
        return true;
    }

    @TrxContext.use()
    @DebugContext.log()
    private push(...args: C2[]) {
        return this.workspace.push(...args);
    }

    @TrxContext.use()
    @DebugContext.log()
    private pop() {
        return this.workspace.pop();
    }

    @TrxContext.use()
    @DebugContext.log()
    private shift() {
        return this.workspace.shift();
    }

    @TrxContext.use()
    @DebugContext.log()
    private unshift(...args: C2[]) {
        return this.workspace.unshift(...args)
    }

    @TrxContext.use()
    @DebugContext.log()
    private splice(index: number, count: number, ...args: C2[]) {
        return this.workspace.splice(index, count, ...args);
    }

    @TrxContext.use()
    @DebugContext.log()
    private reverse() {
        return this.workspace.reverse();
    }

    @TrxContext.use()
    @DebugContext.log()
    private fill(sample: C2) {
        return this.workspace.fill(sample);
    }

    @TrxContext.use()
    @DebugContext.log()
    private sort(handler: Callback) {
        return this.workspace.sort(handler);
    }
}