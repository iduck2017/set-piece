import { Agent } from "./agent";
import { Model } from "../model";
import { TranxService } from "../service/tranx";

export class ChildAgent<
    M extends Model = Model,
    C extends Model.C = Model.C,
> extends Agent<M> {

    public readonly draft: C;

    public get current(): Readonly<{ 
        [K in keyof C]: C[K] extends any[] ? Readonly<C[K]> : C[K] 
    }> {
        const result: any = {}
        for (const key of Object.keys(this.draft)) {
            const value = this.draft[key];
            result[key] = value instanceof Array ? [ ...value ] : value;
        }
        return result;
    }

    
    public get descendants(): Model[] {
        const result: Model[] = [];
        for (const key in this.draft) {
            const value = this.draft[key];
            if (value instanceof Array) {
                result.push(...value);
                value.forEach(value => {
                    result.push(...value.agent.child.descendants);
                })
            } else if (value) {
                result.push(value);
                result.push(...value.agent.child.descendants);
            }
        }
        return result;
    }
    
    constructor(target: M, props: () => C) {
        super(target);

        const child = props();
        const origin: any = {};
        for (const key in child) {
            let value: Model | Model[] | undefined = child[key];
            if (value instanceof Array) {
                origin[key] = [];
                value.forEach((value, index) => {
                    if (value.agent.route.isBind) value = value.copy();
                    origin[key].push(value);
                    origin[key][index].agent.route.bind(this.target, key);
                })
            } else if (value) {
                if (value.agent.route.isBind) value = value.copy();
                origin[key] = value;
                origin[key].agent.route.bind(this.target, key)
            }
        }
        this.draft = new Proxy({ ...origin }, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.del.bind(this),
        })
    }



    private get(origin: Record<string, Model | Model[] | undefined>, key: string) {
        const value = origin[key];
        if (value instanceof Array) return this.proxy(value, key);
        return value;
    }
   
    @TranxService.span()
    private set(
        origin: Record<string, Model | Model[] | undefined>, 
        key: string, 
        next: Model | Model[] | undefined
    ) {
        
        const prev = origin[key];
        if (prev instanceof Array) {
            prev.forEach(prev => {
                prev.agent.route.unbind()
            })
        } else prev?.agent.route.unbind();

        if (next instanceof Array) {
            next = next.map(next => {
                if (next.agent.route.isBind) next = next.copy();
                next.agent.route.bind(this.target, key);
                return next;
            });
        } else if (next) {
            if (next.agent.route.isBind) next = next.copy();
            next.agent.route.bind(this.target, key);
        }

        origin[key] = next;
        return true;
    }


    @TranxService.span()
    private del(origin: Record<string, Model | Model[] | undefined>, key: string) {
        const prev = origin[key];
        if (prev instanceof Array) {
            prev.forEach(prev => {
                prev.agent.route.unbind()
            })
        } else if (prev) {
            prev.agent.route.unbind();
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

    private lget(key: string,origin: any, index: string) {
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
    private lset(key: string, origin: Record<string, unknown>, index: string, next: Model) {
        const prev = origin[index];
        if (prev instanceof Model) prev.agent.route.unbind();
        if (next instanceof Model) {
            if (next.agent.route.isBind) next = next.copy();
            next.agent.route.bind(this.target, key);
        }
        origin[index] = next;
        return true;
    }
    
    @TranxService.span()
    private ldel(key: string, origin: any, index: string) {
        const prev = origin[index];
        if (prev instanceof Model) prev.agent.route.unbind();
        delete origin[index];
        return true;
    }


    @TranxService.span()
    private push(key: string, origin: Model[], ...next: Model[]) {
        next = next.map(next => {
            if (next.agent.route.isBind) next = next.copy();
            next.agent.route.bind(this.target, key);
            return next;
        });
        return origin.push(...next);
    }

    @TranxService.span()
    private unshift(key: string, origin: Model[], ...next: Model[]) {
        next = next.map(next => {
            if (next.agent.route.isBind) next = next.copy();
            next.agent.route.bind(this.target, key);
            return next;
        });
        return origin.unshift(...next);
    }


    @TranxService.span()
    private pop(key: string, origin: Model[]) {
        const result = origin.pop();
        if (result) result.agent.route.unbind();
        return result;
    }


    @TranxService.span()
    private shift(key: string, origin: Model[]) {
        const result = origin.shift();
        if (result) result.agent.route.unbind();
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
    private fill(key: string, origin: Model[], sample: Model, start?: number, end?: number) {
        start = start ?? 0;
        end = end ?? origin.length;

        const prev = origin.slice(start, end);
        prev.forEach(prev => {
            prev.agent.route.unbind();
        })

        const next = prev.map(() => {
            const next = sample.copy();
            next.agent.route.bind(this.target, key);
            return next;
        });
        origin.splice(start, end - start, ...next);
        return;
    }


    @TranxService.span()
    private splice(key: string, origin: Model[], start: number, count: number, ...next: Model[]) {
        const prev = origin.slice(start, start + count);
        prev.forEach(prev => {
            prev.agent.route.unbind();
        })

        next = next.map(next => {
            if (next.agent.route.isBind) next = next.copy();
            next.agent.route.bind(this.target, key);
            return next;
        });
        return origin.splice(start, count, ...next);
    }

}