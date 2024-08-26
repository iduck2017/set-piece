import type { App } from "../app";
import { Base } from "../type";
import type { EventReflect } from "../type/event";
import type { Handler } from "./handler";

export class Emitter<E = any, P = any> {
    public readonly id: string;
    public readonly app: App;
    public readonly parent: P;
    
    private readonly $handlerList: Array<Handler<E>> = [];
    public get handlerList() { return [ ...this.$handlerList ]; }

    constructor(
        config: string[],
        parent: P,
        app: App
    ) {
        const [ id, ...refer ] = config;
        this.id = id || app.referService.getUniqId();
        this.app = app;
        this.parent = parent;
        refer.forEach(key => {
            const handler = app.referService.handlerReferManager.referDict[key];
            if (handler) {
                this.bindHandler(handler);
            }
        });
    }

    public execute(event: E) {
        this.$handlerList.forEach(item => item.execute(event));
    }

    public bindHandler(handler: Handler<E>) {
        this.$addHandler(handler);
        handler.$addEmitter(this);
    }

    public unbindHandler(handler: Handler<E>) {
        this.$removeHandler(handler);
        handler.$removeEmitter(this);
    }

    private $addHandler(target: Handler<E>) {
        if (this.$handlerList.includes(target)) {
            throw new Error();
        }
        this.$handlerList.push(target);
    }

    private $removeHandler(target: Handler<E>) {
        const index = this.$handlerList.indexOf(target);
        if (index === -1) {
            throw new Error();
        }
        this.$handlerList.splice(index, 1);
    }
    
    public destroy() { 
        this.$handlerList.forEach(item => this.unbindHandler(item)); 
    }
    
    public serialize() {
        return [
            this.id,
            ...this.$handlerList.map(item => item.id)
        ];
    }

}

export class EmitterProxy<D extends Base.Dict, P = any> {
    private readonly $dict: EventReflect.EmitterDict<D>;

    public readonly executeIntf: EventReflect.ExecuteIntf<D>;
    public readonly bindIntf: EventReflect.BindIntf<D>;
    public readonly unbindIntf: EventReflect.BindIntf<D>;

    constructor(
        config: EventReflect.ChunkDict<D>,
        parent: P,
        app: App
    ) {
        const originDict = Object.keys(config).reduce((result, key) => ({
            ...result,
            [key]: new Emitter(config[key] || [], parent, app)
        }),  {} as EventReflect.EmitterDict<D>);
        this.$dict = new Proxy(originDict, {
            get: (target, key: keyof D) => {
                target[key] = target[key] || new Emitter<any, P>([], parent, app);
                return target[key];
            },
            set: () => false
        });
        this.executeIntf = new Proxy({} as EventReflect.ExecuteIntf<D>, {
            get: (target, key) => this.$dict[key].execute.bind(this.$dict[key]),
            set: () => false
        }); 
        this.bindIntf = new Proxy({} as EventReflect.BindIntf<D>, {
            get: (target, key) => this.$dict[key].bindHandler.bind(this.$dict[key]),
            set: () => false
        }); 
        this.unbindIntf = new Proxy({} as EventReflect.BindIntf<D>, {
            get: (target, key) => this.$dict[key].unbindHandler.bind(this.$dict[key]),
            set: () => false
        }); 
    }
}