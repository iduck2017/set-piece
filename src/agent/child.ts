import { Agent } from "./agent";
import { Model } from "../model";
import { TranxService } from "../service/tranx";

export class ChildAgent<
    M extends Model = Model,
    C1 extends Record<string, Model> = {},
    C2 extends Record<string, Model> = {},
> extends Agent<M> {

    public readonly draft: 
        { [K in keyof C1]: C1[K] } &
        { [K in keyof C2]: Array<Required<C2>[K]> };

    public get current(): Readonly<
        { [K in keyof C1]: C1[K] } &
        { [K in keyof C2]: ReadonlyArray<Required<C2>[K]> }
    > {
        return { ...this.draft };
    }
    

    constructor(target: M, props: Readonly<
        { [K in keyof C1]: C1[K] } &
        { [K in keyof C2]: Array<Required<C2>[K]> }
    >) {
        super(target);

        const origin: any = {};
        for (const key in props) {
            let value: Model | Model[] | undefined = props[key];
            if (Array.isArray(value)) {
                origin[key] = [];
                for (let index = 0; index < value.length; index++) {
                    let model = value[index];
                    if (!Model.isModel(model)) continue;
                    
                    const isLoad = model.agent.route.isLoad;
                    if (!isLoad) origin[key].push(model.copy());
                    else origin[key].push(model);

                    origin[key][index]?.agent.route.bind(this.target, key)
                }
                origin[key] = this.array(origin[key], key);
            }
            
            if (Model.isModel(value)) {
                const isLoad = value.agent.route.isLoad;
                if (!isLoad) origin[key] = value.copy();
                else origin[key] = value;
                
                origin[key]?.agent.route.bind(this.target, key)
            }
        }

        this.draft = new Proxy({ ...origin }, {
            set: this.set.bind(this),
            deleteProperty: this.del.bind(this),
        })
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
            model.agent.route.unbind();
        }


        let next = value;
        if (!next) next = [];
        if (!Array.isArray(next)) next = [next];
        for (let index = 0; index < next.length; index++) {
            const model = next[index];
            if (!Model.isModel(model)) continue;

            const isLoad = model.agent.route.isLoad;
            if (isLoad) next[index] = model.copy();
            model.agent.route.bind(this.target, key);
        }
        
        if (Array.isArray(value)) origin[key] = this.array(next, key);
        else origin[key] = next[0];

        for (const model of next) model.agent.route.load();
        return true
    }


    @TranxService.span()
    private del(origin: Record<string, Model | Model[] | undefined>, key: string) {
        let prev= origin[key];
        if (!prev) prev = [];
        if (!Array.isArray(prev)) prev = [prev];
        for (const model of prev) {
            if (!Model.isModel(model)) continue;
            model.agent.route.unbind();
        }

        delete origin[key];
        return true;
    }

    public load() {
        for (const key of Object.keys(this.current)) {
            let value: Model | Model[] | undefined = this.current[key];
            if (!value) continue;
            if (!Array.isArray(value)) value = [value] 
            for (const model of value) {
                if (!Model.isModel(model)) continue;
                model.agent.route.load();
            }
        }
    }

    public unload() {
        for (const key of Object.keys(this.current)) {
            let value: Model | Model[] | undefined = this.current[key];
            if (!value) continue;
            if (!Array.isArray(value)) value = [value] 
            for (const model of value) {
                if (!Model.isModel(model)) continue;
                model.agent.route.unload();
            }
        }
    }

    public uninit() {
        for (const key of Object.keys(this.current)) {
            let value: Model | Model[] | undefined = this.current[key];
            if (!value) continue;
            if (!Array.isArray(value)) value = [value] 
            for (const model of value) {
                if (!Model.isModel(model)) continue;
                model.agent.route.uninit();
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
        if (key === 'push') return this.arrayPush.bind(this, key, origin);
        if (key === 'pop') return this.arrayPop.bind(this, key, origin);
        if (key === 'shift') return this.arrayShift.bind(this, key, origin);
        if (key === 'unshift') return this.arrayUnshift.bind(this, key, origin);
        if (key === 'fill') return this.arrayFill.bind(this, key, origin);
        if (key === 'reverse') return this.arrayReverse.bind(this, origin);
        if (key === 'sort') return this.arraySort.bind(this, origin);
        if (key === 'splice') return this.arraySplice.bind(this, key, origin);
        return origin[index];
    }

    @TranxService.span()
    private arraySet(key: string, origin: any, index: string, next: Model) {
        const prev = origin[index];
        if (Model.isModel(prev)) prev.agent.route.unbind();
        if (Model.isModel(next)) {
            const isLoad = next.agent.route.isLoad;
            if (isLoad) next = next.copy();
            next.agent.route.bind(this.target, key);
        }

        origin[index] = next;
        
        if (Model.isModel(next)) next.agent.route.load();
        return true;
    }
    
    @TranxService.span()
    private arrayDel(key: string, origin: any, index: string) {
        const prev = origin[index];
        if (Model.isModel(prev)) prev.agent.route.unbind();
        delete origin[index];
        return true;
    }


    @TranxService.span()
    private arrayPush(key: string, origin: Model[], ...next: Model[]) {
        for (let index = 0; index < next.length; index++) {
            const model = next[index];
            if (!Model.isModel(model)) continue;
            
            const isLoad = model.agent.route.isLoad;
            if (isLoad) next[index] = model.copy();
            next[index]?.agent.route.bind(this.target, key);
        }

        const result = origin.push(...next);
        for (const model of next) model.agent.route.load();
        return result;
    }

    @TranxService.span()
    private arrayUnshift(key: string, origin: Model[], ...next: Model[]) {
        for (let index = 0; index < next.length; index++) {
            const model = next[index];
            if (!Model.isModel(model)) continue;
            
            const isLoad = model.agent.route.isLoad;
            if (isLoad) next[index] = model.copy();
            next[index]?.agent.route.bind(this.target, key);
        }

        const result = origin.unshift(...next);
        for (const model of next) model.agent.route.load();
        return result;
    }

    @TranxService.span()
    private arrayPop(key: string, origin: Model[]) {
        const result = origin.pop();
        if (Model.isModel(result)) result.agent.route.unbind();
        return result;
    }


    @TranxService.span()
    private arrayShift(key: string, origin: Model[]) {
        const result = origin.shift();
        if (Model.isModel(result)) result.agent.route.unbind();
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
    private arrayFill(key: string,origin: Model[], sample: Model, start?: number, end?: number) {
        if (start === undefined) start = 0;
        if (end === undefined) end = origin.length;

        const prev = origin.slice(start, end);
        for (const model of prev) {
            if (!Model.isModel(model)) continue;
            model.agent.route.unbind();
        }
        
        const next = new Array(end - start).fill(sample).map(sample => {
            const result = sample.copy();
            result.agent.route.bind(this.target, key);
            return result;
        });

        origin.splice(start, end - start, ...next);
        for (const model of next) model.agent.route.load();
        return origin;
    }


    @TranxService.span()
    private arraySplice(key: string, origin: Model[], start: number, count: number, ...next: Model[]) {
        const prev = origin.slice(start, start + count);
        for (const model of prev) {
            if (!Model.isModel(model)) continue;
            model.agent.route.unbind();
        }

        for (let index = 0; index < next.length; index++) {
            const model = next[index];
            if (!Model.isModel(model)) continue;
            
            const isLoad = model.agent.route.isLoad;
            if (isLoad) next[index] = model.copy();
            next[index]?.agent.route.bind(this.target, key);
        }

        const result = origin.splice(start, count, ...next);
        for (const model of next) model.agent.route.load();
        return result;
    }


}