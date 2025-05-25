import { TranxService } from "../service/tranx";
import { Model } from "../model";
import { Agent } from "./agent";

export class ReferAgent<
    M extends Model = Model,
    R1 extends Record<string, Model> = {},
    R2 extends Record<string, Model> = {}
> extends Agent<M> {
    public get current(): Readonly<
        { [K in keyof R1]?: R1[K] } &
        { [K in keyof R2]?: ReadonlyArray<Required<R2>[K]> }
    > { return { ...this.draft }; }


    public readonly draft: 
        { [K in keyof R1]?: R1[K] } &
        { [K in keyof R2]?: Array<Required<R2>[K]> }

    private readonly router: Map<Model, string[]>;


    constructor(target: M, props?: Readonly<
        { [K in keyof R1]?: R1[K] } &
        { [K in keyof R2]?: Array<Required<R2>[K]> }
    >) {
        super(target);
        this.router = new Map();

        const origin: any = {}
        for (const key in props) {
            let value: Model | Model[] | undefined = props[key];
            if (Array.isArray(value)) {
                origin[key] = [];
                for (const model of value) {
                    if (!Model.isModel(model)) continue;
                    origin[key].push(model);
                    model.agent.refer.bind(this.target, key);
                }
                origin[key] = this.array(origin[key], key);
            }
            if (Model.isModel(value)) {
                origin[key] = value;
                value.agent.refer.bind(this.target, key);
            }
        }

        this.draft = new Proxy(origin, {
            set: this.set.bind(this),
            deleteProperty: this.del.bind(this)
        });
    }

    private bind(value: Model, key: string) {
        const router = this.router.get(value) ?? [];
        router.push(key);
        this.router.set(value, router);
    }

    private unbind(value: Model, key: string) {
        const router = this.router.get(value) ?? [];
        const index = router.indexOf(key);
        if (index === -1) return;
        router.splice(index, 1);
        this.router.set(value, router);
    }

    @TranxService.span()
    private set(
        origin: Record<string, Model | Model[] | undefined>, 
        key: string, 
        value: Model | Model[] | undefined
    ) {
        let prev= origin[key];
        if (!prev) prev = [];
        if (!Array.isArray(prev)) prev = [prev];
        for (const model of prev) {
            if (!Model.isModel(model)) continue;
            model.agent.refer.unbind(this.target, key);
        }

        let next = value;
        if (!next) next = [];
        if (!Array.isArray(next)) next = [next];
        for (const model of next) {
            if (!Model.isModel(model)) continue;
            model.agent.refer.bind(this.target, key);
        }
        
        if (Array.isArray(value)) origin[key] = this.array(value, key);
        else origin[key] = value;
        return true
    }


    @TranxService.span()
    private del(origin: Record<string, Model | Model[] | undefined>, key: string) {
        let prev= origin[key];
        if (!prev) prev = [];
        if (!Array.isArray(prev)) prev = [prev];
        for (const model of prev) {
            if (!Model.isModel(model)) continue;
            model.agent.refer.unbind(this.target, key);
        }

        delete origin[key];
        return true;
    }


    public uninit() {
        for (const key of Object.keys(this.draft)) {
            delete this.draft[key]            
        }
        for (const channel of this.router) {
            const [model, keys] = channel;
            for (const key of keys) {
                const refer: Record<string, Model | Model[]> = model.agent.refer.draft
                const value = refer[key];
                if (Array.isArray(value)) {
                    const index = value.indexOf(this.target);
                    if (index === -1) continue;
                    value.splice(index, 1);
                }
                if (Model.isModel(value)) delete refer[key];
            }
        }
    }

    private array(value: Model[], key: string): Model[] {
        return new Proxy([ ...value ], {
            get: this.arrayGet.bind(this, key),
            set: this.arraySet.bind(this, key),
            deleteProperty: this.arrayDel.bind(this, key),
        })
    }

    private arrayGet(key: string,origin: any, index: string) {
        if (index === 'push') return this.arrayPush.bind(this, key, origin);
        if (index === 'pop') return this.arrayPop.bind(this, key, origin);
        if (index === 'shift') return this.arrayShift.bind(this, key, origin);
        if (index === 'unshift') return this.arrayUnshift.bind(this, key, origin);
        if (index === 'fill') return this.arrayFill.bind(this, key, origin);
        if (index === 'reverse') return this.arrayReverse.bind(this, origin);
        if (index === 'sort') return this.arraySort.bind(this, origin);
        if (index === 'splice') return this.arraySplice.bind(this, key, origin);
        return origin[index];
    }

    @TranxService.span()
    private arraySet(key: string, origin: any, index: string, next: Model) {
        const prev = origin[index];
        if (Model.isModel(prev)) prev.agent.refer.unbind(this.target, key);
        if (Model.isModel(next)) next.agent.refer.bind(this.target, key);

        origin[index] = next;
        return true;
    }
    
    @TranxService.span()
    private arrayDel(key: string, origin: any, index: string) {
        const prev = origin[index];
        if (Model.isModel(prev)) prev.agent.refer.unbind(this.target, key);
        
        delete origin[index];
        return true;
    }


    @TranxService.span()
    private arrayPush(key: string, origin: Model[], ...next: Model[]) {
        for (const model of next) {
            if (!Model.isModel(model)) continue;
            model.agent.refer.bind(this.target, key);
        }
        const result = origin.push(...next);
        return result;
    }

    @TranxService.span()
    private arrayUnshift(key: string, origin: Model[], ...next: Model[]) {
        for (const model of next) {
            if (!Model.isModel(model)) continue;
            model.agent.refer.bind(this.target, key);
        }
        const result = origin.unshift(...next);
        return result;
    }

    @TranxService.span()
    private arrayPop(key: string, origin: Model[]) {
        const result = origin.pop();
        if (Model.isModel(result)) result.agent.refer.unbind(this.target, key);
        return result;
    }


    @TranxService.span()
    private arrayShift(key: string, origin: Model[]) {
        const result = origin.shift();
        if (Model.isModel(result)) result.agent.refer.unbind(this.target, key);
        return result;
    }

    @TranxService.span()
    private arrayReverse(origin: Model[]) {
        return origin.reverse();
    }

    @TranxService.span()
    private arraySort(origin: Model[], handler: (a: Model, b: Model) => number) {
        return origin.sort(handler);
    }


    @TranxService.span()
    private arrayFill(key: string, origin: Model[], value: Model, start?: number, end?: number) {
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
    private arraySplice(key: string, origin: Model[], start: number, count: number, ...next: Model[]) {
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