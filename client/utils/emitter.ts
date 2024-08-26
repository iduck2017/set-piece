import type { App } from "../app";
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
