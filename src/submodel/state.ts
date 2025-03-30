import { Value } from "@/types";
import { SubModel } from ".";
import { Model } from "@/model/model";
import { TrxContext } from "@/context/trx";
import { DebugContext } from "@/context/debug";

export class StateModel<
    S1 extends Record<string, Value> = Record<string, Value>,
    S2 extends Record<string, Value> = Record<string, Value>,
    M extends Model<any, any, S1, S2> = Model<any, any, S1, S2>
> extends SubModel<M> {
    public current: Readonly<S1 & S2>
    public origin: Readonly<S1 & S2>

    private history?: Readonly<S1 & S2>
    public readonly draft: S1 & S2
    public readonly proxy: S1 & S2

    private isEdit: string[] = [];

    constructor(target: M, props: S1 & S2) {
        super(target);
        this.origin = { ...props }
        this.current = { ...props }
        this.draft = { ...props }
        this.proxy = new Proxy(this.draft, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.delete.bind(this),
        })
    }

    private get(origin: any, key: string) {
        return this.origin[key];
    }

    @DebugContext.log()
    public check(path: string) {
        console.log(path);
        const keys = path.split('/');
        const key = keys.shift();
        path = keys.join('/')
        if (!key) return;
        if (keys.length) {
            if (key === '0') {
                const children = [...this.target.child];
                console.log('cehckChild', children);
                children.forEach(child => child.stateModel.check(key));
            } else {
                const child: Model = Reflect.get(this.target.child, key);
                console.log('cehckChild', child)
                child.stateModel.check(key)
            }
        } else {
            if (this.isEdit.includes(key)) return;
            console.log('resetState', key)
            this.isEdit.push(key);
        }
    } 

    @TrxContext.use()
    private set(origin: S1 & S2, key: any, value: any) {
        Reflect.set(origin, key, value); 
        this.check(key);
        return true;
    }

    
    @TrxContext.use()
    private delete(origin: S1 & S2, key: string) {
        Reflect.deleteProperty(origin, key); 
        this.check(key)
        return true;
    }

    @DebugContext.log()
    public commit() {
        console.log(this.isEdit)
        if (!this.isEdit.length) return;
        console.log('updateState', ...this.isEdit);
        const current = { ...this.current };
        for (const key of this.isEdit) {
            const value = this.decorModel.emit(key);
            Reflect.set(current, key, value);
        }
        this.history = this.target.state;
        this.origin = { ...this.draft };
        this.current = current;
    }

    @DebugContext.log()
    public reset() {
        if (!this.isEdit.length) return;
        this.eventModel.emit('onStateUpdate', {
            prev: this.history,
            next: this.current
        })
        this.history = undefined;
        this.isEdit = [];
    }

    @TrxContext.use()
    @DebugContext.log()
    public setBatch(updater: (prev: S1 & S2) => Partial<S1 & S2>) {
        const prev: S1 & S2 = { ...this.current };
        const next = updater(prev);
        Object.keys(next).forEach(key => {
            console.log('SetStateBatch', key)
            Reflect.set(this.proxy, key, next[key]);
        })
    }

    
}