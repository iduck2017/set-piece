import { Model } from "@/model/model";
import { SubModel } from ".";
import { ChildChunk, FlatChildChunk } from "@/types/chunk";
import { DebugContext } from "@/context/debug";
import { ProductContext } from "@/context/product";
import { TrxContext } from "@/context/trx";

export class ChildModel<
    C1 extends Record<string, Model>,
    C2 extends Model,
    M extends Model<any, any, any, any, any, C1, C2>
> extends SubModel<M> {   
    public current: Readonly<C1 & C2[]>;
    private history?: Readonly<C1 & C2[]>

    private readonly draft: C1 & C2[]
    public readonly proxy: ChildChunk<C1, C2>

    private isEdit: boolean = false;

    constructor(target: M, props: FlatChildChunk<C1, C2>) {
        super(target);
        const origin: any = [];
        Object.keys(props.child).forEach(key => {
            const chunk = props[key];
            const model = this.create(chunk, key);
            origin[key] = model;
        })
        this.current = origin;
        this.draft = origin;
        this.proxy = new Proxy(origin, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.delete.bind(this),
        })
    }

    public copy(origin?: C1 & C2[]): C1 & C2[] {
        if (!origin) origin = this.current;
        const result: any = [];
        for (const key of Object.keys(origin)) {
            const value = Reflect.get(origin, key);
            Reflect.set(result, key, value);
        }
        return result;
    }

    public commit() {
        const prev: Model[] = Object.values(this.current);
        const next: Model[] = Object.values(this.draft);
        const childCreated = next.filter(item => !prev.includes(item))
        const childRemoved = prev.filter(item => !next.includes(item))
        if (!childCreated.length && !childRemoved.length) return;
        for (const child of childRemoved) child.unload();
        this.history = this.target.child;
        this.current = this.copy(this.draft);
        for (const child of childCreated) child.load();
    }

    public reset() {
        if (!this.isEdit) return;
        this.eventModel.emit('onChildUpdate', {
            prev: this.history,
            next: this.current
        })
    }

    public load() {
        for (const key of Object.keys(this.current)) {
            const child = this.current[key]
            child.unload()
        }
    }

    public unload() {
        for (const key of Object.keys(this.current)) {
            const child = this.current[key];
            child.unload()
        }
    }

    private get(origin: any, key: string) {
        const value = this.current[key];
        if (value instanceof Model) return value.chunk;
        if (typeof value === 'function' && typeof key === 'string') {
            if (key === 'push') return this.push.bind(this);
            if (key === 'pop') return this.pop.bind(this);
            if (key === 'shift') return this.shift.bind(this);
            if (key === 'unshift') return this.unshift.bind(this);
            if (key === 'splice') return this.splice.bind(this);
            if (key === 'reverse') return this.reverse.bind(this);
            if (key === 'sort') return this.sort.bind(this);
            if (key === 'fill') return this.fill.bind(this);
        }
        return this.current[key];
    }

    
    @DebugContext.log({ useResult: false })
    private create<M extends Model>(props: Model.Chunk<M>, key: string | number): Model | undefined {
        const constructor = ProductContext.query(props.code);
        if (!constructor) return undefined;
        if (!isNaN(Number(key))) key = '0';
        const uuid = ProductContext.checkUUID(props.uuid);
        console.log('createChild', constructor, props.code, uuid);
        return new constructor({
            ...props,
            uuid,
            path: key,
            parent: this.target,
        })
    }
    
    @TrxContext.use()
    @DebugContext.log()
    private push(...args: Model.Props<Model>[]) {
        this.isEdit = true;
        let models: any[] = args.map(props => this.create(props, 0));
        models = models.filter(Boolean);
        const result = this.draft.push(...models);
        return result;
    }

    @TrxContext.use()
    @DebugContext.log()
    private pop() {
        this.isEdit = true;
        const model = this.draft.pop();
        if (model) ProductContext.deleteUUID(model.uuid);
        return model?.chunk;
    }

    @TrxContext.use()
    @DebugContext.log()
    private unshift(...args: Model.Props<Model>[]) {
        this.isEdit = true;
        let models: any[] = args.map(props => this.create(props, 0));
        models = models.filter(Boolean);
        const result = this.draft.unshift(...models);
        return result
    }

    
    @TrxContext.use()
    @DebugContext.log()
    private splice(index: number, count: number, ...args: Model.Props<Model>[]) {
        this.isEdit = true;
        let models: any[] = args.map(props => this.create(props, 0));
        models = models.filter(Boolean);
        const result = this.draft.splice(index, count, ...models);
        for (const model of result) {
            ProductContext.deleteUUID(model.uuid)
        }
        return result.map(child => child.props);
    }

    @TrxContext.use()
    private sort(...args: any[]) {
        this.isEdit = true;
        const result = this.draft.sort(...args);
        return result;
    }

    @TrxContext.use()
    private reverse() {
        this.isEdit = true;
        return this.draft.reverse();
    }


    @TrxContext.use()
    @DebugContext.log()
    private fill(props: any) {
        this.isEdit = true;
        for (let index = 0; index < this.draft.length; index ++) {
            const model = this.create(props, 0);
            Reflect.set(this.draft, index, model)
        }
    }

    @TrxContext.use()
    @DebugContext.log()
    private shift(...args: any[]) {
        this.isEdit = true;
        const model = this.draft.shift();
        if (model) ProductContext.deleteUUID(model.uuid);
        return model?.chunk;
    }

    @TrxContext.use()
    @DebugContext.log()
    private set(origin: any, key: string, props: any) {
        this.isEdit = true;
        const modelPrev = origin[key]
        if (modelPrev) ProductContext.deleteUUID(modelPrev.uuid);
        const modelNext = this.create(props, key);
        Reflect.set(this.draft, key, modelNext);
        return true;
    }

    @TrxContext.use()
    @DebugContext.log()
    private delete(origin: any, key: string) {
        this.isEdit = true;
        const modelPrev = this.draft[key];
        if (modelPrev) ProductContext.deleteUUID(modelPrev.uuid)
        Reflect.deleteProperty(this.draft, key);
        return true;
    }
}