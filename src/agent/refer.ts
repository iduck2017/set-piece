import { TranxService } from "../service/tranx";
import { Model } from "../model";
import { Agent } from "./agent";

export class ReferAgent<
    M extends Model = Model,
    R extends Model.R = Model.R,
> extends Agent<M> {

    public readonly draft: { [K in keyof R]: R[K] extends any[] ? R[K] : R[K] | undefined }

    private readonly router: Map<Model, string[]>;

    public get current(): Readonly<{ [K in keyof R]: R[K] extends any[] ? Readonly<R[K]> : R[K] | undefined }> { 
        const result: any = {}
        for (const key of Object.keys(this.draft)) {
            const value = this.draft[key];
            result[key] = Array.isArray(value) ? [...value] : value;
        }
        return result;
    }

    constructor(target: M, props: { [K in keyof R as R[K] extends any[] ? K : never]: never[] }) {
        super(target);
        this.router = new Map();

        const origin: any = { ...props }
        this.draft = new Proxy(origin, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.del.bind(this)
        });
    }
    

    private bind(value: Model, key: string) {
        if (value.agent.route.root !== this.target.agent.route.root) return false;

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
    



    private get(origin: Record<string, Model | Model[] | undefined>, key: string) {
        const value = origin[key];
        if (Array.isArray(value)) return this.proxy(value, key);
        return value;
    }

    @TranxService.span()
    private set(
        origin: Record<string, Model | Model[] | undefined>, 
        key: string, 
        next: Model | Model[] | undefined
    ) {
        let prev = origin[key];
        if (Array.isArray(prev)) {
            prev.forEach(prev => {
                prev.agent.refer.unbind(this.target, key)
            });
        } else if (prev) {
            prev.agent.refer.unbind(this.target, key);
        }


        if (Array.isArray(next)) {
            next = next.filter(next => {
                return next.agent.refer.bind(this.target, key);
            })
        } else if (next) {
            if (!next.agent.refer.bind(this.target, key)) next = undefined;
        }

        origin[key] = next;
        return true;
    }


    @TranxService.span()
    private del(origin: Record<string, Model | Model[] | undefined>, key: string) {
        let prev = origin[key];
        if (Array.isArray(prev)) {
            prev.forEach(prev => {
                prev.agent.refer.unbind(this.target, key)
            });
        } else if (prev) {
            prev.agent.refer.unbind(this.target, key);
        }


        delete origin[key];
        return true;
    }


    public uninit() {
        // const origin: Record<string, Model | Model[] | undefined> = this.draft
        // for (const key of Object.keys(this.draft)) {
        //     const value = this.draft[key];
        //     if (Array.isArray(value)) {
        //         for (const model of value) model.agent.refer.unbind(this.target, key);
        //         origin[key] = []
        //     } if (Model.isModel(value)) {
        //         value.agent.refer.unbind(this.target, key);
        //         delete origin[key] 
        //     }
        // }
        // for (const channel of this.router) {
        //     const [model, keys] = channel;
        //     for (const key of [ ...keys ]) {
        //         const origin: Record<string, Model | Model[]> = model.agent.refer._draft
        //         const value = origin[key];
        //         if (Array.isArray(value)) {
        //             const index = value.indexOf(this.target);
        //             if (index === -1) continue;
        //             value.splice(index, 1);
        //         }
        //         if (value === this.target) delete origin[key];
        //     }
        // }
        // this.router.clear();
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

    @TranxService.span()
    private lset(key: string, origin: any, index: string, next: Model) {
        const prev = origin[index];
        if (Model.isModel(prev)) prev.agent.refer.unbind(this.target, key);
        if (Model.isModel(next)) next.agent.refer.bind(this.target, key);

        origin[index] = next;
        return true;
    }
    
    @TranxService.span()
    private ldel(key: string, origin: any, index: string) {
        const prev = origin[index];
        if (Model.isModel(prev)) prev.agent.refer.unbind(this.target, key);
        
        delete origin[index];
        return true;
    }


    @TranxService.span()
    private push(key: string, origin: Model[], ...next: Model[]) {
        for (const model of next) {
            if (!Model.isModel(model)) continue;
            model.agent.refer.bind(this.target, key);
        }
        const result = origin.push(...next);
        return result;
    }

    @TranxService.span()
    private unshift(key: string, origin: Model[], ...next: Model[]) {
        for (const model of next) {
            if (!Model.isModel(model)) continue;
            model.agent.refer.bind(this.target, key);
        }
        const result = origin.unshift(...next);
        return result;
    }

    @TranxService.span()
    private pop(key: string, origin: Model[]) {
        const result = origin.pop();
        if (Model.isModel(result)) result.agent.refer.unbind(this.target, key);
        return result;
    }


    @TranxService.span()
    private shift(key: string, origin: Model[]) {
        const result = origin.shift();
        if (Model.isModel(result)) result.agent.refer.unbind(this.target, key);
        return result;
    }

    @TranxService.span()
    private reverse(origin: Model[]) {
        return origin.reverse();
    }

    @TranxService.span()
    private sort(origin: Model[], handler: (a: Model, b: Model) => number) {
        return origin.sort(handler);
    }


    @TranxService.span()
    private fill(key: string, origin: Model[], value: Model, start?: number, end?: number) {
        if (start === undefined) start = 0;
        if (end === undefined) end = origin.length;

        const prev = origin.slice(start, end);
        for (const model of prev) {
            if (!Model.isModel(model)) continue;
            model.agent.refer.unbind(this.target, key);
        }

        const length = end - start;
        for (let index = 0; index < length; index++) {
            value.agent.refer.bind(this.target, key);
        }
        return origin.fill(value)
    }


    @TranxService.span()
    private splice(key: string, origin: Model[], start: number, count: number, ...next: Model[]) {
        const prev = origin.slice(start, start + count);
        for (const model of prev) {
            if (!Model.isModel(model)) continue;
            model.agent.refer.unbind(this.target, key);
        }

        for (const model of next) {
            if (!Model.isModel(model)) continue;
            model.agent.refer.bind(this.target, key);
        }

        const result = origin.splice(start, count, ...next);
        return result;
    }


}