import { TranxService } from "../service/tranx";
import { Model } from "../model";
import { Agent } from "./agent";

export type Refer<R extends Model.R = Model.R> = { 
    [K in keyof R]?: R[K] extends any[] ? Readonly<R[K]> : R[K] 
}

export class ReferAgent<
    M extends Model = Model,
    R extends Model.R = Model.R,
> extends Agent<M> {

    public readonly draft: Refer<R>

    public get current(): Readonly<Refer<R>> { 
        const result: any = {}
        for (const key of Object.keys(this.draft)) {
            const value = this.draft[key];
            result[key] = value instanceof Array ? [...value] : value;
        }
        return result;
    }


    private readonly router: Map<Model, string[]>;
    
    constructor(target: M, props: () => Refer<R>) {
        super(target);
        this.router = new Map();

        const refer = props();
        const origin: any = {};
        for (const key in refer) {
            let value: Model | Model[] | undefined = refer[key];
            if (value instanceof Array) {
                origin[key] = [];
                value.forEach((value, index) => {
                    origin[key].push(value);
                    origin[key][index].agent.refer.bind(this.target, key);
                })
            } else if (value) {
                origin[key] = value;
                origin[key].agent.refer.bind(this.target, key)
            }
        }
        this.draft = new Proxy({ ...origin }, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.del.bind(this)
        });
    }

    private bind(value: Model, key: string) {
        const router = this.router.get(value) ?? [];
        router.push(key);
        this.router.set(value, router);
        return true;
    }

    private unbind(value: Model, key: string) {
        const router = this.router.get(value) ?? [];
        const index = router.indexOf(key);
        if (index === -1) return;
        router.splice(index, 1);
        this.router.set(value, router);
    }



    public unload() {
        const draft: Partial<Record<string, Model | Model[]>> = this.draft
        for (const key of Object.keys(draft)) {
            const value = draft[key];
            if (value instanceof Array) {
                draft[key] = value.filter(value => {
                    if (value.agent.route.root === this.target.agent.route.root) return true;
                    value.agent.refer.unbind(this.target, key);
                    return false;
                })
            } else if (value) {
                if (value.agent.route.root === this.target.agent.route.root) return;
                value.agent.refer.unbind(this.target, key);
                delete draft[key]
            }
        }
    }

    public uninit() {
        for (const channel of this.router) {
            const [ model, keys ] = channel;
            
            if (model.agent.route.root === this.target.agent.route.root) continue;

            for (const key of [ ...keys ]) {
                const origin: Record<string, Model | Model[]> = model.agent.refer.draft;
                const value = origin[key];
                if (value instanceof Array) {
                    const index = value.indexOf(this.target);
                    if (index === -1) continue;
                    value.splice(index, 1);
                }
                if (value === this.target) delete origin[key];
            }
        }
        this.router.clear();
    }




    private get(origin: Partial<Record<string, Model | Model[]>>, key: string) {
        const value = origin[key];
        if (value instanceof Array) return this.proxy(value, key);
        return value;
    }

    @TranxService.diff()
    @TranxService.use()
    private set(
        origin: Partial<Record<string, Model | Model[]>>, 
        key: string, 
        next?: Model | Model[]
    ) {
        let prev = origin[key];
        if (prev instanceof Array) {
            prev.forEach(prev => {
                prev.agent.refer.unbind(this.target, key)
            });
        } else prev?.agent.refer.unbind(this.target, key);

        if (next instanceof Array) {
            next.forEach(next => {
                next.agent.refer.bind(this.target, key);
            })
        } else next?.agent.refer.bind(this.target, key);

        origin[key] = next;
        return true;
    }



    @TranxService.diff()
    @TranxService.use()
    private del(origin: Partial<Record<string, Model | Model[]>>, key: string) {
        let prev = origin[key];
        if (prev instanceof Array) {
            prev.forEach(prev => {
                prev.agent.refer.unbind(this.target, key)
            });
        } else if (prev) {
            prev.agent.refer.unbind(this.target, key);
        }
        delete origin[key];
        return true;
    }


    



    private proxy(value: Model[], key: string): Model[] {
        return new Proxy(value, {
            get: this.lget.bind(this, key),
            set: this.lset.bind(this, key),
            deleteProperty: this.ldel.bind(this, key),
        })
    }

    private lget(key: string, origin: any, index: string) {
        if (index === 'push') return this.push.bind(this, key, origin);
        if (index === 'pop') return this.pop.bind(this, key, origin);
        if (index === 'shift') return this.shift.bind(this, key, origin);
        if (index === 'unshift') return this.unshift.bind(this, key, origin);
        if (index === 'fill') return this.fill.bind(this, key, origin);
        if (index === 'reverse') return this.reverse.bind(this, origin);
        if (index === 'sort') return this.sort.bind(this, origin);
        if (index === 'splice') return this.splice.bind(this, key, origin);
        return origin[index];
    }

    @TranxService.diff()
    @TranxService.use()
    private lset(key: string, origin: any, index: string, next: Model) {
        const prev = origin[index];
        if (prev instanceof Model) prev.agent.refer.unbind(this.target, key);
        if (next instanceof Model) next.agent.refer.bind(this.target, key);
        origin[index] = next;
        return true;
    }
    
    @TranxService.diff()
    @TranxService.use()
    private ldel(key: string, origin: any, index: string) {
        const prev = origin[index];
        if (prev instanceof Model) prev.agent.refer.unbind(this.target, key);
        delete origin[index];
        return true;
    }


    @TranxService.diff()
    @TranxService.use()
    private push(key: string, origin: Model[], ...next: Model[]) {
        next.forEach(next => {
            next.agent.refer.bind(this.target, key);
        })
        const result = origin.push(...next);
        return result;
    }

    @TranxService.diff()
    @TranxService.use()
    private unshift(key: string, origin: Model[], ...next: Model[]) {
        next.forEach(next => {
            next.agent.refer.bind(this.target, key);
        })
        const result = origin.unshift(...next);
        return result;
    }

    @TranxService.diff()
    @TranxService.use()
    private pop(key: string, origin: Model[]) {
        const result = origin.pop();
        if (result) result.agent.refer.unbind(this.target, key);
        return result;
    }


    @TranxService.diff()
    @TranxService.use()
    private shift(key: string, origin: Model[]) {
        const result = origin.shift();
        if (result) result.agent.refer.unbind(this.target, key);
        return result;
    }

    @TranxService.diff()
    @TranxService.use()
    private reverse(origin: Model[]) {
        return origin.reverse();
    }

    @TranxService.diff()
    @TranxService.use()
    private sort(origin: Model[], handler: (a: Model, b: Model) => number) {
        return origin.sort(handler);
    }


    @TranxService.diff()
    @TranxService.use()
    private fill(key: string, origin: Model[], value: Model, start?: number, end?: number) {
        if (start === undefined) start = 0;
        if (end === undefined) end = origin.length;

        const prev = origin.slice(start, end);
        prev.forEach(prev => {
            prev.agent.refer.unbind(this.target, key)
        });

        const next = new Array(end - start).fill(value);
        next.forEach(next => {
            next.agent.refer.bind(this.target, key);
        })
        return origin.fill(value, start, end)
    }


    @TranxService.diff()
    @TranxService.use()
    private splice(key: string, origin: Model[], start: number, count: number, ...next: Model[]) {
        const prev = origin.slice(start, start + count);
        prev.forEach(prev => {
            prev.agent.refer.unbind(this.target, key)
        });

        next.forEach(next => {
            next.agent.refer.bind(this.target, key);
        })
        
        const result = origin.splice(start, count, ...next);
        return result;
    }


}